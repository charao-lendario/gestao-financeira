import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
};

export const formatCompetencia = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MM/yyyy');
};

export const formatDateLong = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: ptBR });
};

export const parseDate = (dateString: string, formatStr: string = 'dd/MM/yyyy'): Date => {
  return parse(dateString, formatStr, new Date());
};

export const isOverdue = (dueDate: Date): boolean => {
  return new Date() > dueDate;
};

export const daysUntilDue = (dueDate: Date): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  const time = dueDate.getTime() - today.getTime();
  return Math.ceil(time / (1000 * 3600 * 24));
};

export const daysOverdue = (dueDate: Date): number => {
  const days = daysUntilDue(dueDate);
  return Math.abs(days);
};

export const getMonthYear = (date: Date = new Date()): { month: number; year: number } => {
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
};

export const getFirstDayOfMonth = (month: number, year: number): Date => {
  return new Date(year, month - 1, 1);
};

export const getLastDayOfMonth = (month: number, year: number): Date => {
  return new Date(year, month, 0);
};
