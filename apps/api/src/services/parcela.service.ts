import { ParcelaRepository } from '../repositories/parcela.repository';
import { UpdateParcelaInput, MarcarPagoInput } from '@gestao-financeira/shared/schemas';

export class ParcelaService {
  constructor(private repository: ParcelaRepository) {}

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

    return this.repository.marcarPago(id, data);
  }

  async findAtrasadas() {
    return this.repository.findAtrasadas();
  }

  async findProximasVencer(dias: number = 7) {
    return this.repository.findProximasVencer(dias);
  }
}
