import { FormaPagamento } from '@gestao-financeira/shared';
import { formatCompetencia } from '@gestao-financeira/shared/utils';
import { generateParcelaId } from '../utils/id-generator';
import { Decimal } from '@prisma/client/runtime/library';

export interface ParcelaGerada {
  parcelaId: string;
  competencia: string;
  numeroParcela: number;
  dataVencimento: Date;
  valorPrevisto: Decimal;
}

export class GeradorParcelasService {
  /**
   * Gera parcelas baseado na forma de pagamento
   */
  static gerarParcelas(
    contratoId: string,
    formaPagamento: FormaPagamento,
    valorTotal: number,
    qtdParcelas?: number,
    diaVencimento?: number,
    dataInicioCobranca?: Date,
    dataFimCobranca?: Date
  ): ParcelaGerada[] {
    switch (formaPagamento) {
      case FormaPagamento.A_VISTA:
        return this.gerarParcelasAVista(contratoId, valorTotal, dataInicioCobranca);
      case FormaPagamento.PARCELADO:
        return this.gerarParcelasParcelado(
          contratoId,
          valorTotal,
          qtdParcelas || 3,
          diaVencimento || 15,
          dataInicioCobranca
        );
      case FormaPagamento.MENSALIDADE:
        return this.gerarParcelasMensalidade(
          contratoId,
          valorTotal,
          diaVencimento || 15,
          dataInicioCobranca,
          dataFimCobranca
        );
      default:
        throw new Error(`Forma de pagamento desconhecida: ${formaPagamento}`);
    }
  }

  /**
   * À vista: 1 parcela com valor total
   */
  private static gerarParcelasAVista(
    contratoId: string,
    valorTotal: number,
    dataInicioCobranca?: Date
  ): ParcelaGerada[] {
    const dataVencimento = dataInicioCobranca || new Date();
    const parcelaId = generateParcelaId(contratoId, 1);

    return [
      {
        parcelaId,
        competencia: formatCompetencia(dataVencimento),
        numeroParcela: 1,
        dataVencimento,
        valorPrevisto: new Decimal(valorTotal),
      },
    ];
  }

  /**
   * Parcelado: N parcelas iguais (resto na última)
   */
  private static gerarParcelasParcelado(
    contratoId: string,
    valorTotal: number,
    qtdParcelas: number,
    diaVencimento: number,
    dataInicioCobranca?: Date
  ): ParcelaGerada[] {
    const parcelas: ParcelaGerada[] = [];
    const dataInicio = dataInicioCobranca || new Date();

    const valorPorParcela = Math.floor((valorTotal * 100) / qtdParcelas) / 100;
    const resto = valorTotal - valorPorParcela * (qtdParcelas - 1);

    for (let i = 1; i <= qtdParcelas; i++) {
      const dataVencimento = new Date(dataInicio);
      dataVencimento.setMonth(dataVencimento.getMonth() + (i - 1));
      dataVencimento.setDate(diaVencimento);

      const valor = i === qtdParcelas ? resto : valorPorParcela;

      const parcelaId = generateParcelaId(contratoId, i);

      parcelas.push({
        parcelaId,
        competencia: formatCompetencia(dataVencimento),
        numeroParcela: i,
        dataVencimento,
        valorPrevisto: new Decimal(valor),
      });
    }

    return parcelas;
  }

  /**
   * Mensalidade: parcelas recorrentes até data fim (ou 12 meses inicialmente)
   */
  private static gerarParcelasMensalidade(
    contratoId: string,
    valorTotal: number,
    diaVencimento: number,
    dataInicioCobranca?: Date,
    dataFimCobranca?: Date
  ): ParcelaGerada[] {
    const parcelas: ParcelaGerada[] = [];
    const dataInicio = dataInicioCobranca || new Date();

    // Se não informar data fim, usar 12 meses
    let dataFim = dataFimCobranca;
    if (!dataFim) {
      dataFim = new Date(dataInicio);
      dataFim.setMonth(dataFim.getMonth() + 11);
    }

    // Calcular número de parcelas
    let mesAtual = dataInicio.getFullYear() * 12 + dataInicio.getMonth();
    let mesFim = dataFim.getFullYear() * 12 + dataFim.getMonth();
    const qtdParcelas = mesFim - mesAtual + 1;

    // Valor mensal
    const valorMensal = valorTotal / qtdParcelas;

    for (let i = 1; i <= qtdParcelas; i++) {
      const dataVencimento = new Date(dataInicio);
      dataVencimento.setMonth(dataVencimento.getMonth() + (i - 1));
      dataVencimento.setDate(diaVencimento);

      const parcelaId = generateParcelaId(contratoId, i);

      parcelas.push({
        parcelaId,
        competencia: formatCompetencia(dataVencimento),
        numeroParcela: i,
        dataVencimento,
        valorPrevisto: new Decimal(valorMensal),
      });
    }

    return parcelas;
  }
}
