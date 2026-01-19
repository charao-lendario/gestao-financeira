import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { StatusUpdaterService } from '../services/status-updater.service';

export const startCronJobs = (prisma: PrismaClient) => {
  // Run at 00:00 every day to update overdue parcelas status
  const updateOverdueJob = cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running overdue parcelas status update...');
    try {
      await StatusUpdaterService.updateOverdueParcelas(prisma);
      console.log('[CRON] Overdue parcelas status updated successfully');
    } catch (error) {
      console.error('[CRON] Error updating overdue parcelas:', error);
    }
  });

  // Also run it on startup
  StatusUpdaterService.updateOverdueParcelas(prisma)
    .then(() => console.log('[STARTUP] Initial overdue parcelas status update completed'))
    .catch((error) => console.error('[STARTUP] Error during initial update:', error));

  return {
    updateOverdueJob,
  };
};

export const stopCronJobs = (jobs: any) => {
  Object.values(jobs).forEach((job: any) => {
    if (job && typeof job.stop === 'function') {
      job.stop();
    }
  });
  console.log('All cron jobs stopped');
};
