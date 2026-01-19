export * from '@gestao-financeira/shared';
export { clsx } from 'clsx';
export { twMerge } from 'tailwind-merge';

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
