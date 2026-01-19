import { Request, Response } from 'express';
import { ContratoService } from '../services/contrato.service';

export class ContratoController {
  constructor(private service: ContratoService) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const contrato = await this.service.create(req.body);
      res.status(201).json({
        success: true,
        data: contrato,
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
      const clienteId = req.query.clienteId as string;
      const status = req.query.status as string;

      const { contratos, total } = await this.service.findAll(
        page,
        pageSize,
        clienteId,
        status
      );
      const totalPages = Math.ceil(total / pageSize);

      res.json({
        success: true,
        data: contratos,
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
      const contrato = await this.service.findById(req.params.id);
      res.json({
        success: true,
        data: contrato,
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
      const contrato = await this.service.update(req.params.id, req.body);
      res.json({
        success: true,
        data: contrato,
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
      const contrato = await this.service.delete(req.params.id);
      res.json({
        success: true,
        data: contrato,
      });
    } catch (error: any) {
      const statusCode = error.message.includes('paga') ? 400 : 404;
      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }

  async regenerateParcelas(req: Request, res: Response): Promise<void> {
    try {
      const contrato = await this.service.regenerateParcelas(req.params.id);
      res.json({
        success: true,
        data: contrato,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getParcelas(req: Request, res: Response): Promise<void> {
    try {
      const parcelas = await this.service.getParcelas(req.params.id);
      res.json({
        success: true,
        data: parcelas,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }
}
