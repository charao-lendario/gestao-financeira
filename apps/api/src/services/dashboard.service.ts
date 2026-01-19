import { PrismaClient } from '@prisma/client';

export class DashboardService {
  constructor(private prisma: PrismaClient) {}

  async getResumoMensal(mes: number, ano: number) {
    const startDate = new Date(ano, mes - 1, 1);
    const endDate = new Date(ano, mes, 0);

    const [previsto, pago, atrasado] = await Promise.all([
      this.prisma.parcela.aggregate({
        where: {
          dataVencimento: {
            gte: startDate,
            lte: endDate,
          },
          status: 'PREVISTO',
        },
        _sum: {
          valorPrevisto: true,
        },
      }),
      this.prisma.parcela.aggregate({
        where: {
          dataVencimento: {
            gte: startDate,
            lte: endDate,
          },
          status: 'PAGO',
        },
        _sum: {
          valorPago: true,
        },
      }),
      this.prisma.parcela.aggregate({
        where: {
          dataVencimento: {
            gte: startDate,
            lte: endDate,
          },
          status: 'ATRASADO',
        },
        _sum: {
          valorPrevisto: true,
        },
      }),
    ]);

    const emAberto = Number(previsto._sum.valorPrevisto || 0);
    const pagRecebido = Number(pago._sum.valorPago || 0);
    const atrasadoTotal = Number(atrasado._sum.valorPrevisto || 0);

    return {
      previsto: emAberto,
      pago: pagRecebido,
      emAberto,
      atrasado: atrasadoTotal,
    };
  }

  async getProximosVencimentos(dias: number = 7) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + dias);

    const parcelas = await this.prisma.parcela.findMany({
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

    return {
      parcelas,
      dias,
    };
  }

  async getAtrasados() {
    const parcelas = await this.prisma.parcela.findMany({
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

    const totalAtrasado = parcelas.reduce(
      (sum, p) => sum + Number(p.valorPrevisto),
      0
    );

    return {
      parcelas,
      total: totalAtrasado,
      count: parcelas.length,
    };
  }

  async getResumoGeral() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalPrevisto,
      totalPago,
      totalAtrasado,
      clientesCount,
      contratosCount,
      parcelasCount,
    ] = await Promise.all([
      this.prisma.parcela.aggregate({
        where: {
          status: 'PREVISTO',
        },
        _sum: {
          valorPrevisto: true,
        },
      }),
      this.prisma.parcela.aggregate({
        where: {
          status: 'PAGO',
        },
        _sum: {
          valorPago: true,
        },
      }),
      this.prisma.parcela.aggregate({
        where: {
          status: 'ATRASADO',
        },
        _sum: {
          valorPrevisto: true,
        },
      }),
      this.prisma.cliente.count({
        where: {
          status: 'ATIVO',
        },
      }),
      this.prisma.contrato.count({
        where: {
          status: 'ATIVO',
        },
      }),
      this.prisma.parcela.count(),
    ]);

    return {
      previsto: Number(totalPrevisto._sum.valorPrevisto || 0),
      pago: Number(totalPago._sum.valorPago || 0),
      atrasado: Number(totalAtrasado._sum.valorPrevisto || 0),
      clientes: clientesCount,
      contratos: contratosCount,
      parcelas: parcelasCount,
    };
  }

  async getResumoMensalGrafico(ano: number) {
    const meses = [];

    for (let mes = 1; mes <= 12; mes++) {
      const startDate = new Date(ano, mes - 1, 1);
      const endDate = new Date(ano, mes, 0);

      const [previsto, pago] = await Promise.all([
        this.prisma.parcela.aggregate({
          where: {
            dataVencimento: {
              gte: startDate,
              lte: endDate,
            },
            status: 'PREVISTO',
          },
          _sum: {
            valorPrevisto: true,
          },
        }),
        this.prisma.parcela.aggregate({
          where: {
            dataVencimento: {
              gte: startDate,
              lte: endDate,
            },
            status: 'PAGO',
          },
          _sum: {
            valorPago: true,
          },
        }),
      ]);

      meses.push({
        mes,
        previsto: Number(previsto._sum.valorPrevisto || 0),
        pago: Number(pago._sum.valorPago || 0),
      });
    }

    return meses;
  }
}
