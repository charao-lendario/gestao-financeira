import { PrismaClient } from '@prisma/client';
import { ContratoRepository } from '../repositories/contrato.repository';
import { CreateContratoInput, UpdateContratoInput } from '@gestao-financeira/shared/schemas';
import { FormaPagamento } from '@gestao-financeira/shared';
import { GeradorParcelasService } from './gerador-parcelas.service';

export class ContratoService {
  constructor(
    private repository: ContratoRepository,
    private prisma: PrismaClient
  ) { }

  async create(data: CreateContratoInput) {
    // Validate client exists
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: data.clienteId },
    });

    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }

    // Validate payment method requirements
    if (data.formaPagamento === FormaPagamento.PARCELADO && !data.qtdParcelas) {
      throw new Error('Quantidade de parcelas é obrigatória para pagamento parcelado');
    }

    if (data.formaPagamento === FormaPagamento.MENSALIDADE && !data.diaVencimento) {
      throw new Error('Dia de vencimento é obrigatório para mensalidade');
    }

    // Validate rateio if present
    if (data.rateio && data.rateio.length > 0) {
      const totalPercent = data.rateio.reduce((sum, r) => sum + Number(r.percentual), 0);
      if (Math.abs(totalPercent - 100) > 0.01) {
        throw new Error('A soma das porcentagens do rateio deve ser 100%');
      }
    }

    const { rateio, ...contractData } = data;

    // Create contract
    const contrato = await this.repository.create(contractData as any);

    // Handle Rateio Creation
    if (rateio && rateio.length > 0) {
      await Promise.all(rateio.map(r =>
        this.prisma.rateioContrato.create({
          data: {
            contratoId: contrato.id,
            empresaId: r.empresaId,
            percentual: r.percentual
          }
        })
      ));
    }

    // Generate installments
    const parcelas = GeradorParcelasService.gerarParcelas(
      contrato.id,
      data.formaPagamento,
      Number(data.valorTotal),
      data.qtdParcelas,
      data.diaVencimento,
      data.dataInicioCobranca,
      data.dataFimCobranca
    );

    // Insert parcelas
    await Promise.all(
      parcelas.map((parcela) =>
        this.prisma.parcela.create({
          data: {
            ...parcela,
            contratoId: contrato.id,
            valorPrevisto: parcela.valorPrevisto,
          },
        })
      )
    );

    // Fetch contract with parcelas
    return this.repository.findById(contrato.id);
  }

  async findById(id: string) {
    const contrato = await this.repository.findById(id);
    if (!contrato) {
      throw new Error('Contrato não encontrado');
    }
    return contrato;
  }

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    clienteId?: string,
    status?: string
  ) {
    return this.repository.findAll(page, pageSize, clienteId, status);
  }

  async update(id: string, data: UpdateContratoInput) {
    const contrato = await this.findById(id);

    // Don't allow updating payment method or value for contracts with paid installments
    if (data.formaPagamento || data.valorTotal) {
      const paidParcelas = await this.prisma.parcela.findFirst({
        where: {
          contratoId: id,
          status: 'PAGO',
        },
      });

      if (paidParcelas) {
        throw new Error('Não é possível alterar contrato com parcelas pagas');
      }
    }

    return this.repository.update(id, data);
  }

  async delete(id: string) {
    const contrato = await this.findById(id);

    // Check if has paid installments
    const paidParcelas = await this.prisma.parcela.findFirst({
      where: {
        contratoId: id,
        status: 'PAGO',
      },
    });

    if (paidParcelas) {
      throw new Error('Não é possível deletar contrato com parcelas pagas');
    }

    return this.repository.delete(id);
  }

  async regenerateParcelas(contratoId: string) {
    const contrato = await this.findById(contratoId);

    // Delete existing parcelas
    await this.prisma.parcela.deleteMany({
      where: { contratoId },
    });

    // Generate new parcelas
    const parcelas = GeradorParcelasService.gerarParcelas(
      contrato.id,
      contrato.formaPagamento,
      Number(contrato.valorTotal),
      contrato.qtdParcelas || undefined,
      contrato.diaVencimento || undefined,
      contrato.dataInicioCobranca || undefined,
      contrato.dataFimCobranca || undefined
    );

    // Insert parcelas
    await Promise.all(
      parcelas.map((parcela) =>
        this.prisma.parcela.create({
          data: {
            ...parcela,
            contratoId: contrato.id,
            valorPrevisto: parcela.valorPrevisto,
          },
        })
      )
    );

    return this.repository.findById(contratoId);
  }

  async getParcelas(contratoId: string) {
    const contrato = await this.findById(contratoId);
    return this.repository.getParcelas(contratoId);
  }
}
