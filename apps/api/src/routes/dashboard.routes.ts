import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { DashboardController } from '../controllers/dashboard.controller';
import { DashboardService } from '../services/dashboard.service';

export const createDashboardRoutes = (prisma: PrismaClient) => {
  const router = Router();

  const service = new DashboardService(prisma);
  const controller = new DashboardController(service);

  router.get('/resumo-mensal', (req, res) => controller.getResumoMensal(req, res));
  router.get('/resumo-geral', (req, res) => controller.getResumoGeral(req, res));
  router.get('/proximos-vencimentos', (req, res) =>
    controller.getProximosVencimentos(req, res)
  );
  router.get('/atrasados', (req, res) => controller.getAtrasados(req, res));
  router.get('/grafico-mensal', (req, res) =>
    controller.getResumoMensalGrafico(req, res)
  );

  return router;
};
