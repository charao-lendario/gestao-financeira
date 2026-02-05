import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type {
  CommissionSettings,
  ProfitShareRecipient,
  UserPermission,
  AdminSettings
} from '../types';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

interface AdminContextType {
  isAdmin: boolean;
  isAdminLoggedIn: boolean;
  adminLogin: (username: string, password: string) => boolean;
  adminLogout: () => void;
  commissionSettings: CommissionSettings;
  profitShareRecipients: ProfitShareRecipient[];
  userPermissions: UserPermission[];
  allUsers: UserProfile[];
  updateCommissionSettings: (settings: CommissionSettings) => Promise<void>;
  addProfitShareRecipient: (recipient: Omit<ProfitShareRecipient, 'id'>) => Promise<void>;
  updateProfitShareRecipient: (id: string, recipient: Partial<ProfitShareRecipient>) => Promise<void>;
  deleteProfitShareRecipient: (id: string) => Promise<void>;
  updateUserPermission: (userId: string, userName: string, userEmail: string, permissions: UserPermission['permissions']) => Promise<void>;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | null>(null);

// Default settings
const defaultCommissionSettings: CommissionSettings = {
  sdrPercentage: 5,
  closerPercentage: 10
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [commissionSettings, setCommissionSettings] = useState<CommissionSettings>(defaultCommissionSettings);
  const [profitShareRecipients, setProfitShareRecipients] = useState<ProfitShareRecipient[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Check for admin session on mount
  useEffect(() => {
    const adminSession = localStorage.getItem('adminSession');
    if (adminSession === 'true') {
      setIsAdminLoggedIn(true);
    }
    loadAdminSettings();
  }, []);

  const loadAdminSettings = async () => {
    try {
      setLoading(true);

      // Load commission settings
      const { data: commissionData } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('key', 'commission_settings')
        .single();

      if (commissionData?.value) {
        setCommissionSettings(commissionData.value);
      }

      // Load profit share recipients
      const { data: recipientsData } = await supabase
        .from('profit_share_recipients')
        .select('*')
        .order('name', { ascending: true });

      if (recipientsData) {
        setProfitShareRecipients(recipientsData.map(r => ({
          id: r.id,
          name: r.name,
          type: r.type,
          document: r.document,
          percentage: r.percentage
        })));
      }

      // Load user permissions
      const { data: permissionsData } = await supabase
        .from('user_permissions')
        .select('*');

      if (permissionsData) {
        setUserPermissions(permissionsData.map(p => ({
          userId: p.user_id,
          userName: p.user_name,
          userEmail: p.user_email,
          permissions: p.permissions
        })));
      }

      // Load all user profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesData) {
        setAllUsers(profilesData.map(p => ({
          id: p.id,
          email: p.email,
          fullName: p.full_name || p.email,
          createdAt: p.created_at
        })));
      }

    } catch (error) {
      console.error('Error loading admin settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = (username: string, password: string): boolean => {
    // Simple admin authentication (should be improved for production)
    if (username === 'adm' && password === '123') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('adminSession', 'true');
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('adminSession');
  };

  const updateCommissionSettings = async (settings: CommissionSettings) => {
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          key: 'commission_settings',
          value: settings,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (error) throw error;
      setCommissionSettings(settings);
    } catch (error) {
      console.error('Error updating commission settings:', error);
      // Update locally even if DB fails
      setCommissionSettings(settings);
    }
  };

  const addProfitShareRecipient = async (recipient: Omit<ProfitShareRecipient, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('profit_share_recipients')
        .insert({
          name: recipient.name,
          type: recipient.type,
          document: recipient.document,
          percentage: recipient.percentage
        })
        .select()
        .single();

      if (error) throw error;

      const newRecipient: ProfitShareRecipient = {
        id: data.id,
        name: data.name,
        type: data.type,
        document: data.document,
        percentage: data.percentage
      };

      setProfitShareRecipients(prev => [...prev, newRecipient]);
    } catch (error) {
      console.error('Error adding profit share recipient:', error);
      // Add locally with temp id
      const tempRecipient: ProfitShareRecipient = {
        id: `temp_${Date.now()}`,
        ...recipient
      };
      setProfitShareRecipients(prev => [...prev, tempRecipient]);
    }
  };

  const updateProfitShareRecipient = async (id: string, updates: Partial<ProfitShareRecipient>) => {
    try {
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.document !== undefined) updateData.document = updates.document;
      if (updates.percentage !== undefined) updateData.percentage = updates.percentage;

      await supabase
        .from('profit_share_recipients')
        .update(updateData)
        .eq('id', id);

      setProfitShareRecipients(prev => prev.map(r =>
        r.id === id ? { ...r, ...updates } : r
      ));
    } catch (error) {
      console.error('Error updating profit share recipient:', error);
    }
  };

  const deleteProfitShareRecipient = async (id: string) => {
    try {
      await supabase
        .from('profit_share_recipients')
        .delete()
        .eq('id', id);

      setProfitShareRecipients(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting profit share recipient:', error);
    }
  };

  const updateUserPermission = async (userId: string, userName: string, userEmail: string, permissions: UserPermission['permissions']) => {
    try {
      await supabase
        .from('user_permissions')
        .upsert({
          user_id: userId,
          user_name: userName,
          user_email: userEmail,
          permissions,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      // Check if user already exists in permissions
      const existingIndex = userPermissions.findIndex(p => p.userId === userId);
      if (existingIndex >= 0) {
        setUserPermissions(prev => prev.map(p =>
          p.userId === userId ? { ...p, permissions } : p
        ));
      } else {
        // Add new permission entry
        setUserPermissions(prev => [...prev, {
          userId,
          userName,
          userEmail,
          permissions
        }]);
      }
    } catch (error) {
      console.error('Error updating user permissions:', error);
    }
  };

  return (
    <AdminContext.Provider value={{
      isAdmin: isAdminLoggedIn,
      isAdminLoggedIn,
      adminLogin,
      adminLogout,
      commissionSettings,
      profitShareRecipients,
      userPermissions,
      allUsers,
      updateCommissionSettings,
      addProfitShareRecipient,
      updateProfitShareRecipient,
      deleteProfitShareRecipient,
      updateUserPermission,
      loading
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin must be used within AdminProvider");
  return context;
};
