import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type {
  Company,
  Supplier,
  Client,
  Contract,
  Installment,
  CreditCard as ICreditCard,
  CashFlowMovement,
  PaymentMethod,
  CostApportionment,
  Commission,
  SellerType,
  CommissionPaymentType
} from '../types';

interface FinanceContextType {
  companies: Company[];
  suppliers: Supplier[];
  clients: Client[];
  installments: Installment[];
  contracts: Contract[];
  cards: ICreditCard[];
  cashFlow: CashFlowMovement[];
  commissions: Commission[];
  selectedCompanyId: string;
  setSelectedCompanyId: (id: string) => void;
  addCompany: (company: Omit<Company, 'id' | 'status'>) => Promise<void>;
  updateCompany: (id: string, company: Partial<Omit<Company, 'id' | 'status'>>) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  addClient: (client: Omit<Client, 'id'>) => Promise<void>;
  addCard: (card: Omit<ICreditCard, 'id'>) => Promise<void>;
  addCashFlowMovement: (movement: Omit<CashFlowMovement, 'id' | 'balanceAfter'>) => Promise<void>;
  addContract: (contract: Omit<Contract, 'id' | 'status'>, installmentsData: { count: number, value: number, firstDueDate: string }) => Promise<string | null>;
  updateContract: (id: string, contract: Partial<Omit<Contract, 'id' | 'status'>>) => Promise<void>;
  addCommission: (commission: Omit<Commission, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  updateCommission: (id: string, commission: Partial<Omit<Commission, 'id' | 'status' | 'createdAt'>>) => Promise<void>;
  payInstallment: (installmentId: string, method: PaymentMethod, date: string, cardId?: string) => Promise<void>;
  loading: boolean;
  refreshData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [cards, setCards] = useState<ICreditCard[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowMovement[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Carregar dados do Supabase
  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Carregar empresas
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (companiesError) throw companiesError;

      const mappedCompanies: Company[] = (companiesData || []).map(c => ({
        id: c.id,
        name: c.name,
        cnpj: c.cnpj,
        initialBalance: c.initial_balance,
        currentBalance: c.current_balance,
        status: c.status as 'ACTIVE' | 'INACTIVE',
        color: c.color,
        logo: c.logo || undefined
      }));

      setCompanies(mappedCompanies);

      if (mappedCompanies.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(mappedCompanies[0].id);
      }

      // Carregar fornecedores
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (suppliersError) throw suppliersError;

      const mappedSuppliers: Supplier[] = (suppliersData || []).map(s => ({
        id: s.id,
        name: s.name,
        cnpj: s.cnpj,
        category: s.category
      }));

      setSuppliers(mappedSuppliers);

      // Carregar clientes
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (clientsError) throw clientsError;

      const mappedClients: Client[] = (clientsData || []).map(c => ({
        id: c.id,
        name: c.name,
        cnpj: c.cnpj,
        category: c.category
      }));

      setClients(mappedClients);

      // Carregar contratos
      const { data: contractsData, error: contractsError } = await supabase
        .from('contracts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (contractsError) throw contractsError;

      const mappedContracts: Contract[] = (contractsData || []).map(c => ({
        id: c.id,
        companyId: c.company_id,
        supplierId: c.supplier_id || undefined,
        clientId: c.client_id || undefined,
        contractType: (c.contract_type || 'SUPPLIER') as 'SUPPLIER' | 'CLIENT',
        description: c.description,
        startDate: c.start_date,
        endDate: c.end_date || undefined,
        totalValue: c.total_value,
        recurrence: c.recurrence as 'MONTHLY' | 'SINGLE' | 'INSTALLMENTS',
        installmentsCount: c.installments_count,
        status: c.status as 'ACTIVE' | 'ENDED' | 'CANCELLED'
      }));

      setContracts(mappedContracts);

      // Carregar parcelas
      const { data: installmentsData, error: installmentsError } = await supabase
        .from('installments')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (installmentsError) throw installmentsError;

      const mappedInstallments: Installment[] = (installmentsData || []).map(i => ({
        id: i.id,
        contractId: i.contract_id,
        contractDescription: i.contract_description,
        supplierName: i.supplier_name,
        dueDate: i.due_date,
        amount: i.amount,
        status: i.status as 'PENDING' | 'PAID' | 'OVERDUE',
        paymentDate: i.payment_date || undefined,
        paymentMethod: i.payment_method as PaymentMethod | undefined,
        cardId: i.card_id || undefined,
        impactedCash: i.impacted_cash,
        apportionment: i.apportionment as CostApportionment[]
      }));

      setInstallments(mappedInstallments);

      // Carregar cartões
      const { data: cardsData, error: cardsError } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (cardsError) throw cardsError;

      const mappedCards: ICreditCard[] = (cardsData || []).map(c => ({
        id: c.id,
        companyId: c.company_id,
        name: c.name,
        last4: c.last4,
        limit: c.limit_amount,
        closingDay: c.closing_day,
        dueDay: c.due_day
      }));

      setCards(mappedCards);

      // Carregar fluxo de caixa
      const { data: cashFlowData, error: cashFlowError } = await supabase
        .from('cash_flow_movements')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (cashFlowError) throw cashFlowError;

      const mappedCashFlow: CashFlowMovement[] = (cashFlowData || []).map(cf => ({
        id: cf.id,
        date: cf.date,
        companyId: cf.company_id,
        type: cf.type as 'INCOME' | 'EXPENSE',
        description: cf.description,
        amount: cf.amount,
        balanceAfter: cf.balance_after,
        originType: cf.origin_type as 'INSTALLMENT' | 'INVOICE' | 'MANUAL',
        originId: cf.origin_id || undefined
      }));

      setCashFlow(mappedCashFlow);

      // Carregar comissões
      const { data: commissionsData, error: commissionsError } = await supabase
        .from('commissions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (commissionsError) throw commissionsError;

      const mappedCommissions: Commission[] = (commissionsData || []).map(c => ({
        id: c.id,
        contractId: c.contract_id,
        companyId: c.company_id,
        sellerType: c.seller_type as 'SDR' | 'CLOSER',
        sellerName: c.seller_name,
        sellerAddress: c.seller_address,
        saleValue: c.sale_value,
        commissionPercentage: c.commission_percentage,
        commissionValue: c.commission_value,
        paymentType: c.payment_type as 'SINGLE' | 'INSTALLMENTS',
        installmentsCount: c.installments_count,
        status: c.status as 'PENDING' | 'PAID' | 'PARTIAL',
        createdAt: c.created_at
      }));

      setCommissions(mappedCommissions);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const refreshData = async () => {
    await loadData();
  };

  const addCompany = async (companyData: Omit<Company, 'id' | 'status'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({
          user_id: user.id,
          name: companyData.name,
          cnpj: companyData.cnpj,
          initial_balance: companyData.initialBalance,
          current_balance: companyData.currentBalance,
          color: companyData.color,
          logo: companyData.logo || null,
          status: 'ACTIVE'
        })
        .select()
        .single();

      if (error) throw error;

      const newCompany: Company = {
        id: data.id,
        name: data.name,
        cnpj: data.cnpj,
        initialBalance: data.initial_balance,
        currentBalance: data.current_balance,
        status: data.status,
        color: data.color,
        logo: data.logo || undefined
      };

      setCompanies(prev => [...prev, newCompany]);

      if (!selectedCompanyId) {
        setSelectedCompanyId(newCompany.id);
      }
    } catch (error) {
      console.error('Error adding company:', error);
      alert('Erro ao adicionar empresa');
    }
  };

  const updateCompany = async (id: string, companyData: Partial<Omit<Company, 'id' | 'status'>>) => {
    if (!user) return;

    try {
      const updateData: any = {};

      if (companyData.name !== undefined) updateData.name = companyData.name;
      if (companyData.cnpj !== undefined) updateData.cnpj = companyData.cnpj;
      if (companyData.color !== undefined) updateData.color = companyData.color;
      if (companyData.logo !== undefined) updateData.logo = companyData.logo || null;
      if (companyData.initialBalance !== undefined) updateData.initial_balance = companyData.initialBalance;
      if (companyData.currentBalance !== undefined) updateData.current_balance = companyData.currentBalance;

      const { data, error } = await supabase
        .from('companies')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedCompany: Company = {
        id: data.id,
        name: data.name,
        cnpj: data.cnpj,
        initialBalance: data.initial_balance,
        currentBalance: data.current_balance,
        status: data.status,
        color: data.color,
        logo: data.logo || undefined
      };

      setCompanies(prev => prev.map(c => c.id === id ? updatedCompany : c));
    } catch (error) {
      console.error('Error updating company:', error);
      alert('Erro ao atualizar empresa');
    }
  };

  const addSupplier = async (supplierData: Omit<Supplier, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert({
          user_id: user.id,
          name: supplierData.name,
          cnpj: supplierData.cnpj,
          category: supplierData.category
        })
        .select()
        .single();

      if (error) throw error;

      const newSupplier: Supplier = {
        id: data.id,
        name: data.name,
        cnpj: data.cnpj,
        category: data.category
      };

      setSuppliers(prev => [...prev, newSupplier]);
    } catch (error) {
      console.error('Error adding supplier:', error);
      alert('Erro ao adicionar fornecedor');
    }
  };

  const addClient = async (clientData: Omit<Client, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          name: clientData.name,
          cnpj: clientData.cnpj,
          category: clientData.category
        })
        .select()
        .single();

      if (error) throw error;

      const newClient: Client = {
        id: data.id,
        name: data.name,
        cnpj: data.cnpj,
        category: data.category
      };

      setClients(prev => [...prev, newClient]);
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Erro ao adicionar cliente');
    }
  };

