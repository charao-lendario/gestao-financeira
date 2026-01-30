import { PrismaClient, Parcela, FormaRecebimento } from '@prisma/client';
import { UpdateParcelaInput, MarcarPagoInput } from '@gestao-financeira/shared/schemas';

export class ParcelaRepository {
  constructor(private prisma: PrismaClient) { }

  async findById(id: string): Promise<Parcela | null> {
    return this.prisma.parcela.findUnique({
      where: { id },
      include: {
        contrato: {
          include: { cliente: true },
        },
      },
    });
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
  ): Promise<{ parcelas: Parcela[]; total: number }> {
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.mes && filters?.ano) {
      const startDate = new Date(filters.ano, filters.mes - 1, 1);
      const endDate = new Date(filters.ano, filters.mes, 0);
      where.dataVencimento = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (filters?.clienteId) {
      where.contrato = {
        clienteId: filters.clienteId,
      };
    }

    const [parcelas, total] = await Promise.all([
      this.prisma.parcela.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          contrato: {
            include: {
              cliente: true,
              rateio: { include: { empresa: true } }
            },
          },
        },
        orderBy: { dataVencimento: 'asc' },
      }),
      this.prisma.parcela.count({ where }),
    ]);

    return { parcelas, total };
  }

  async update(id: string, data: UpdateParcelaInput): Promise<Parcela> {
    return this.prisma.parcela.update({
      where: { id },
      data: {
        ...data,
        formaRecebimento: data.formaRecebimento ? data.formaRecebimento as FormaRecebimento : undefined
      },
      include: {
        contrato: {
          include: { cliente: true },
        },
      },
    });
  }

  async marcarPago(id: string, data: MarcarPagoInput): Promise<Parcela> {
    return this.prisma.parcela.update({
      where: { id },
      data: {
        status: 'PAGO',
        dataPagamento: data.dataPagamento,
        valorPago: data.valorPago,
        formaRecebimento: data.formaRecebimento ? data.formaRecebimento as FormaRecebimento : undefined,
        diasAtraso: 0,
      },
      include: {
        contrato: {
          include: { cliente: true },
        },
      },
    });
  }

  async findAtrasadas(): Promise<Parcela[]> {
    return this.prisma.parcela.findMany({
      where: {
        status: 'ATRASADO',
      },
      include: {
        contrato: {
          include: { cliente: true },
        },
      },
      orderBy: { dataVencimento: 'asc' },
    });
  }

  async findProximasVencer(dias: number = 7): Promise<Parcela[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + dias);

    return this.prisma.parcela.findMany({
      where: {
        dataVencimento: {
          gte: today,
          lte: futureDate,
        },
        status: 'PREVISTO',
      },
      include: {
        contrato: {
          include: { cliente: true },
        },
      },
      orderBy: { dataVencimento: 'asc' },
    });
  }
}
