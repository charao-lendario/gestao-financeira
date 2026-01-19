import { z } from 'zod';
import { FormaPagamento, ClienteStatus, ContratoStatus, ParcelaStatus } from './types';

// Cliente Schemas
export const createClienteSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  documento: z.string().min(1, 'Documento é obrigatório'),
  contatoNome: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  cidade: z.string().optional(),
  uf: z.string().length(2, 'UF deve ter 2 caracteres').optional(),
  responsavelInterno: z.string().optional(),
});

export const updateClienteSchema = createClienteSchema.partial();

export type CreateClienteInput = z.infer<typeof createClienteSchema>;
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>;

// Contrato Schemas
export const createContratoSchema = z.object({
  clienteId: z.string().uuid('ID de cliente inválido'),
  nomeProjeto: z.string().min(1, 'Nome do projeto é obrigatório'),
  dataContrato: z.coerce.date(),
  valorTotal: z.coerce.number().positive('Valor total deve ser positivo'),
  formaPagamento: z.nativeEnum(FormaPagamento),
  qtdParcelas: z.coerce.number().int().positive().optional(),
  diaVencimento: z.coerce.number().int().min(1).max(31).optional(),
  dataInicioCobranca: z.coerce.date().optional(),
  dataFimCobranca: z.coerce.date().optional(),
  observacoes: z.string().optional(),
});

export const updateContratoSchema = createContratoSchema.partial();

export type CreateContratoInput = z.infer<typeof createContratoSchema>;
export type UpdateContratoInput = z.infer<typeof updateContratoSchema>;

// Parcela Schemas
export const updateParcelaSchema = z.object({
  dataPagamento: z.coerce.date().optional().or(z.null()),
  valorPago: z.coerce.number().positive().optional(),
  formaRecebimento: z.string().optional(),
  observacao: z.string().optional(),
});

export type UpdateParcelaInput = z.infer<typeof updateParcelaSchema>;

export const marcarPagoSchema = z.object({
  dataPagamento: z.coerce.date(),
  valorPago: z.coerce.number().positive('Valor pago deve ser positivo'),
  formaRecebimento: z.string().optional(),
});

export type MarcarPagoInput = z.infer<typeof marcarPagoSchema>;
