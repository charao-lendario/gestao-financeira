import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { ParcelaController } from '../controllers/parcela.controller';
import { ParcelaService } from '../services/parcela.service';
import { ParcelaRepository } from '../repositories/parcela.repository';
import { validateRequest } from '../middleware/validation';
import { updateParcelaSchema, marcarPagoSchema } from '@gestao-financeira/shared/schemas';

export const createParcelaRoutes = (prisma: PrismaClient) => {
  const router = Router();

  const repository = new ParcelaRepository(prisma);
  const service = new ParcelaService(repository);
  const controller = new ParcelaController(service);

  router.get('/', (req, res) => controller.findAll(req, res));
  router.get('/atrasadas', (req, res) => controller.findAtrasadas(req, res));
  router.get('/proximas-vencer', (req, res) =>
    controller.findProximasVencer(req, res)
  );
  router.get('/:id', (req, res) => controller.findById(req, res));
  router.put('/:id', validateRequest(updateParcelaSchema), (req, res) =>
    controller.update(req, res)
  );
  router.post('/:id/pagar', validateRequest(marcarPagoSchema), (req, res) =>
    controller.marcarPago(req, res)
  );

  return router;
};
