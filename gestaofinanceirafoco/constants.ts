import { Company, Supplier, CreditCard, Installment, CashFlowMovement } from './types';

export const INITIAL_COMPANIES: Company[] = [
  { id: 'EMP-001', name: 'Grupo Focco', cnpj: '12.345.678/0001-90', initialBalance: 50000, currentBalance: 50000, status: 'ACTIVE', color: '#1e3a8a' },
  { id: 'EMP-002', name: 'People Tech', cnpj: '98.765.432/0001-10', initialBalance: 15000, currentBalance: 15000, status: 'ACTIVE', color: '#047857' },
  { id: 'EMP-003', name: 'MCT Invest', cnpj: '45.123.789/0001-55', initialBalance: 100000, currentBalance: 100000, status: 'ACTIVE', color: '#b45309' },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 'FORN-001', name: 'AWS Services', cnpj: '00.000.000/0000-01', category: 'Infraestrutura' },
  { id: 'FORN-002', name: 'WeWork Office', cnpj: '00.000.000/0000-02', category: 'Aluguel' },
  { id: 'FORN-003', name: 'Consultoria Fiscal', cnpj: '00.000.000/0000-03', category: 'Serviços' },
];

export const INITIAL_CARDS: CreditCard[] = [
  { id: 'CART-001', companyId: 'EMP-001', name: 'Nubank Corp', last4: '4321', limit: 20000, closingDay: 5, dueDay: 10 },
  { id: 'CART-002', companyId: 'EMP-002', name: 'Inter Black', last4: '8899', limit: 10000, closingDay: 20, dueDay: 25 },
];

// Mocking some future installments
export const INITIAL_INSTALLMENTS: Installment[] = [
  {
    id: 'PARC-101',
    contractId: 'CTR-001',
    contractDescription: 'Servidores AWS - Mensal',
    supplierName: 'AWS Services',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0], // Due in 2 days
    amount: 1200.00,
    status: 'PENDING',
    impactedCash: false,
    apportionment: [
      { companyId: 'EMP-001', percentage: 100, value: 1200.00 }
    ]
  },
  {
    id: 'PARC-102',
    contractId: 'CTR-002',
    contractDescription: 'Aluguel Escritório',
    supplierName: 'WeWork Office',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0], // Due in 5 days
    amount: 5000.00,
    status: 'PENDING',
    impactedCash: false,
    apportionment: [
      { companyId: 'EMP-001', percentage: 50, value: 2500.00 },
      { companyId: 'EMP-002', percentage: 50, value: 2500.00 }
    ]
  },
  {
    id: 'PARC-103',
    contractId: 'CTR-003',
    contractDescription: 'Consultoria Q1',
    supplierName: 'Consultoria Fiscal',
    dueDate: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString().split('T')[0], // Overdue by 3 days
    amount: 3000.00,
    status: 'OVERDUE',
    impactedCash: false,
    apportionment: [
      { companyId: 'EMP-003', percentage: 100, value: 3000.00 }
    ]
  }
];

export const INITIAL_CASHFLOW: CashFlowMovement[] = [];