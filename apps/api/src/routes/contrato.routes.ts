import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { ContratoController } from '../controllers/contrato.controller';
import { ContratoService } from '../services/contrato.service';
import { ContratoRepository } from '../repositories/contrato.repository';
import { validateRequest } from '../middleware/validation';
import { createContratoSchema, updateContratoSchema } from '@gestao-financeira/shared/schemas';

export const createContratoRoutes = (prisma: PrismaClient) => {
  const router = Router();

  const repository = new ContratoRepository(prisma);
  const service = new ContratoService(repository, prisma);
  const controller = new ContratoController(service);

  router.post('/', validateRequest(createContratoSchema), (req, res) =>
    controller.create(req, res)
  );
  router.get('/', (req, res) => controller.findAll(req, res));
  router.get('/:id', (req, res) => controller.findById(req, res));
  router.get('/:id/parcelas', (req, res) => controller.getParcelas(req, res));
  router.post('/:id/gerar-parcelas', (req, res) =>
    controller.regenerateParcelas(req, res)
  );
  router.put('/:id', validateRequest(updateContratoSchema), (req, res) =>
    controller.update(req, res)
  );
  router.delete('/:id', (req, res) => controller.delete(req, res));

  return router;
};