  const addCard = async (cardData: Omit<ICreditCard, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('credit_cards')
        .insert({
          user_id: user.id,
          company_id: cardData.companyId,
          name: cardData.name,
          last4: cardData.last4,
          limit_amount: cardData.limit,
          closing_day: cardData.closingDay,
          due_day: cardData.dueDay
        })
        .select()
        .single();

      if (error) throw error;

      const newCard: ICreditCard = {
        id: data.id,
        companyId: data.company_id,
        name: data.name,
        last4: data.last4,
        limit: data.limit_amount,
        closingDay: data.closing_day,
        dueDay: data.due_day
      };

      setCards(prev => [...prev, newCard]);
    } catch (error) {
      console.error('Error adding card:', error);
      alert('Erro ao adicionar cartão');
    }
  };

  const addCashFlowMovement = async (movementData: Omit<CashFlowMovement, 'id' | 'balanceAfter'>) => {
    if (!user) return;

    try {
      const company = companies.find(c => c.id === movementData.companyId);
      if (!company) return;

      const newBalance = movementData.type === 'INCOME'
        ? company.currentBalance + movementData.amount
        : company.currentBalance - movementData.amount;

      // Inserir movimento
      const { data, error } = await supabase
        .from('cash_flow_movements')
        .insert({
          user_id: user.id,
          company_id: movementData.companyId,
          date: movementData.date,
          type: movementData.type,
          description: movementData.description,
          amount: movementData.amount,
          balance_after: newBalance,
          origin_type: movementData.originType,
          origin_id: movementData.originId || null
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar saldo da empresa
      const { error: updateError } = await supabase
        .from('companies')
        .update({ current_balance: newBalance })
        .eq('id', movementData.companyId);

      if (updateError) throw updateError;

      const newMovement: CashFlowMovement = {
        id: data.id,
        date: data.date,
        companyId: data.company_id,
        type: data.type,
        description: data.description,
        amount: data.amount,
        balanceAfter: data.balance_after,
        originType: data.origin_type,
        originId: data.origin_id
      };

      setCashFlow(prev => [newMovement, ...prev]);
      setCompanies(prev => prev.map(c =>
        c.id === movementData.companyId ? { ...c, currentBalance: newBalance } : c
      ));
    } catch (error) {
      console.error('Error adding cash flow movement:', error);
      alert('Erro ao adicionar movimentação');
    }
  };

  const addContract = async (
    contractData: Omit<Contract, 'id' | 'status'>,
    instData: { count: number, value: number, firstDueDate: string }
  ) => {
    if (!user) return;

    try {
      // Inserir contrato
      const { data: contractInserted, error: contractError } = await supabase
        .from('contracts')
        .insert({
          user_id: user.id,
          company_id: contractData.companyId,
          supplier_id: contractData.supplierId || null,
          client_id: contractData.clientId || null,
          contract_type: contractData.contractType || 'SUPPLIER',
          description: contractData.description,
          start_date: contractData.startDate,
          total_value: contractData.totalValue,
          recurrence: contractData.recurrence,
          installments_count: instData.count,
          status: 'ACTIVE'
        })
        .select()
        .single();

      if (contractError) throw contractError;

      const newContract: Contract = {
        id: contractInserted.id,
        companyId: contractInserted.company_id,
        supplierId: contractInserted.supplier_id || undefined,
        clientId: contractInserted.client_id || undefined,
        contractType: contractInserted.contract_type || 'SUPPLIER',
        description: contractInserted.description,
        startDate: contractInserted.start_date,
        totalValue: contractInserted.total_value,
        recurrence: contractInserted.recurrence,
        installmentsCount: contractInserted.installments_count,
        status: contractInserted.status
      };

      setContracts(prev => [...prev, newContract]);

      // Gerar parcelas
      const supplier = contractData.contractType === 'SUPPLIER'
        ? suppliers.find(s => s.id === contractData.supplierId)
        : null;
      const client = contractData.contractType === 'CLIENT'
        ? clients.find(c => c.id === contractData.clientId)
        : null;
      const entityName = supplier?.name || client?.name || (contractData.contractType === 'CLIENT' ? 'Cliente' : 'Fornecedor');
      const startDate = new Date(instData.firstDueDate);

      const installmentsToInsert = [];
      for (let i = 0; i < instData.count; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(startDate.getMonth() + i);

        const apportionment: CostApportionment[] = [{
          companyId: contractData.companyId,
          percentage: 100,
          value: instData.value
        }];

        installmentsToInsert.push({
          user_id: user.id,
          contract_id: contractInserted.id,
          contract_description: `${contractData.description} (${i + 1}/${instData.count})`,
          supplier_name: entityName,
          due_date: dueDate.toISOString().split('T')[0],
          amount: instData.value,
          status: 'PENDING',
          impacted_cash: false,
          apportionment: apportionment
        });
      }

      const { data: installmentsInserted, error: installmentsError } = await supabase
        .from('installments')
        .insert(installmentsToInsert)
        .select();

      if (installmentsError) throw installmentsError;

      const newInstallments: Installment[] = installmentsInserted.map(i => ({
        id: i.id,
        contractId: i.contract_id,
        contractDescription: i.contract_description,
        supplierName: i.supplier_name,
        dueDate: i.due_date,
        amount: i.amount,
        status: i.status,
        impactedCash: i.impacted_cash,
        apportionment: i.apportionment
      }));

      setInstallments(prev => [...prev, ...newInstallments]);
      return contractInserted.id;
    } catch (error) {
      console.error('Error adding contract:', error);
      alert('Erro ao adicionar contrato');
      return null;
    }
  };

  const updateContract = async (id: string, contractData: Partial<Omit<Contract, 'id' | 'status'>>) => {
    if (!user) return;

    try {
      const updateData: any = {};

      if (contractData.description !== undefined) updateData.description = contractData.description;
      if (contractData.startDate !== undefined) updateData.start_date = contractData.startDate;
      if (contractData.endDate !== undefined) updateData.end_date = contractData.endDate;
      if (contractData.totalValue !== undefined) updateData.total_value = contractData.totalValue;
      if (contractData.recurrence !== undefined) updateData.recurrence = contractData.recurrence;
      if (contractData.installmentsCount !== undefined) updateData.installments_count = contractData.installmentsCount;
      if (contractData.supplierId !== undefined) updateData.supplier_id = contractData.supplierId;
      if (contractData.clientId !== undefined) updateData.client_id = contractData.clientId;
      if (contractData.companyId !== undefined) updateData.company_id = contractData.companyId;
      if (contractData.contractType !== undefined) updateData.contract_type = contractData.contractType;

      const { data, error } = await supabase
        .from('contracts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedContract: Contract = {
        id: data.id,
        companyId: data.company_id,
        supplierId: data.supplier_id || undefined,
        clientId: data.client_id || undefined,
        contractType: data.contract_type || 'SUPPLIER',
        description: data.description,
        startDate: data.start_date,
        endDate: data.end_date || undefined,
        totalValue: data.total_value,
        recurrence: data.recurrence,
        installmentsCount: data.installments_count,
        status: data.status
      };

      setContracts(prev => prev.map(c => c.id === id ? updatedContract : c));
    } catch (error) {
      console.error('Error updating contract:', error);
      alert('Erro ao atualizar contrato');
    }
  };

  const addCommission = async (commissionData: Omit<Commission, 'id' | 'status' | 'createdAt'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('commissions')
        .insert({
          user_id: user.id,
          contract_id: commissionData.contractId,
          company_id: commissionData.companyId,
          seller_type: commissionData.sellerType,
          seller_name: commissionData.sellerName,
          seller_address: commissionData.sellerAddress,
          sale_value: commissionData.saleValue,
          commission_percentage: commissionData.commissionPercentage,
          commission_value: commissionData.commissionValue,
          payment_type: commissionData.paymentType,
          installments_count: commissionData.installmentsCount,
          status: 'PENDING'
        })
        .select()
        .single();

      if (error) throw error;

      const newCommission: Commission = {
        id: data.id,
        contractId: data.contract_id,
        companyId: data.company_id,
        sellerType: data.seller_type,
        sellerName: data.seller_name,
        sellerAddress: data.seller_address,
        saleValue: data.sale_value,
        commissionPercentage: data.commission_percentage,
        commissionValue: data.commission_value,
        paymentType: data.payment_type,
        installmentsCount: data.installments_count,
        status: data.status,
        createdAt: data.created_at
      };

      setCommissions(prev => [newCommission, ...prev]);
    } catch (error) {
      console.error('Error adding commission:', error);
      alert('Erro ao adicionar comissão');
    }
  };

  const updateCommission = async (id: string, commissionData: Partial<Omit<Commission, 'id' | 'status' | 'createdAt'>>) => {
    if (!user) return;

    try {
      const updateData: any = {};

      if (commissionData.sellerType !== undefined) updateData.seller_type = commissionData.sellerType;
      if (commissionData.sellerName !== undefined) updateData.seller_name = commissionData.sellerName;
      if (commissionData.sellerAddress !== undefined) updateData.seller_address = commissionData.sellerAddress;
      if (commissionData.saleValue !== undefined) updateData.sale_value = commissionData.saleValue;
      if (commissionData.commissionPercentage !== undefined) updateData.commission_percentage = commissionData.commissionPercentage;
      if (commissionData.commissionValue !== undefined) updateData.commission_value = commissionData.commissionValue;
      if (commissionData.paymentType !== undefined) updateData.payment_type = commissionData.paymentType;
      if (commissionData.installmentsCount !== undefined) updateData.installments_count = commissionData.installmentsCount;

      const { data, error } = await supabase
        .from('commissions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedCommission: Commission = {
        id: data.id,
        contractId: data.contract_id,
        companyId: data.company_id,
        sellerType: data.seller_type,
        sellerName: data.seller_name,
        sellerAddress: data.seller_address,
        saleValue: data.sale_value,
        commissionPercentage: data.commission_percentage,
        commissionValue: data.commission_value,
        paymentType: data.payment_type,
        installmentsCount: data.installments_count,
        status: data.status,
        createdAt: data.created_at
      };

      setCommissions(prev => prev.map(c => c.id === id ? updatedCommission : c));
    } catch (error) {
      console.error('Error updating commission:', error);
      alert('Erro ao atualizar comissão');
    }
  };

  const payInstallment = async (id: string, method: PaymentMethod, date: string, cardId?: string) => {
    if (!user) return;

    try {
      const installment = installments.find(i => i.id === id);
      if (!installment) return;

      // Atualizar parcela
      const { error: updateError } = await supabase
        .from('installments')
        .update({
          status: 'PAID',
          payment_date: date,
          payment_method: method,
          card_id: cardId || null,
          impacted_cash: method !== 'CREDIT_CARD'
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Atualizar estado local
      setInstallments(prev => prev.map(inst => {
        if (inst.id === id) {
          return {
            ...inst,
            status: 'PAID' as const,
            paymentDate: date,
            paymentMethod: method,
            cardId: cardId,
            impactedCash: method !== 'CREDIT_CARD'
          };
        }
        return inst;
      }));

      // Se não for cartão de crédito, impactar o caixa
      if (method !== 'CREDIT_CARD') {
        const movementsToInsert = [];
        const companiesToUpdate = [];

        // Determinar o tipo de movimento baseado no contrato
        const contract = contracts.find(c => c.id === installment.contractId);
        const isClientContract = contract?.contractType === 'CLIENT';
        const movementType = isClientContract ? 'INCOME' : 'EXPENSE';

        for (const split of installment.apportionment) {
          const company = companies.find(c => c.id === split.companyId);
          if (company) {
            const newBalance = isClientContract
              ? company.currentBalance + split.value
              : company.currentBalance - split.value;

            // Atualizar saldo da empresa
            const { error: companyError } = await supabase
              .from('companies')
              .update({ current_balance: newBalance })
              .eq('id', company.id);

            if (companyError) throw companyError;

            companiesToUpdate.push({ ...company, currentBalance: newBalance });

            // Criar movimento de caixa
            movementsToInsert.push({
              user_id: user.id,
              company_id: company.id,
              date: date,
              type: movementType,
              description: isClientContract
                ? `Receb. ${installment.contractDescription} (${installment.supplierName})`
                : `Pgto. ${installment.contractDescription} (${installment.supplierName})`,
              amount: split.value,
              balance_after: newBalance,
              origin_type: 'INSTALLMENT',
              origin_id: installment.id
            });
          }
        }

        // Inserir movimentos de caixa
        const { data: cashFlowInserted, error: cashFlowError } = await supabase
          .from('cash_flow_movements')
          .insert(movementsToInsert)
          .select();

        if (cashFlowError) throw cashFlowError;

        const newCashFlowMovements: CashFlowMovement[] = cashFlowInserted.map(cf => ({
          id: cf.id,
          date: cf.date,
          companyId: cf.company_id,
          type: cf.type,
          description: cf.description,
          amount: cf.amount,
          balanceAfter: cf.balance_after,
          originType: cf.origin_type,
          originId: cf.origin_id
        }));

        // Atualizar estados
        setCompanies(prev => prev.map(c => {
          const updated = companiesToUpdate.find(u => u.id === c.id);
          return updated || c;
        }));

        setCashFlow(prev => [...newCashFlowMovements, ...prev]);
      }
    } catch (error) {
      console.error('Error paying installment:', error);
      alert('Erro ao pagar parcela');
    }
  };

  return (
    <FinanceContext.Provider value={{
      companies,
      suppliers,
      clients,
      contracts,
      installments,
      cards,
      cashFlow,
      commissions,
      selectedCompanyId,
      setSelectedCompanyId,
      addCompany,
      updateCompany,
      addSupplier,
      addClient,
      addCard,
      addCashFlowMovement,
      addContract,
      updateContract,
      addCommission,
      updateCommission,
      payInstallment,
      loading,
      refreshData
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance must be used within FinanceProvider");
  return context;
};
