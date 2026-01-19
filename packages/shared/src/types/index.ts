// Enums
export enum ClienteStatus {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
}

export enum FormaPagamento {
  A_VISTA = 'A_VISTA',
  PARCELADO = 'PARCELADO',
  MENSALIDADE = 'MENSALIDADE',
}

export enum ContratoStatus {
  ATIVO = 'ATIVO',
  FINALIZADO = 'FINALIZADO',
  CANCELADO = 'CANCELADO',
}

export enum ParcelaStatus {
  PREVISTO = 'PREVISTO',
  PAGO = 'PAGO',
  ATRASADO = 'ATRASADO',
  CANCELADO = 'CANCELADO',
}

export enum FormaRecebimento {
  PIX = 'PIX',
  TRANSFERENCIA = 'TRANSFERENCIA',
  BOLETO = 'BOLETO',
  CHEQUE = 'CHEQUE',
  CARTAO = 'CARTAO',
}

// Types
export interface Cliente {
  id: string;
  clienteId: string;
  nome: string;
  documento: string;
  contatoNome?: string;
  telefone?: string;
  email?: string;
  cidade?: string;
  uf?: string;
  responsavelInterno?: string;
  status: ClienteStatus;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Contrato {
  id: string;
  contratoId: string;
  clienteId: string;
  nomeProjeto: string;
  dataContrato: Date;
  valorTotal: number;
  formaPagamento: FormaPagamento;
  qtdParcelas?: number;
  diaVencimento?: number;
  dataInicioCobranca?: Date;
  dataFimCobranca?: Date;
  observacoes?: string;
  status: ContratoStatus;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Parcela {
  id: string;
  parcelaId: string;
  contratoId: string;
  competencia: string;
  numeroParcela: number;
  dataVencimento: Date;
  valorPrevisto: number;
  dataPagamento?: Date;
  valorPago?: number;
  status: ParcelaStatus;
  diasAtraso: number;
  formaRecebimento?: FormaRecebimento;
  comprovanteUrl?: string;
  observacao?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardResumo {
  previsto: number;
  pago: number;
  emAberto: number;
  atrasado: number;
}

export interface ProximosVencimentos {
  parcelas: Parcela[];
  dias: number;
}

export interface ParcelaAtrasada extends Parcela {
  diasAtraso: number;
}
