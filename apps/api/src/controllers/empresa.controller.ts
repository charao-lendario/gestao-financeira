import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export class EmpresaController {
    constructor(private prisma: PrismaClient) { }

    async findAll(req: Request, res: Response) {
        try {
            const empresas = await this.prisma.empresa.findMany({
                include: { cartoes: true },
                orderBy: { nome: 'asc' }
            });
            return res.json({ success: true, data: empresas });
        } catch (error: any) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
}
