import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateRequest =
  (schema: ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }
  };
