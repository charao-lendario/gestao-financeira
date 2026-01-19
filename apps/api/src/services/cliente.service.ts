import { ClienteRepository } from '../repositories/cliente.repository';
import { CreateClienteInput, UpdateClienteInput } from '@gestao-financeira/shared/schemas';
import { validateCPFOrCNPJ } from '@gestao-financeira/shared/utils';

export class ClienteService {
  constructor(private repository: ClienteRepository) {}

  async create(data: CreateClienteInput) {
    // Validate CPF/CNPJ
    if (!validateCPFOrCNPJ(data.documento)) {
      throw new Error('Documento inválido');
    }

    // Check if document already exists
    const existing = await this.repository.findByDocumento(data.documento);
    if (existing) {
      throw new Error('Documento já cadastrado');
    }

    return this.repository.create(data);
  }

  async findById(id: string) {
    const cliente = await this.repository.findById(id);
    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }
    return cliente;
  }

  async findAll(page: number = 1, pageSize: number = 10, search?: string) {
    return this.repository.findAll(page, pageSize, search);
  }

  async update(id: string, data: UpdateClienteInput) {
    const cliente = await this.findById(id);

    // If documento is being updated, validate it
    if (data.documento && data.documento !== cliente.documento) {
      if (!validateCPFOrCNPJ(data.documento)) {
        throw new Error('Documento inválido');
      }

      // Check if new document already exists
      const existing = await this.repository.findByDocumento(data.documento);
      if (existing && existing.id !== id) {
        throw new Error('Documento já cadastrado');
      }
    }

    return this.repository.update(id, data);
  }

  async delete(id: string) {
    const cliente = await this.findById(id);

    // Check if client has active contracts
    const contratos = await this.repository.findContratos(id);
    if (contratos.length > 0) {
      throw new Error('Cliente possui contratos ativos. Não é possível deletar.');
    }

    return this.repository.delete(id);
  }

  async findContratos(clienteId: string) {
    const cliente = await this.findById(clienteId);
    return this.repository.findContratos(clienteId);
  }
}
