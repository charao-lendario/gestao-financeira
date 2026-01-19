import { Request, Response } from 'express';
import { ParcelaService } from '../services/parcela.service';

export class ParcelaController {
  constructor(private service: ParcelaService) {}

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;

      const filters = {
        status: req.query.status as string,
        mes: req.query.mes ? parseInt(req.query.mes as string) : undefined,
        ano: req.query.ano ? parseInt(req.query.ano as string) : undefined,
        clienteId: req.query.clienteId as string,
      };

      const { parcelas, total } = await this.service.findAll(page, pageSize, filters);
      const totalPages = Math.ceil(total / pageSize);

      res.json({
        success: true,
        data: parcelas,
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
      const parcela = await this.service.findById(req.params.id);
      res.json({
        success: true,
        data: parcela,
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
      const parcela = await this.service.update(req.params.id, req.body);
      res.json({
        success: true,
        data: parcela,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async marcarPago(req: Request, res: Response): Promise<void> {
    try {
      const parcela = await this.service.marcarPago(req.params.id, req.body);
      res.json({
        success: true,
        data: parcela,
      });
    } catch (error: any) {
      const statusCode = error.message.includes('já foi') ? 409 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }

  async findAtrasadas(req: Request, res: Response): Promise<void> {
    try {
      const parcelas = await this.service.findAtrasadas();
      res.json({
        success: true,
        data: parcelas,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async findProximasVencer(req: Request, res: Response): Promise<void> {
    try {
      const dias = parseInt(req.query.dias as string) || 7;
      const parcelas = await this.service.findProximasVencer(dias);
      res.json({
        success: true,
        data: parcelas,
        dias,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
