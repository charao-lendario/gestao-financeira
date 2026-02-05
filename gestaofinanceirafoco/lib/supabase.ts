import { createClient } from '@supabase/supabase-js';

// Valores fixos - sem depender de variáveis de ambiente
const supabaseUrl = 'https://hraoguqzqlouitpidcnc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyYW9ndXF6cWxvdWl0cGlkY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MDg3MDUsImV4cCI6MjA4NTM4NDcwNX0.OTI1bWH4y3Fbt3VKVrJvWErIxSp-KLYBY36NAyORj5A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Tipos do banco de dados
export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          cnpj: string;
          initial_balance: number;
          current_balance: number;
          status: 'ACTIVE' | 'INACTIVE';
          color: string;
          logo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          cnpj: string;
          initial_balance: number;
          current_balance: number;
          status?: 'ACTIVE' | 'INACTIVE';
          color?: string;
          logo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          cnpj?: string;
          initial_balance?: number;
          current_balance?: number;
          status?: 'ACTIVE' | 'INACTIVE';
          color?: string;
          logo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      suppliers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          cnpj: string;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          cnpj: string;
          category: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          cnpj?: string;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      contracts: {
        Row: {
          id: string;
          user_id: string;
          company_id: string;
          supplier_id: string;
          description: string;
          start_date: string;
          end_date: string | null;
          total_value: number;
          recurrence: 'MONTHLY' | 'SINGLE' | 'INSTALLMENTS';
          installments_count: number;
          status: 'ACTIVE' | 'ENDED' | 'CANCELLED';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_id: string;
          supplier_id: string;
          description: string;
          start_date: string;
          end_date?: string | null;
          total_value: number;
          recurrence: 'MONTHLY' | 'SINGLE' | 'INSTALLMENTS';
          installments_count?: number;
          status?: 'ACTIVE' | 'ENDED' | 'CANCELLED';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_id?: string;
          supplier_id?: string;
          description?: string;
          start_date?: string;
          end_date?: string | null;
          total_value?: number;
          recurrence?: 'MONTHLY' | 'SINGLE' | 'INSTALLMENTS';
          installments_count?: number;
          status?: 'ACTIVE' | 'ENDED' | 'CANCELLED';
          created_at?: string;
          updated_at?: string;
        };
      };
      installments: {
        Row: {
          id: string;
          user_id: string;
          contract_id: string;
          contract_description: string;
          supplier_name: string;
          due_date: string;
          amount: number;
          status: 'PENDING' | 'PAID' | 'OVERDUE';
          payment_date: string | null;
          payment_method: 'PIX' | 'BOLETO' | 'TRANSFER' | 'CREDIT_CARD' | null;
          card_id: string | null;
          impacted_cash: boolean;
          apportionment: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          contract_id: string;
          contract_description: string;
          supplier_name: string;
          due_date: string;
          amount: number;
          status?: 'PENDING' | 'PAID' | 'OVERDUE';
          payment_date?: string | null;
          payment_method?: 'PIX' | 'BOLETO' | 'TRANSFER' | 'CREDIT_CARD' | null;
          card_id?: string | null;
          impacted_cash?: boolean;
          apportionment?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          contract_id?: string;
          contract_description?: string;
          supplier_name?: string;
          due_date?: string;
          amount?: number;
          status?: 'PENDING' | 'PAID' | 'OVERDUE';
          payment_date?: string | null;
          payment_method?: 'PIX' | 'BOLETO' | 'TRANSFER' | 'CREDIT_CARD' | null;
          card_id?: string | null;
          impacted_cash?: boolean;
          apportionment?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      credit_cards: {
        Row: {
          id: string;
          user_id: string;
          company_id: string;
          name: string;
          last4: string;
          limit_amount: number;
          closing_day: number;
          due_day: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_id: string;
          name: string;
          last4: string;
          limit_amount: number;
          closing_day: number;
          due_day: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_id?: string;
          name?: string;
          last4?: string;
          limit_amount?: number;
          closing_day?: number;
          due_day?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      cash_flow_movements: {
        Row: {
          id: string;
          user_id: string;
          company_id: string;
          date: string;
          type: 'INCOME' | 'EXPENSE';
          description: string;
          amount: number;
          balance_after: number;
          origin_type: 'INSTALLMENT' | 'INVOICE' | 'MANUAL';
          origin_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_id: string;
          date: string;
          type: 'INCOME' | 'EXPENSE';
          description: string;
          amount: number;
          balance_after: number;
          origin_type: 'INSTALLMENT' | 'INVOICE' | 'MANUAL';
          origin_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_id?: string;
          date?: string;
          type?: 'INCOME' | 'EXPENSE';
          description?: string;
          amount?: number;
          balance_after?: number;
          origin_type?: 'INSTALLMENT' | 'INVOICE' | 'MANUAL';
          origin_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
