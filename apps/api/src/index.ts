import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { createClienteRoutes } from './routes/cliente.routes';
import { createContratoRoutes } from './routes/contrato.routes';
import { createParcelaRoutes } from './routes/parcela.routes';
import { createDashboardRoutes } from './routes/dashboard.routes';
import { startCronJobs, stopCronJobs } from './jobs/cron-jobs';

const app: Express = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;
let cronJobs: any;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/v1/clientes', createClienteRoutes(prisma));
app.use('/api/v1/contratos', createContratoRoutes(prisma));
app.use('/api/v1/parcelas', createParcelaRoutes(prisma));
app.use('/api/v1/dashboard', createDashboardRoutes(prisma));

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  if (err.message.includes('validation')) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✓ Database connected');

    // Start cron jobs
    cronJobs = startCronJobs(prisma);
    console.log('✓ Cron jobs started');

    app.listen(port, () => {
      console.log(`✓ API running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  if (cronJobs) {
    stopCronJobs(cronJobs);
  }
  await prisma.$disconnect();
  process.exit(0);
});

export { app, prisma };
