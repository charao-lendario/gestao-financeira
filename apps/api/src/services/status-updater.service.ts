import { PrismaClient } from '@prisma/client';
import { ParcelaStatus } from '@gestao-financeira/shared';

export class StatusUpdaterService {
  /**
   * Atualiza status de parcelas para ATRASADO se dataVencimento < hoje
   * e status é PREVISTO
   */
  static async updateOverdueParcelas(prisma: PrismaClient): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const result = await prisma.parcela.updateMany({
        where: {
          dataVencimento: {
            lt: today,
          },
          status: 'PREVISTO',
        },
        data: {
          status: 'ATRASADO',
        },
      });

      // Atualizar diasAtraso para as parcelas atrasadas
      const atrasadas = await prisma.parcela.findMany({
        where: {
          dataVencimento: {
            lt: today,
          },
          status: 'ATRASADO',
        },
      });

      for (const parcela of atrasadas) {
        const diasAtraso = Math.ceil(
          (today.getTime() - new Date(parcela.dataVencimento).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        await prisma.parcela.update({
          where: { id: parcela.id },
          data: { diasAtraso },
        });
      }

      console.log(`✓ Updated ${result.count} parcelas to ATRASADO status`);
      return result.count;
    } catch (error) {
      console.error('✗ Error updating overdue parcelas:', error);
      throw error;
    }
  }

  /**
   * Retorna parcelas atrasadas
   */
  static async getAtrasadas(prisma: PrismaClient) {
    return prisma.parcela.findMany({
      where: {
        status: 'ATRASADO',
      },
      include: {
        contrato: {
          include: {
            cliente: true,
          },
        },
      },
      orderBy: {
        dataVencimento: 'asc',
      },
    });
  }

  /**
   * Retorna total de dias em atraso
   */
  static async getTotalDiasAtraso(prisma: PrismaClient): Promise<number> {
    const result = await prisma.parcela.aggregate({
      where: {
        status: 'ATRASADO',
      },
      _sum: {
        diasAtraso: true,
      },
    });

    return result._sum.diasAtraso || 0;
  }
}
