import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { ClienteController } from '../controllers/cliente.controller';
import { ClienteService } from '../services/cliente.service';
import { ClienteRepository } from '../repositories/cliente.repository';
import { validateRequest } from '../middleware/validation';
import { createClienteSchema, updateClienteSchema } from '@gestao-financeira/shared/schemas';

export const createClienteRoutes = (prisma: PrismaClient) => {
  const router = Router();

  const repository = new ClienteRepository(prisma);
  const service = new ClienteService(repository);
  const controller = new ClienteController(service);

  router.post('/', validateRequest(createClienteSchema), (req, res) =>
    controller.create(req, res)
  );
  router.get('/', (req, res) => controller.findAll(req, res));
  router.get('/:id', (req, res) => controller.findById(req, res));
  router.get('/:id/contratos', (req, res) => controller.findContratos(req, res));
  router.put('/:id', validateRequest(updateClienteSchema), (req, res) =>
    controller.update(req, res)
  );
  router.delete('/:id', (req, res) => controller.delete(req, res));

  return router;
};
