import { PrismaClient, Contrato } from '@prisma/client';
import { CreateContratoInput, UpdateContratoInput } from '@gestao-financeira/shared/schemas';

export class ContratoRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateContratoInput): Promise<Contrato> {
    const year = new Date(data.dataContrato).getFullYear();

    const lastContrato = await this.prisma.contrato.findFirst({
      where: {
        dataContrato: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      },
      orderBy: { criadoEm: 'desc' },
      select: { contratoId: true },
    });

    const lastNumber = lastContrato
      ? parseInt(lastContrato.contratoId.split('-')[2], 10)
      : 0;
    const nextNumber = lastNumber + 1;
    const contratoId = `CTR-${year}-${String(nextNumber).padStart(4, '0')}`;

    return this.prisma.contrato.create({
      data: {
        contratoId,
        ...data,
      },
    });
  }

  async findById(id: string): Promise<Contrato | null> {
    return this.prisma.contrato.findUnique({
      where: { id },
      include: {
        cliente: true,
        parcelas: {
          orderBy: { numeroParcela: 'asc' },
        },
      },
    });
  }

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    clienteId?: string,
    status?: string
  ): Promise<{ contratos: Contrato[]; total: number }> {
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (clienteId) where.clienteId = clienteId;
    if (status) where.status = status;

    const [contratos, total] = await Promise.all([
      this.prisma.contrato.findMany({
        where,
        skip,
        take: pageSize,
        include: { cliente: true },
        orderBy: { criadoEm: 'desc' },
      }),
      this.prisma.contrato.count({ where }),
    ]);

    return { contratos, total };
  }

  async update(id: string, data: UpdateContratoInput): Promise<Contrato> {
    return this.prisma.contrato.update({
      where: { id },
      data,
      include: {
        cliente: true,
        parcelas: true,
      },
    });
  }

  async delete(id: string): Promise<Contrato> {
    return this.prisma.contrato.delete({
      where: { id },
    });
  }

  async getParcelas(contratoId: string) {
    return this.prisma.parcela.findMany({
      where: { contratoId },
      orderBy: { numeroParcela: 'asc' },
    });
  }
}
