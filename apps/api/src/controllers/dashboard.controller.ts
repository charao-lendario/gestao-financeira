import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  constructor(private service: DashboardService) {}

  async getResumoMensal(req: Request, res: Response): Promise<void> {
    try {
      const now = new Date();
      const mes = parseInt(req.query.mes as string) || now.getMonth() + 1;
      const ano = parseInt(req.query.ano as string) || now.getFullYear();

      if (mes < 1 || mes > 12) {
        res.status(400).json({
          success: false,
          error: 'Mês inválido',
        });
        return;
      }

      const resumo = await this.service.getResumoMensal(mes, ano);
      res.json({
        success: true,
        data: resumo,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getProximosVencimentos(req: Request, res: Response): Promise<void> {
    try {
      const dias = parseInt(req.query.dias as string) || 7;
      const data = await this.service.getProximosVencimentos(dias);
      res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getAtrasados(req: Request, res: Response): Promise<void> {
    try {
      const data = await this.service.getAtrasados();
      res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getResumoGeral(req: Request, res: Response): Promise<void> {
    try {
      const data = await this.service.getResumoGeral();
      res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getResumoMensalGrafico(req: Request, res: Response): Promise<void> {
    try {
      const now = new Date();
      const ano = parseInt(req.query.ano as string) || now.getFullYear();

      const data = await this.service.getResumoMensalGrafico(ano);
      res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
