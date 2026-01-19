import { Request, Response } from 'express';
import { ClienteService } from '../services/cliente.service';

export class ClienteController {
  constructor(private service: ClienteService) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const cliente = await this.service.create(req.body);
      res.status(201).json({
        success: true,
        data: cliente,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const search = req.query.search as string;

      const { clients, total } = await this.service.findAll(page, pageSize, search);
      const totalPages = Math.ceil(total / pageSize);

      res.json({
        success: true,
        data: clients,
        pagination: {
          total,
          page,
          pageSize,
          totalPages,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const cliente = await this.service.findById(req.params.id);
      res.json({
        success: true,
        data: cliente,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const cliente = await this.service.update(req.params.id, req.body);
      res.json({
        success: true,
        data: cliente,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const cliente = await this.service.delete(req.params.id);
      res.json({
        success: true,
        data: cliente,
      });
    } catch (error: any) {
      const statusCode = error.message.includes('ativo') ? 400 : 404;
      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }

  async findContratos(req: Request, res: Response): Promise<void> {
    try {
      const contratos = await this.service.findContratos(req.params.id);
      res.json({
        success: true,
        data: contratos,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }
}
