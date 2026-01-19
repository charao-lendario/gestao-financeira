import { PrismaClient, Cliente } from '@prisma/client';
import { CreateClienteInput, UpdateClienteInput } from '@gestao-financeira/shared/schemas';

export class ClienteRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateClienteInput): Promise<Cliente> {
    const lastCliente = await this.prisma.cliente.findFirst({
      orderBy: { criadoEm: 'desc' },
      select: { clienteId: true },
    });

    const lastNumber = lastCliente
      ? parseInt(lastCliente.clienteId.split('-')[1], 10)
      : 0;
    const nextNumber = lastNumber + 1;
    const clienteId = `CLT-${String(nextNumber).padStart(4, '0')}`;

    return this.prisma.cliente.create({
      data: {
        clienteId,
        ...data,
      },
    });
  }

  async findById(id: string): Promise<Cliente | null> {
    return this.prisma.cliente.findUnique({
      where: { id },
    });
  }

  async findByDocumento(documento: string): Promise<Cliente | null> {
    return this.prisma.cliente.findUnique({
      where: { documento },
    });
  }

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    search?: string
  ): Promise<{ clients: Cliente[]; total: number }> {
    const skip = (page - 1) * pageSize;

    const where = search
      ? {
          OR: [
            { nome: { contains: search, mode: 'insensitive' } },
            { documento: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { clienteId: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [clients, total] = await Promise.all([
      this.prisma.cliente.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { criadoEm: 'desc' },
      }),
      this.prisma.cliente.count({ where }),
    ]);

    return { clients, total };
  }

  async update(id: string, data: UpdateClienteInput): Promise<Cliente> {
    return this.prisma.cliente.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Cliente> {
    return this.prisma.cliente.delete({
      where: { id },
    });
  }

  async findContratos(clienteId: string) {
    return this.prisma.contrato.findMany({
      where: { clienteId },
      orderBy: { criadoEm: 'desc' },
    });
  }
}
