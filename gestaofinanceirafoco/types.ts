export type CompanyStatus = 'ACTIVE' | 'INACTIVE';
export type ContractStatus = 'ACTIVE' | 'ENDED' | 'CANCELLED';
export type InstallmentStatus = 'PENDING' | 'PAID' | 'OVERDUE';
export type PaymentMethod = 'PIX' | 'BOLETO' | 'TRANSFER' | 'CREDIT_CARD';

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  initialBalance: number;
  currentBalance: number;
  status: CompanyStatus;
  color: string; 
  logo?: string; // Base64 or URL
}

export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  category: string;
}

export interface Client {
  id: string;
  name: string;
  cnpj: string;
  category: string;
}

export type ContractType = 'SUPPLIER' | 'CLIENT';

export interface Contract {
  id: string;
  companyId: string; // The "owner" of the contract
  supplierId?: string; // For supplier contracts
  clientId?: string; // For client contracts
  contractType: ContractType; // SUPPLIER = expense, CLIENT = income
  description: string;
  startDate: string;
  endDate?: string;
  totalValue: number;
  recurrence: 'MONTHLY' | 'SINGLE' | 'INSTALLMENTS';
  installmentsCount: number; // If fixed installments
  status: ContractStatus;
}

export interface CostApportionment {
  companyId: string;
  percentage: number; // 0 to 100
  value: number;
}

export interface Installment {
  id: string;
  contractId: string;
  contractDescription: string;
  supplierName: string;
  dueDate: string; // YYYY-MM-DD
  amount: number;
  status: InstallmentStatus;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  cardId?: string;
  impactedCash: boolean;
  apportionment: CostApportionment[];
}

export interface CreditCard {
  id: string;
  companyId: string;
  name: string;
  last4: string;
  limit: number;
  closingDay: number;
  dueDay: number;
}

export interface CashFlowMovement {
  id: string;
  date: string;
  companyId: string;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  amount: number;
  balanceAfter: number;
  originType: 'INSTALLMENT' | 'INVOICE' | 'MANUAL' | 'COMMISSION';
  originId?: string;
  apportionment?: CostApportionment[];
}

export type SellerType = 'SDR' | 'CLOSER';
export type CommissionPaymentType = 'SINGLE' | 'INSTALLMENTS';
export type CommissionStatus = 'PENDING' | 'PAID' | 'PARTIAL';

export interface Commission {
  id: string;
  contractId: string;
  companyId: string;
  sellerType: SellerType;
  sellerName: string;
  sellerAddress: string;
  saleValue: number;
  commissionPercentage: number;
  commissionValue: number;
  paymentType: CommissionPaymentType;
  installmentsCount: number;
  status: CommissionStatus;
  createdAt: string;
}

// Admin Settings
export interface CommissionSettings {
  sdrPercentage: number;
  closerPercentage: number;
}

export interface ProfitShareRecipient {
  id: string;
  name: string;
  type: 'PERSON' | 'COMPANY';
  document: string; // CPF ou CNPJ
  percentage: number;
}

export interface UserPermission {
  userId: string;
  userName: string;
  userEmail: string;
  permissions: {
    dashboard: boolean;
    companies: boolean;
    contracts: boolean;
    agenda: boolean;
    cashflow: boolean;
    cards: boolean;
    commissions: boolean;
    clients: boolean;
    suppliers: boolean;
    monthlyClosing: boolean;
  };
}

export interface AdminSettings {
  commissionSettings: CommissionSettings;
  profitShareRecipients: ProfitShareRecipient[];
  userPermissions: UserPermission[];
}

export interface MonthlyClosing {
  id: string;
  companyId: string;
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  profitDistributions: {
    recipientId: string;
    recipientName: string;
    percentage: number;
    amount: number;
  }[];
  closedAt: string;
  closedBy: string;
}