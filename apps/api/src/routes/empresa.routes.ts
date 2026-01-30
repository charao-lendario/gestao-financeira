import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { EmpresaController } from '../controllers/empresa.controller';

export const createEmpresaRoutes = (prisma: PrismaClient) => {
    const router = Router();
    const controller = new EmpresaController(prisma);

    router.get('/', (req, res) => controller.findAll(req, res));

    return router;
};
