import { ParcelaRepository } from '../repositories/parcela.repository';
import { UpdateParcelaInput, MarcarPagoInput } from '@gestao-financeira/shared/schemas';
import { PrismaClient } from '@prisma/client';

export class ParcelaService {
  constructor(
    private repository: ParcelaRepository,
    private prisma: PrismaClient
  ) { }

  async findById(id: string) {
    const parcela = await this.repository.findById(id);
    if (!parcela) {
      throw new Error('Parcela não encontrada');
    }
    return parcela;
  }

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    filters?: {
      status?: string;
      mes?: number;
      ano?: number;
      clienteId?: string;
    }
  ) {
    return this.repository.findAll(page, pageSize, filters);
  }

  async update(id: string, data: UpdateParcelaInput) {
    const parcela = await this.findById(id);

    // If marking as paid without proper data
    if (data.dataPagamento && !data.valorPago) {
      throw new Error('Valor pago é obrigatório quando marcando como paga');
    }

    return this.repository.update(id, data);
  }

  async marcarPago(id: string, data: MarcarPagoInput) {
    const parcela = await this.findById(id);

    if (parcela.status === 'PAGO') {
      throw new Error('Parcela já foi marcada como paga');
    }

    // Validate valor pago doesn't exceed valor previsto
    if (
      data.valorPago > Number(parcela.valorPrevisto) * 1.1
    ) {
      throw new Error('Valor pago não pode ser 10% maior que o previsto');
    }

    // Update Cartao ID if present
    if (data.cartaoCreditoId) {
      await this.prisma.parcela.update({
        where: { id },
        data: { cartaoId: data.cartaoCreditoId }
      });
    }

    const result = await this.repository.marcarPago(id, data);

    // Business Logic: Real Cash Flow (MovimentacaoCaixa)
    // Only if NOT credit card
    if (!data.cartaoCreditoId) {
      const rateios = await this.prisma.rateioContrato.findMany({
        where: { contratoId: parcela.contratoId },
        include: { empresa: true }
      });

      const valor = Number(data.valorPago);
      const date = new Date(data.dataPagamento);
      const desc = `Pagamento Parc. ${parcela.numeroParcela} - ${parcela.contrato.nomeProjeto}`;

      if (rateios.length > 0) {
        // Split
        for (const r of rateios) {
          const valorPart = valor * (Number(r.percentual) / 100);
          await this.prisma.movimentacaoCaixa.create({
            data: {
              data: date,
              valor: valorPart,
              tipo: 'SAIDA',
              descricao: `${desc} (${r.empresa.nome})`,
              empresaId: r.empresaId,
              parcelaId: id
            }
          });
        }
      } else {
        // Default Company
        const defaultEmpresa = await this.prisma.empresa.findFirst({ where: { padrao: true } });
        if (defaultEmpresa) {
          await this.prisma.movimentacaoCaixa.create({
            data: {
              data: date,
              valor: valor,
              tipo: 'SAIDA',
              descricao: desc,
              empresaId: defaultEmpresa.id,
              parcelaId: id
            }
          });
        } else {
          const anyEmp = await this.prisma.empresa.findFirst();
          if (anyEmp) {
            await this.prisma.movimentacaoCaixa.create({
              data: {
                data: date,
                valor: valor,
                tipo: 'SAIDA',
                descricao: desc,
                empresaId: anyEmp.id,
                parcelaId: id
              }
            });
          }
        }
      }
    }

    return result;
  }

  async findAtrasadas() {
    return this.repository.findAtrasadas();
  }

  async findProximasVencer(dias: number = 7) {
    return this.repository.findProximasVencer(dias);
  }
}
