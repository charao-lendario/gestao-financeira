import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  FileText,
  CreditCard,
  ArrowRightLeft,
  LogOut,
  Bell,
  Search,
  Plus,
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingDown,
  ChevronDown,
  Calendar as CalendarIcon,
  List,
  Upload,
  Briefcase,
  X,
  Menu,
  Home,
  Wallet,
  Settings,
  ChevronRight,
  Pencil,
  DollarSign,
  BadgePercent,
  Shield,
  Trash2,
  Lock
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Company,
  Supplier,
  Contract,
  Installment,
  CreditCard as ICreditCard,
  CashFlowMovement,
  PaymentMethod,
  CostApportionment,
  Commission,
  ProfitShareRecipient
} from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FinanceProvider, useFinance } from './contexts/FinanceContext';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import { LoginPage } from './components/LoginPage';

// --- HOOKS ---
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// --- UTILS ---
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

// Context is now imported from separate files

// --- COMPONENTS ---

const LogoPlaceholder = ({ name, color, size = "md" }: { name: string, color: string, size?: "sm" | "md" | "lg" }) => {
  const sizeClass = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-24 h-24 text-2xl" : "w-12 h-12 text-lg";
  return (
    <div className={`${sizeClass} rounded-lg flex items-center justify-center text-white font-bold shadow-sm`} style={{ backgroundColor: color }}>
      {name.substring(0, 2).toUpperCase()}
    </div>
  );
};

// --- MOBILE COMPONENTS ---

// Mobile Bottom Navigation
const MobileBottomNav = ({ activePage, setActivePage }: { activePage: string, setActivePage: (p: string) => void }) => {
  const mainItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'contracts', label: 'Contratos', icon: Briefcase },
    { id: 'agenda', label: 'Parcelas', icon: FileText },
    { id: 'cashflow', label: 'Caixa', icon: Wallet },
    { id: 'more', label: 'Mais', icon: Menu },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 md:hidden safe-area-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id || (item.id === 'more' && ['companies', 'cards', 'suppliers'].includes(activePage));
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
                isActive ? 'text-amber-500' : 'text-slate-400'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] mt-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// Mobile Header
const MobileHeader = ({ title, onMenuOpen }: { title: string, onMenuOpen?: () => void }) => {
  const { companies, selectedCompanyId } = useFinance();
  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || companies[0];

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-40 md:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {selectedCompany?.logo ? (
            <img src={selectedCompany.logo} alt={selectedCompany.name} className="w-8 h-8 rounded-lg object-cover" />
          ) : selectedCompany ? (
            <LogoPlaceholder name={selectedCompany.name} color={selectedCompany.color} size="sm" />
          ) : null}
          <div>
            <h1 className="text-base font-bold text-slate-900">{title}</h1>
            <p className="text-xs text-slate-500 truncate max-w-[150px]">{selectedCompany?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

// Mobile More Menu (Sheet/Drawer)
const MobileMoreMenu = ({ isOpen, onClose, activePage, setActivePage }: {
  isOpen: boolean,
  onClose: () => void,
  activePage: string,
  setActivePage: (p: string) => void
}) => {
  const { companies, selectedCompanyId, setSelectedCompanyId } = useFinance();
  const { signOut } = useAuth();
  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || companies[0];

  const menuItems = [
    { id: 'companies', label: 'Minha Empresa', icon: Building2, description: 'Configurações da empresa' },
    { id: 'cards', label: 'Cartões', icon: CreditCard, description: 'Gerenciar cartões de crédito' },
    { id: 'suppliers', label: 'Fornecedores', icon: Users, description: 'Lista de fornecedores' },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 md:hidden animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 md:hidden animate-in slide-in-from-bottom duration-300">
        <div className="bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-slate-300 rounded-full" />
          </div>

          {/* Company Switcher */}
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Empresa Selecionada</p>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              {selectedCompany?.logo ? (
                <img src={selectedCompany.logo} alt={selectedCompany.name} className="w-10 h-10 rounded-lg object-cover" />
              ) : selectedCompany ? (
                <LogoPlaceholder name={selectedCompany.name} color={selectedCompany.color} size="sm" />
              ) : null}
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{selectedCompany?.name}</p>
                <p className="text-xs text-slate-500">{selectedCompany?.cnpj}</p>
              </div>
              <ChevronDown size={18} className="text-slate-400" />
            </div>

            {/* Other companies */}
            {companies.length > 1 && (
              <div className="mt-2 space-y-1">
                {companies.filter(c => c.id !== selectedCompanyId).map(company => (
                  <button
                    key={company.id}
                    onClick={() => { setSelectedCompanyId(company.id); onClose(); }}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: company.color }} />
                    <span className="text-sm text-slate-600">{company.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="px-4 py-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActivePage(item.id); onClose(); }}
                    className={`w-full flex items-center gap-4 p-3 rounded-xl transition-colors ${
                      isActive ? 'bg-amber-50 text-amber-600' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-amber-100' : 'bg-slate-100'}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Logout */}
          <div className="px-4 py-4 border-t border-slate-100 mb-safe">
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 p-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Sair da conta</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// 1. Sidebar with Company Switcher
const Sidebar = ({ activePage, setActivePage }: { activePage: string, setActivePage: (p: string) => void }) => {
  const { companies, selectedCompanyId, setSelectedCompanyId } = useFinance();
  const { signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNewCompanyModal, setShowNewCompanyModal] = useState(false);

  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || companies[0];

  const handleLogout = async () => {
    await signOut();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'companies', label: 'Empresa', icon: Building2 }, // Singular because it shows specific company info
    { id: 'contracts', label: 'Contratos', icon: Briefcase },
    { id: 'agenda', label: 'Agenda / Parcelas', icon: FileText },
    { id: 'cashflow', label: 'Fluxo de Caixa', icon: ArrowRightLeft },
    { id: 'cards', label: 'Cartões', icon: CreditCard },
    { id: 'commissions', label: 'Comissões', icon: BadgePercent },
    { id: 'closing', label: 'Fechamento', icon: DollarSign },
    { id: 'clients', label: 'Clientes', icon: UserCheck },
    { id: 'suppliers', label: 'Fornecedores', icon: Users },
    { id: 'admin', label: 'Admin', icon: Shield },
  ];

  return (
    <>
      <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl z-20">
        {/* Company Header / Switcher */}
        <div className="p-4 border-b border-slate-700 bg-slate-950 relative">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:bg-slate-800 p-2 rounded-lg transition-colors ring-offset-2 ring-offset-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            role="button"
          >
            {selectedCompany.logo ? (
              <img src={selectedCompany.logo} alt={selectedCompany.name} className="w-10 h-10 rounded-lg object-cover bg-white" />
            ) : (
              <LogoPlaceholder name={selectedCompany.name} color={selectedCompany.color} size="sm" />
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold truncate text-amber-500">{selectedCompany.name}</h2>
              <p className="text-xs text-slate-400 truncate">Selecionada</p>
            </div>
            <ChevronDown size={16} className={`text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Dropdown Overlay for clicking outside */}
          {isDropdownOpen && (
             <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
          )}

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-20 left-4 w-56 bg-white rounded-lg shadow-xl py-2 z-50 text-slate-800 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 origin-top-left">
              <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Trocar Empresa</p>
              <div className="max-h-60 overflow-y-auto scrollbar-thin">
                {companies.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCompanyId(c.id); setIsDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-3 transition-colors ${selectedCompanyId === c.id ? 'bg-amber-50 text-amber-700 font-medium' : 'text-slate-600'}`}
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor: c.color}}></div>
                    <span className="truncate">{c.name}</span>
                    {selectedCompanyId === c.id && <CheckCircle size={14} className="ml-auto text-amber-600" />}
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-100 mt-2 pt-2">
                <button 
                  onClick={() => { setShowNewCompanyModal(true); setIsDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 font-medium flex items-center gap-2 transition-colors"
                >
                  <Plus size={16} /> Nova Empresa
                </button>
              </div>
            </div>
          )}
        </div>
        
        <nav className="flex-1 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center px-6 py-3 transition-colors duration-200 group
                  ${isActive ? 'bg-slate-800 border-r-4 border-amber-500 text-amber-500' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <Icon size={20} className={`mr-3 transition-transform group-hover:scale-110 ${isActive ? 'text-amber-500' : 'text-slate-400 group-hover:text-white'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button onClick={handleLogout} className="flex items-center text-slate-400 hover:text-white transition-colors w-full text-sm py-2">
            <LogOut size={18} className="mr-2" />
            Sair
          </button>
        </div>
      </div>

      <NewCompanyModal isOpen={showNewCompanyModal} onClose={() => setShowNewCompanyModal(false)} />
    </>
  );
};

// 2. New Company Modal (Used in Onboarding and Sidebar)
const NewCompanyModal = ({ isOpen, onClose, isWelcome = false }: { isOpen: boolean, onClose: () => void, isWelcome?: boolean }) => {
  const { addCompany } = useFinance();
  const [formData, setFormData] = useState({ name: '', cnpj: '', initialBalance: 0, color: '#1e3a8a', logo: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addCompany({
        ...formData,
        currentBalance: formData.initialBalance,
      });
      setFormData({ name: '', cnpj: '', initialBalance: 0, color: '#1e3a8a', logo: '' });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative animate-in zoom-in-95 duration-200">
        
        {/* CLOSE BUTTON - Only visible if not the mandatory welcome screen */}
        {!isWelcome && (
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all"
            title="Fechar"
          >
            <X size={20} />
          </button>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">{isWelcome ? 'Bem-vindo ao FinanceHolding' : 'Nova Empresa'}</h2>
          <p className="text-slate-500 mt-1">{isWelcome ? 'Para começar, cadastre sua primeira empresa ou holding.' : 'Cadastre os dados da nova empresa do grupo.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Logo Upload */}
          <div className="flex items-start gap-4 mb-4">
            <div 
              className="w-24 h-24 flex-shrink-0 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer overflow-hidden hover:bg-slate-100 hover:border-amber-400 transition-all group"
              onClick={() => fileInputRef.current?.click()}
            >
              {formData.logo ? (
                <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center group-hover:text-amber-500 transition-colors">
                  <Upload size={24} className="mx-auto text-slate-400 mb-2 group-hover:text-amber-500" />
                  <span className="text-[10px] text-slate-400 font-medium">Upload Logo</span>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
            
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Empresa</label>
                <input 
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Grupo Focco"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ</label>
              <input 
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                value={formData.cnpj}
                onChange={e => setFormData({...formData, cnpj: e.target.value})}
                placeholder="00.000.000/0001-00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Saldo Inicial</label>
              <input 
                type="number"
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                value={formData.initialBalance}
                onChange={e => setFormData({...formData, initialBalance: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Cor de Identificação</label>
            <div className="flex gap-3">
              {['#1e3a8a', '#047857', '#b45309', '#be123c', '#5b21b6'].map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setFormData({...formData, color: c})}
                  className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${formData.color === c ? 'border-slate-800 scale-110 shadow-md' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                >
                   {formData.color === c && <CheckCircle size={16} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? 'Salvando...' : (isWelcome ? 'Começar a Usar' : 'Cadastrar Empresa')}
          </button>
        </form>
      </div>
    </div>
  );
};

// 3. New Contract Modal
const NewContractModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { suppliers, clients, selectedCompanyId, addContract } = useFinance();
  const [data, setData] = useState({
    contractType: 'SUPPLIER' as 'SUPPLIER' | 'CLIENT',
    entityId: '',
    description: '',
    startDate: '',
    totalValue: 0,
    recurrence: 'SINGLE' as 'SINGLE' | 'MONTHLY' | 'INSTALLMENTS',
    installmentsCount: 1
  });
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [savedContractId, setSavedContractId] = useState<string | null>(null);
  const [savedSaleValue, setSavedSaleValue] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const count = data.recurrence === 'SINGLE' ? 1 : data.installmentsCount;
    const monthlyValue = data.recurrence === 'INSTALLMENTS' ? data.totalValue / count : data.totalValue;

    const contractId = await addContract(
      {
        companyId: selectedCompanyId,
        supplierId: data.contractType === 'SUPPLIER' ? data.entityId : undefined,
        clientId: data.contractType === 'CLIENT' ? data.entityId : undefined,
        contractType: data.contractType,
        description: data.description,
        startDate: data.startDate,
        totalValue: data.totalValue,
        recurrence: data.recurrence,
        installmentsCount: count
      },
      {
        count: count,
        value: monthlyValue,
        firstDueDate: data.startDate
      }
    );

    // Se for contrato de cliente, abrir modal de comissão
    if (data.contractType === 'CLIENT' && contractId) {
      setSavedContractId(contractId);
      setSavedSaleValue(data.totalValue);
      setShowCommissionModal(true);
    } else {
      onClose();
    }
  };

  const handleCommissionClose = () => {
    setShowCommissionModal(false);
    setSavedContractId(null);
    setSavedSaleValue(0);
    setData({
      contractType: 'SUPPLIER',
      entityId: '',
      description: '',
      startDate: '',
      totalValue: 0,
      recurrence: 'SINGLE',
      installmentsCount: 1
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Novo Contrato</h2>
          <p className="text-sm text-slate-500">Cadastre um novo compromisso para a empresa.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Contrato</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setData({...data, contractType: 'SUPPLIER', entityId: ''})}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                  data.contractType === 'SUPPLIER'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Users size={20} className="mx-auto mb-1" />
                Fornecedor
                <p className="text-xs font-normal mt-1 opacity-70">Saída de caixa</p>
              </button>
              <button
                type="button"
                onClick={() => setData({...data, contractType: 'CLIENT', entityId: ''})}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                  data.contractType === 'CLIENT'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <UserCheck size={20} className="mx-auto mb-1" />
                Cliente
                <p className="text-xs font-normal mt-1 opacity-70">Entrada de caixa</p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {data.contractType === 'SUPPLIER' ? 'Fornecedor' : 'Cliente'}
            </label>
            <select
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              value={data.entityId}
              onChange={e => setData({...data, entityId: e.target.value})}
            >
              <option value="">Selecione...</option>
              {data.contractType === 'SUPPLIER'
                ? suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                : clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
              }
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição do Serviço</label>
            <input 
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              value={data.description}
              onChange={e => setData({...data, description: e.target.value})}
              placeholder="Ex: Aluguel da Sala 2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data Início / 1º Pgto</label>
              <input 
                type="date"
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                value={data.startDate}
                onChange={e => setData({...data, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Cobrança</label>
              <select 
                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                value={data.recurrence}
                onChange={e => setData({...data, recurrence: e.target.value as any})}
              >
                <option value="SINGLE">À Vista (Único)</option>
                <option value="INSTALLMENTS">Parcelado</option>
                <option value="MONTHLY">Mensalidade (Recorrente)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor Total / Mensal</label>
              <input 
                type="number"
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                value={data.totalValue}
                onChange={e => setData({...data, totalValue: parseFloat(e.target.value)})}
              />
            </div>
            {data.recurrence !== 'SINGLE' && (
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">
                   {data.recurrence === 'INSTALLMENTS' ? 'Qtd Parcelas' : 'Meses de Contrato'}
                 </label>
                 <input 
                  type="number"
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  value={data.installmentsCount}
                  onChange={e => setData({...data, installmentsCount: parseInt(e.target.value)})}
                 />
              </div>
            )}
          </div>

          <div className={`p-3 rounded-lg text-xs flex items-start ${
            data.contractType === 'CLIENT'
              ? 'bg-green-50 border border-green-100 text-green-800'
              : 'bg-amber-50 border border-amber-100 text-amber-800'
          }`}>
             <AlertTriangle size={14} className="mr-2 mt-0.5 flex-shrink-0" />
             <span>
               {data.contractType === 'CLIENT'
                 ? 'Contrato de cliente: os pagamentos serão registrados como ENTRADA no fluxo de caixa.'
                 : 'Contrato de fornecedor: os pagamentos serão registrados como SAÍDA no fluxo de caixa.'
               }
             </span>
          </div>

          <button type="submit" className="w-full bg-slate-900 text-amber-500 font-bold py-3.5 rounded-lg hover:bg-slate-800 transition-colors mt-2">
            Gerar Contrato e Parcelas
          </button>
        </form>
      </div>

      {/* Modal de Comissão - aparece após salvar contrato de cliente */}
      {showCommissionModal && savedContractId && (
        <CommissionModal
          isOpen={showCommissionModal}
          onClose={handleCommissionClose}
          contractId={savedContractId}
          companyId={selectedCompanyId}
          saleValue={savedSaleValue}
        />
      )}
    </div>
  );
};

// 3.1 Commission Modal - Aparece após criar contrato de cliente
const CommissionModal = ({
  isOpen,
  onClose,
  contractId,
  companyId,
  saleValue
}: {
  isOpen: boolean,
  onClose: () => void,
  contractId: string,
  companyId: string,
  saleValue: number
}) => {
  const { addCommission } = useFinance();
  const { commissionSettings } = useAdmin();
  const [showConfirmMore, setShowConfirmMore] = useState(false);
  const [data, setData] = useState({
    sellerType: 'SDR' as 'SDR' | 'CLOSER',
    sellerName: '',
    sellerAddress: '',
    paymentType: 'SINGLE' as 'SINGLE' | 'INSTALLMENTS',
    installmentsCount: 1
  });

  // Comissões configuradas na área admin
  const commissionRates = {
    SDR: commissionSettings.sdrPercentage,
    CLOSER: commissionSettings.closerPercentage
  };

  const commissionPercentage = commissionRates[data.sellerType];
  const commissionValue = (saleValue * commissionPercentage) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await addCommission({
      contractId,
      companyId,
      sellerType: data.sellerType,
      sellerName: data.sellerName,
      sellerAddress: data.sellerAddress,
      saleValue,
      commissionPercentage,
      commissionValue,
      paymentType: data.paymentType,
      installmentsCount: data.paymentType === 'SINGLE' ? 1 : data.installmentsCount
    });

    // Limpar form e perguntar se quer adicionar mais
    setData({
      sellerType: 'SDR',
      sellerName: '',
      sellerAddress: '',
      paymentType: 'SINGLE',
      installmentsCount: 1
    });
    setShowConfirmMore(true);
  };

  const handleAddMore = () => {
    setShowConfirmMore(false);
  };

  const handleFinish = () => {
    setShowConfirmMore(false);
    onClose();
  };

  if (!isOpen) return null;

  // Modal de confirmação para adicionar mais comissões
  if (showConfirmMore) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Comissão Adicionada!</h2>
          <p className="text-slate-500 mb-6">Deseja adicionar outra comissão para este contrato?</p>
          <div className="flex gap-3">
            <button
              onClick={handleFinish}
              className="flex-1 py-3 px-4 border-2 border-slate-200 rounded-lg font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Não, finalizar
            </button>
            <button
              onClick={handleAddMore}
              className="flex-1 py-3 px-4 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors"
            >
              Sim, adicionar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Adicionar Comissão</h2>
          <p className="text-sm text-slate-500">Cadastre a comissão do vendedor para este contrato.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Vendedor</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setData({...data, sellerType: 'SDR'})}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                  data.sellerType === 'SDR'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                SDR
                <p className="text-xs font-normal mt-1 opacity-70">{commissionRates.SDR}% comissão</p>
              </button>
              <button
                type="button"
                onClick={() => setData({...data, sellerType: 'CLOSER'})}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                  data.sellerType === 'CLOSER'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                Closer
                <p className="text-xs font-normal mt-1 opacity-70">{commissionRates.CLOSER}% comissão</p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Vendedor</label>
            <input
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              value={data.sellerName}
              onChange={e => setData({...data, sellerName: e.target.value})}
              placeholder="Nome completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
            <input
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              value={data.sellerAddress}
              onChange={e => setData({...data, sellerAddress: e.target.value})}
              placeholder="Endereço completo"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Forma de Pagamento</label>
              <select
                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                value={data.paymentType}
                onChange={e => setData({...data, paymentType: e.target.value as any})}
              >
                <option value="SINGLE">À Vista</option>
                <option value="INSTALLMENTS">Parcelado</option>
              </select>
            </div>
            {data.paymentType === 'INSTALLMENTS' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Qtd Parcelas</label>
                <input
                  type="number"
                  min="2"
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  value={data.installmentsCount}
                  onChange={e => setData({...data, installmentsCount: parseInt(e.target.value)})}
                />
              </div>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Valor da Venda:</span>
              <span className="font-bold text-slate-800">{formatCurrency(saleValue)}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-slate-600">Comissão ({commissionPercentage}%):</span>
              <span className="font-bold text-green-600">{formatCurrency(commissionValue)}</span>
            </div>
            {data.paymentType === 'INSTALLMENTS' && data.installmentsCount > 1 && (
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
                <span className="text-sm text-slate-600">Valor por Parcela:</span>
                <span className="font-medium text-slate-700">
                  {data.installmentsCount}x de {formatCurrency(commissionValue / data.installmentsCount)}
                </span>
              </div>
            )}
          </div>

          <button type="submit" className="w-full bg-slate-900 text-amber-500 font-bold py-3.5 rounded-lg hover:bg-slate-800 transition-colors mt-2">
            Salvar Comissão
          </button>
        </form>
      </div>
    </div>
  );
};

// 4. Edit Contract Modal
const EditContractModal = ({ isOpen, onClose, contract }: { isOpen: boolean, onClose: () => void, contract: Contract | null }) => {
  const { suppliers, clients, updateContract } = useFinance();
  const [data, setData] = useState({
    entityId: '',
    description: '',
    startDate: '',
    totalValue: 0
  });

  useEffect(() => {
    if (contract) {
      setData({
        entityId: contract.contractType === 'CLIENT' ? (contract.clientId || '') : (contract.supplierId || ''),
        description: contract.description,
        startDate: contract.startDate,
        totalValue: contract.totalValue
      });
    }
  }, [contract]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) return;

    const updateData: any = {
      description: data.description,
      startDate: data.startDate,
      totalValue: data.totalValue
    };

    if (contract.contractType === 'CLIENT') {
      updateData.clientId = data.entityId;
    } else {
      updateData.supplierId = data.entityId;
    }

    await updateContract(contract.id, updateData);
    onClose();
  };

  if (!isOpen || !contract) return null;

  const isClientContract = contract.contractType === 'CLIENT';

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Editar Contrato</h2>
          <p className="text-sm text-slate-500">
            Contrato de {isClientContract ? 'Cliente' : 'Fornecedor'} - {isClientContract ? 'Entrada' : 'Saída'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {isClientContract ? 'Cliente' : 'Fornecedor'}
            </label>
            <select
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              value={data.entityId}
              onChange={e => setData({...data, entityId: e.target.value})}
            >
              <option value="">Selecione...</option>
              {isClientContract
                ? clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                : suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
              }
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição do Serviço</label>
            <input
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              value={data.description}
              onChange={e => setData({...data, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data Início</label>
              <input
                type="date"
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                value={data.startDate}
                onChange={e => setData({...data, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor Total</label>
              <input
                type="number"
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                value={data.totalValue}
                onChange={e => setData({...data, totalValue: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-xs text-amber-800 flex items-start">
             <AlertTriangle size={14} className="mr-2 mt-0.5 flex-shrink-0" />
             <span>As parcelas existentes não serão alteradas automaticamente.</span>
          </div>

          <button type="submit" className="w-full bg-slate-900 text-amber-500 font-bold py-3.5 rounded-lg hover:bg-slate-800 transition-colors mt-2">
            Salvar Alterações
          </button>
        </form>
      </div>
    </div>
  );
};

// 5. Installment Detail Modal
const InstallmentDetailModal = ({ installment, onClose }: { installment: Installment | null, onClose: () => void }) => {
  const { cards } = useFinance();
  const isMobile = useIsMobile();

  if (!installment) return null;

  const statusConfig = {
    PAID: { label: 'Pago', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    PENDING: { label: 'Pendente', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
    OVERDUE: { label: 'Atrasado', color: 'bg-rose-100 text-rose-700', icon: XCircle },
  };

  const status = statusConfig[installment.status];
  const StatusIcon = status.icon;
  const card = installment.cardId ? cards.find(c => c.id === installment.cardId) : null;

  const paymentMethodLabels: Record<string, string> = {
    PIX: 'PIX',
    BOLETO: 'Boleto',
    TRANSFER: 'Transferência',
    CREDIT_CARD: 'Cartão de Crédito',
  };

  // Mobile Sheet Style
  if (isMobile) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200" onClick={onClose} />
        <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 pb-4 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                    <StatusIcon size={12} />
                    {status.label}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-2">{installment.contractDescription}</h2>
                  <p className="text-slate-500 text-sm">{installment.supplierName}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-5 py-4 space-y-4">
              {/* Valor */}
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-sm text-slate-500 mb-1">Valor da Parcela</p>
                <p className="text-3xl font-bold text-slate-900">{formatCurrency(installment.amount)}</p>
              </div>

              {/* Detalhes */}
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Vencimento</span>
                  <span className="font-medium text-slate-900">{formatDate(installment.dueDate)}</span>
                </div>

                {installment.status === 'PAID' && installment.paymentDate && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Data do Pagamento</span>
                    <span className="font-medium text-emerald-600">{formatDate(installment.paymentDate)}</span>
                  </div>
                )}

                {installment.paymentMethod && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Método</span>
                    <span className="font-medium text-slate-900">{paymentMethodLabels[installment.paymentMethod] || installment.paymentMethod}</span>
                  </div>
                )}

                {card && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Cartão</span>
                    <span className="font-medium text-slate-900">{card.name} •••• {card.last4}</span>
                  </div>
                )}

                {installment.apportionment && installment.apportionment.length > 0 && (
                  <div className="py-2">
                    <span className="text-slate-500 text-sm block mb-2">Rateio</span>
                    <div className="space-y-2">
                      {installment.apportionment.map((apt, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 rounded-lg p-2">
                          <span className="text-sm text-slate-700">{apt.percentage}%</span>
                          <span className="font-medium text-slate-900">{formatCurrency(apt.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-100 mb-safe">
              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Desktop Modal Style
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                  <StatusIcon size={12} />
                  {status.label}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">{installment.contractDescription}</h2>
                <p className="text-slate-500 text-sm">{installment.supplierName}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors -mr-2 -mt-2">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Valor */}
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-sm text-slate-500 mb-1">Valor da Parcela</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(installment.amount)}</p>
            </div>

            {/* Detalhes */}
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 text-sm">Vencimento</span>
                <span className="font-medium text-slate-900">{formatDate(installment.dueDate)}</span>
              </div>

              {installment.status === 'PAID' && installment.paymentDate && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Data do Pagamento</span>
                  <span className="font-medium text-emerald-600">{formatDate(installment.paymentDate)}</span>
                </div>
              )}

              {installment.paymentMethod && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Método</span>
                  <span className="font-medium text-slate-900">{paymentMethodLabels[installment.paymentMethod] || installment.paymentMethod}</span>
                </div>
              )}

              {card && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Cartão</span>
                  <span className="font-medium text-slate-900">{card.name} •••• {card.last4}</span>
                </div>
              )}

              {installment.apportionment && installment.apportionment.length > 0 && (
                <div className="py-2">
                  <span className="text-slate-500 text-sm block mb-2">Rateio</span>
                  <div className="space-y-2">
                    {installment.apportionment.map((apt, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 rounded-lg p-2">
                        <span className="text-sm text-slate-700">{apt.percentage}%</span>
                        <span className="font-medium text-slate-900">{formatCurrency(apt.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100">
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// 5. Calendar View Component
const CalendarView = ({ installments }: { installments: Installment[] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const isMobile = useIsMobile();

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-bold text-slate-800 capitalize flex items-center gap-2">
            <CalendarIcon size={20} className="text-amber-500"/>
            {monthNames[month]} {year}
          </h3>
          <div className="flex gap-1 bg-slate-50 p-1 rounded-lg">
            <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="px-2 md:px-3 py-1 hover:bg-white hover:shadow-sm rounded-md text-xs md:text-sm font-medium text-slate-600 transition-all">Ant</button>
            <div className="w-px bg-slate-200 my-1"></div>
            <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="px-2 md:px-3 py-1 hover:bg-white hover:shadow-sm rounded-md text-xs md:text-sm font-medium text-slate-600 transition-all">Próx</button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 text-center text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sab</div>
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {blanks.map(i => <div key={`blank-${i}`} className={`${isMobile ? 'h-16' : 'h-28'} bg-slate-50/30 rounded-lg`}></div>)}
          {days.map(day => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const daysInstallments = installments.filter(i => i.dueDate === dateStr);
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            return (
              <div key={day} className={`${isMobile ? 'h-16' : 'h-28'} border rounded-lg p-1 md:p-2 overflow-hidden transition-colors group hover:border-amber-200 ${isToday ? 'bg-blue-50/50 border-blue-200' : 'border-slate-100 bg-white'}`}>
                <div className={`text-[10px] md:text-xs font-bold mb-1 flex justify-between ${isToday ? 'text-blue-600' : 'text-slate-400 group-hover:text-amber-500'}`}>
                  <span>{day}</span>
                  {daysInstallments.length > 0 && <span className="text-[8px] md:text-[10px] bg-slate-100 px-1 rounded">{daysInstallments.length}</span>}
                </div>
                <div className={`space-y-1 ${isMobile ? 'overflow-hidden' : 'overflow-y-auto scrollbar-thin'}`}>
                  {daysInstallments.slice(0, isMobile ? 1 : 3).map(inst => (
                    <div
                      key={inst.id}
                      onClick={() => setSelectedInstallment(inst)}
                      className={`text-[8px] md:text-[10px] p-1 md:p-1.5 rounded border-l-2 shadow-sm truncate transition-transform hover:scale-105 cursor-pointer ${
                        inst.status === 'PAID' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' :
                        inst.status === 'OVERDUE' ? 'bg-rose-50 border-rose-500 text-rose-800' :
                        'bg-white border-amber-400 text-slate-700'
                      }`}
                    >
                      <div className="font-bold truncate">{formatCurrency(inst.amount)}</div>
                      {!isMobile && <div className="opacity-75 text-[9px] truncate">{inst.supplierName}</div>}
                    </div>
                  ))}
                  {isMobile && daysInstallments.length > 1 && (
                    <div
                      onClick={() => daysInstallments.length > 0 && setSelectedInstallment(daysInstallments[0])}
                      className="text-[8px] text-center text-slate-400 cursor-pointer"
                    >
                      +{daysInstallments.length - 1}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <InstallmentDetailModal
        installment={selectedInstallment}
        onClose={() => setSelectedInstallment(null)}
      />
    </>
  );
};

// --- PAGES ---

const Dashboard = () => {
  const { companies, installments, selectedCompanyId } = useFinance();

  // Filter Logic: Show only selected company's balance and installments that involve this company
  const company = companies.find(c => c.id === selectedCompanyId);
  const companyInstallments = installments.filter(i => i.apportionment.some(a => a.companyId === selectedCompanyId));

  const totalPending = companyInstallments.filter(i => i.status !== 'PAID').reduce((acc, i) => {
    // Calculate only the portion for this company
    const share = i.apportionment.find(a => a.companyId === selectedCompanyId)?.value || 0;
    return acc + share;
  }, 0);

  const totalPaid = companyInstallments.filter(i => i.status === 'PAID').reduce((acc, i) => {
    const share = i.apportionment.find(a => a.companyId === selectedCompanyId)?.value || 0;
    return acc + share;
  }, 0);

  if (!company) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-2">
        {company.logo ? (
           <img src={company.logo} className="w-16 h-16 rounded-xl object-cover bg-white shadow-md border border-slate-100" />
        ) : (
           <LogoPlaceholder name={company.name} color={company.color} size="lg" />
        )}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{company.name}</h1>
          <div className="flex items-center gap-2 mt-1">
             <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wide">Ativa</span>
             <p className="text-slate-500 text-sm">CNPJ: {company.cnpj}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Saldo Atual" value={formatCurrency(company.currentBalance)} type="info" />
        <StatCard title="A Pagar (Previsto)" value={formatCurrency(totalPending)} type="negative" subtext="Parte da empresa" />
        <StatCard title="Pago (Mês)" value={formatCurrency(totalPaid)} type="positive" subtext="Parte da empresa" />
        <StatCard title="Contratos Ativos" value="0" />
      </div>

      {/* Placeholder for a company-specific chart */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 min-h-[300px] flex flex-col items-center justify-center text-slate-400 relative overflow-hidden group">
         <div className="absolute inset-0 bg-slate-50/50 skew-y-3 scale-110 opacity-50 group-hover:skew-y-0 transition-transform duration-700"></div>
         <BarChart className="text-slate-200 mb-4 opacity-50" width={60} height={60} />
         <p className="font-medium text-lg relative z-10">Gráfico de Evolução de Caixa</p>
         <p className="text-sm opacity-75 relative z-10">Dados insuficientes para projeção visual.</p>
      </div>
    </div>
  );
};

// PAGE: CONTRACTS
const ContractsPage = () => {
  const { contracts, selectedCompanyId } = useFinance();
  const [showNew, setShowNew] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  // Filter contracts owned by this company
  const filtered = contracts.filter(c => c.companyId === selectedCompanyId);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Meus Contratos</h2>
          <p className="text-sm text-slate-500">Gerencie os contratos recorrentes e pontuais.</p>
        </div>
        <button 
          onClick={() => setShowNew(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
        >
          <Plus size={18} /> Novo Contrato
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(contract => (
          <div key={contract.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-amber-200 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <FileText size={24} />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingContract(contract)}
                  className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  title="Editar contrato"
                >
                  <Pencil size={16} />
                </button>
                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{contract.status}</span>
              </div>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">{contract.description}</h3>
            <p className="text-slate-500 text-sm mb-4 flex items-center gap-1">
              <CalendarIcon size={12}/> Início: {formatDate(contract.startDate)}
            </p>

            <div className="border-t border-slate-100 pt-4 flex justify-between items-end">
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Valor Total</p>
                <p className="font-bold text-slate-800 text-lg">{formatCurrency(contract.totalValue)}</p>
              </div>
              <div className="text-right">
                 <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Recorrência</p>
                 <p className="font-medium text-slate-700 text-sm">{contract.recurrence === 'INSTALLMENTS' ? `${contract.installmentsCount}x Parcelas` : 'Mensal'}</p>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border-2 border-dashed border-slate-200">
            <Briefcase size={48} className="mb-4 opacity-20" />
            <p className="font-medium">Nenhum contrato cadastrado.</p>
            <button onClick={() => setShowNew(true)} className="mt-4 text-amber-600 hover:text-amber-700 text-sm font-bold">Cadastrar o primeiro</button>
          </div>
        )}
      </div>

      <NewContractModal isOpen={showNew} onClose={() => setShowNew(false)} />
      <EditContractModal isOpen={!!editingContract} onClose={() => setEditingContract(null)} contract={editingContract} />
    </div>
  );
};

// PAGE: AGENDA
const AgendaPage = () => {
  const { installments, payInstallment, selectedCompanyId } = useFinance();
  const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR'>('LIST');
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'OVERDUE' | 'PAID'>('ALL');
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);

  // Filter: Must involve selected company
  const companyInstallments = installments.filter(i => i.apportionment.some(a => a.companyId === selectedCompanyId));

  const filtered = companyInstallments.filter(i => {
    if (filter === 'ALL') return true;
    return i.status === filter;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Agenda de Compromissos</h2>
          <p className="text-sm text-slate-500">Parcelas e contas da empresa selecionada.</p>
        </div>
        <div className="flex items-center gap-4">
           {/* View Toggles */}
           <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('LIST')}
                className={`p-2 rounded-md transition-all ${viewMode === 'LIST' ? 'bg-white shadow text-amber-600' : 'text-slate-400 hover:text-slate-600'}`}
                title="Lista"
              >
                <List size={20} />
              </button>
              <button 
                onClick={() => setViewMode('CALENDAR')}
                className={`p-2 rounded-md transition-all ${viewMode === 'CALENDAR' ? 'bg-white shadow text-amber-600' : 'text-slate-400 hover:text-slate-600'}`}
                title="Calendário"
              >
                <CalendarIcon size={20} />
              </button>
           </div>
           
           {viewMode === 'LIST' && (
            <div className="flex gap-2">
              {['ALL', 'PENDING', 'OVERDUE'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-2 text-xs font-bold rounded-full transition-all border ${
                    filter === f ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  {f === 'ALL' ? 'Todos' : f === 'PENDING' ? 'Abertos' : 'Atrasados'}
                </button>
              ))}
            </div>
           )}
        </div>
      </div>

      {viewMode === 'CALENDAR' ? (
        <CalendarView installments={companyInstallments} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Vencimento</th>
                <th className="p-4">Descrição</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Valor Total</th>
                <th className="p-4 text-right">Sua Parte</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((inst) => {
                const myShare = inst.apportionment.find(a => a.companyId === selectedCompanyId)?.value || 0;
                return (
                  <tr key={inst.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 whitespace-nowrap font-medium text-slate-700">{formatDate(inst.dueDate)}</td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-800 group-hover:text-amber-600 transition-colors">{inst.contractDescription}</p>
                      <p className="text-xs text-slate-500">{inst.supplierName}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        inst.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                        inst.status === 'OVERDUE' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {inst.status === 'PAID' ? 'Pago' : inst.status === 'OVERDUE' ? 'Atrasado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="p-4 text-right text-slate-500">{formatCurrency(inst.amount)}</td>
                    <td className="p-4 text-right font-bold text-slate-800">{formatCurrency(myShare)}</td>
                    <td className="p-4 text-center">
                      {inst.status !== 'PAID' && (
                        <button onClick={() => setSelectedInstallment(inst)} className="bg-slate-100 hover:bg-amber-500 hover:text-white text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm">Pagar</button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                   <td colSpan={6} className="p-8 text-center text-slate-400">
                      Nenhum item encontrado.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Reusing existing Payment Modal (Stateless/Context-less for simplicity in this snippet) */}
      {selectedInstallment && (
        <PaymentModal 
           isOpen={true}
           onClose={() => setSelectedInstallment(null)}
           installment={selectedInstallment}
           onConfirm={(m, d, c) => payInstallment(selectedInstallment.id, m, d, c)}
        />
      )}
    </div>
  );
};

// Edit Company Modal
const EditCompanyModal = ({ isOpen, onClose, company }: { isOpen: boolean, onClose: () => void, company: Company }) => {
  const { updateCompany } = useFinance();
  const [formData, setFormData] = useState({
    name: company.name,
    cnpj: company.cnpj,
    color: company.color,
    logo: company.logo || ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Atualizar formData quando company mudar
  useEffect(() => {
    setFormData({
      name: company.name,
      cnpj: company.cnpj,
      color: company.color,
      logo: company.logo || ''
    });
  }, [company]);

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCompany(company.id, formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all"
          title="Fechar"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Editar Empresa</h2>
          <p className="text-slate-500 mt-1">Atualize os dados da empresa.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Logo Upload */}
          <div className="flex items-start gap-4 mb-4">
            <div
              className="w-24 h-24 flex-shrink-0 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer overflow-hidden hover:bg-slate-100 hover:border-amber-400 transition-all group"
              onClick={() => fileInputRef.current?.click()}
            >
              {formData.logo ? (
                <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center group-hover:text-amber-500 transition-colors">
                  <Upload size={24} className="mx-auto text-slate-400 mb-2 group-hover:text-amber-500" />
                  <span className="text-[10px] text-slate-400 font-medium">Upload Logo</span>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />

            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Empresa</label>
                <input
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Grupo Focco"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ</label>
            <input
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
              value={formData.cnpj}
              onChange={e => setFormData({...formData, cnpj: e.target.value})}
              placeholder="00.000.000/0001-00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Cor de Identificação</label>
            <div className="flex gap-3">
              {['#1e3a8a', '#047857', '#b45309', '#be123c', '#5b21b6'].map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setFormData({...formData, color: c})}
                  className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${formData.color === c ? 'border-slate-800 scale-110 shadow-md' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                >
                   {formData.color === c && <CheckCircle size={16} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-lg transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// PAGE: SUPPLIERS (Fornecedores)
const SuppliersPage = () => {
  const { suppliers, addSupplier } = useFinance();
  const [showNewModal, setShowNewModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', cnpj: '', category: '' });
  const [cnpjError, setCnpjError] = useState('');

  const validateCNPJ = (cnpj: string): boolean => {
    // Remove caracteres não numéricos
    const numbers = cnpj.replace(/\D/g, '');

    // CNPJ deve ter 14 dígitos
    if (numbers.length !== 14) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(numbers)) return false;

    // Validação dos dígitos verificadores
    const calcDigit = (base: string, weights: number[]): number => {
      let sum = 0;
      for (let i = 0; i < weights.length; i++) {
        sum += parseInt(base[i]) * weights[i];
      }
      const remainder = sum % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    };

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    const digit1 = calcDigit(numbers.slice(0, 12), weights1);
    const digit2 = calcDigit(numbers.slice(0, 12) + digit1, weights2);

    return numbers.slice(12) === `${digit1}${digit2}`;
  };

  const formatCNPJ = (value: string): string => {
    const numbers = value.replace(/\D/g, '').slice(0, 14);
    return numbers
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  };

  const handleCNPJChange = (value: string) => {
    const formatted = formatCNPJ(value);
    setFormData({...formData, cnpj: formatted});

    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 14) {
      if (!validateCNPJ(numbers)) {
        setCnpjError('CNPJ inválido');
      } else {
        setCnpjError('');
      }
    } else {
      setCnpjError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCNPJ(formData.cnpj)) {
      setCnpjError('CNPJ inválido');
      return;
    }

    await addSupplier(formData);
    setFormData({ name: '', cnpj: '', category: '' });
    setCnpjError('');
    setShowNewModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Fornecedores</h2>
          <p className="text-sm text-slate-500">Gerencie seus fornecedores e parceiros.</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
        >
          <Plus size={18} /> Novo Fornecedor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map(supplier => (
          <div key={supplier.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-amber-200 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Users size={24} />
              </div>
              <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{supplier.category}</span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">{supplier.name}</h3>
            <p className="text-slate-500 text-sm font-mono">{supplier.cnpj}</p>
          </div>
        ))}
        {suppliers.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border-2 border-dashed border-slate-200">
            <Users size={48} className="mb-4 opacity-20" />
            <p className="font-medium">Nenhum fornecedor cadastrado.</p>
            <button onClick={() => setShowNewModal(true)} className="mt-4 text-amber-600 hover:text-amber-700 text-sm font-bold">Cadastrar o primeiro</button>
          </div>
        )}
      </div>

      {/* Modal Novo Fornecedor */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Novo Fornecedor</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input required className="w-full border rounded-lg px-3 py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CNPJ</label>
                <input
                  required
                  className={`w-full border rounded-lg px-3 py-2 ${cnpjError ? 'border-red-500 focus:ring-red-500' : ''}`}
                  value={formData.cnpj}
                  onChange={e => handleCNPJChange(e.target.value)}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
                {cnpjError && <p className="text-red-500 text-sm mt-1">{cnpjError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <input required className="w-full border rounded-lg px-3 py-2" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Ex: Serviços, Aluguel, etc" />
              </div>
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-bold">Cadastrar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// PAGE: CLIENTS (Clientes)
const ClientsPage = () => {
  const { clients, addClient } = useFinance();
  const [showNewModal, setShowNewModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', cnpj: '', category: '' });
  const [cnpjError, setCnpjError] = useState('');

  const validateCNPJ = (cnpj: string): boolean => {
    const numbers = cnpj.replace(/\D/g, '');
    if (numbers.length !== 14) return false;
    if (/^(\d)\1+$/.test(numbers)) return false;

    const calcDigit = (base: string, weights: number[]): number => {
      let sum = 0;
      for (let i = 0; i < weights.length; i++) {
        sum += parseInt(base[i]) * weights[i];
      }
      const remainder = sum % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    };

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    const digit1 = calcDigit(numbers.slice(0, 12), weights1);
    const digit2 = calcDigit(numbers.slice(0, 12) + digit1, weights2);

    return numbers.slice(12) === `${digit1}${digit2}`;
  };

  const formatCNPJ = (value: string): string => {
    const numbers = value.replace(/\D/g, '').slice(0, 14);
    return numbers
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  };

  const handleCNPJChange = (value: string) => {
    const formatted = formatCNPJ(value);
    setFormData({...formData, cnpj: formatted});

    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 14) {
      if (!validateCNPJ(numbers)) {
        setCnpjError('CNPJ inválido');
      } else {
        setCnpjError('');
      }
    } else {
      setCnpjError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCNPJ(formData.cnpj)) {
      setCnpjError('CNPJ inválido');
      return;
    }

    await addClient(formData);
    setFormData({ name: '', cnpj: '', category: '' });
    setCnpjError('');
    setShowNewModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Clientes</h2>
          <p className="text-sm text-slate-500">Gerencie seus clientes. Contratos de clientes geram receita.</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
        >
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map(client => (
          <div key={client.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-green-200 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <UserCheck size={24} />
              </div>
              <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{client.category}</span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">{client.name}</h3>
            <p className="text-slate-500 text-sm font-mono">{client.cnpj}</p>
          </div>
        ))}
        {clients.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border-2 border-dashed border-slate-200">
            <UserCheck size={48} className="mb-4 opacity-20" />
            <p className="font-medium">Nenhum cliente cadastrado.</p>
            <button onClick={() => setShowNewModal(true)} className="mt-4 text-amber-600 hover:text-amber-700 text-sm font-bold">Cadastrar o primeiro</button>
          </div>
        )}
      </div>

      {/* Modal Novo Cliente */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Novo Cliente</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input required className="w-full border rounded-lg px-3 py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CNPJ</label>
                <input
                  required
                  className={`w-full border rounded-lg px-3 py-2 ${cnpjError ? 'border-red-500 focus:ring-red-500' : ''}`}
                  value={formData.cnpj}
                  onChange={e => handleCNPJChange(e.target.value)}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
                {cnpjError && <p className="text-red-500 text-sm mt-1">{cnpjError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <input required className="w-full border rounded-lg px-3 py-2" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Ex: Varejo, Serviços, etc" />
              </div>
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-bold">Cadastrar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// PAGE: COMMISSIONS (Comissões)
const CommissionsPage = () => {
  const { commissions, contracts, selectedCompanyId, updateCommission } = useFinance();
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null);

  // Filter commissions for the selected company
  const companyCommissions = commissions.filter(c => c.companyId === selectedCompanyId);

  const getContractDescription = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    return contract?.description || 'Contrato não encontrado';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Comissões</h2>
          <p className="text-sm text-slate-500">Gerencie as comissões dos vendedores.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companyCommissions.map(commission => (
          <div key={commission.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-amber-200 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${commission.sellerType === 'SDR' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                <BadgePercent size={24} />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingCommission(commission)}
                  className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  title="Editar comissão"
                >
                  <Pencil size={16} />
                </button>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  commission.sellerType === 'SDR' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {commission.sellerType}
                </span>
              </div>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">{commission.sellerName}</h3>
            <p className="text-slate-500 text-sm mb-2">{getContractDescription(commission.contractId)}</p>
            <p className="text-slate-400 text-xs mb-4">{commission.sellerAddress}</p>

            <div className="border-t border-slate-100 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400">Valor da Venda:</span>
                <span className="font-medium text-slate-700">{formatCurrency(commission.saleValue)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400">Comissão ({commission.commissionPercentage}%):</span>
                <span className="font-bold text-green-600">{formatCurrency(commission.commissionValue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Pagamento:</span>
                <span className="font-medium text-slate-700">
                  {commission.paymentType === 'SINGLE' ? 'À Vista' : `${commission.installmentsCount}x`}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                commission.status === 'PAID' ? 'bg-green-100 text-green-700' :
                commission.status === 'PARTIAL' ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {commission.status === 'PAID' ? 'Pago' : commission.status === 'PARTIAL' ? 'Parcial' : 'Pendente'}
              </span>
            </div>
          </div>
        ))}
        {companyCommissions.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border-2 border-dashed border-slate-200">
            <BadgePercent size={48} className="mb-4 opacity-20" />
            <p className="font-medium">Nenhuma comissão cadastrada.</p>
            <p className="text-sm mt-2">As comissões são criadas ao finalizar contratos de clientes.</p>
          </div>
        )}
      </div>

      {/* Modal de Edição de Comissão */}
      {editingCommission && (
        <EditCommissionModal
          isOpen={!!editingCommission}
          onClose={() => setEditingCommission(null)}
          commission={editingCommission}
        />
      )}
    </div>
  );
};

// Edit Commission Modal
const EditCommissionModal = ({
  isOpen,
  onClose,
  commission
}: {
  isOpen: boolean,
  onClose: () => void,
  commission: Commission
}) => {
  const { updateCommission } = useFinance();
  const { commissionSettings } = useAdmin();
  const [data, setData] = useState({
    sellerType: commission.sellerType,
    sellerName: commission.sellerName,
    sellerAddress: commission.sellerAddress,
    paymentType: commission.paymentType,
    installmentsCount: commission.installmentsCount
  });

  // Comissões configuradas na área admin
  const commissionRates = {
    SDR: commissionSettings.sdrPercentage,
    CLOSER: commissionSettings.closerPercentage
  };

  const commissionPercentage = commissionRates[data.sellerType];
  const commissionValue = (commission.saleValue * commissionPercentage) / 100;

  useEffect(() => {
    setData({
      sellerType: commission.sellerType,
      sellerName: commission.sellerName,
      sellerAddress: commission.sellerAddress,
      paymentType: commission.paymentType,
      installmentsCount: commission.installmentsCount
    });
  }, [commission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await updateCommission(commission.id, {
      sellerType: data.sellerType,
      sellerName: data.sellerName,
      sellerAddress: data.sellerAddress,
      commissionPercentage,
      commissionValue,
      paymentType: data.paymentType,
      installmentsCount: data.paymentType === 'SINGLE' ? 1 : data.installmentsCount
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Editar Comissão</h2>
          <p className="text-sm text-slate-500">Atualize as informações da comissão.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Vendedor</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setData({...data, sellerType: 'SDR'})}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                  data.sellerType === 'SDR'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                SDR
                <p className="text-xs font-normal mt-1 opacity-70">{commissionRates.SDR}% comissão</p>
              </button>
              <button
                type="button"
                onClick={() => setData({...data, sellerType: 'CLOSER'})}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                  data.sellerType === 'CLOSER'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                Closer
                <p className="text-xs font-normal mt-1 opacity-70">{commissionRates.CLOSER}% comissão</p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Vendedor</label>
            <input
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              value={data.sellerName}
              onChange={e => setData({...data, sellerName: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
            <input
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              value={data.sellerAddress}
              onChange={e => setData({...data, sellerAddress: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Forma de Pagamento</label>
              <select
                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                value={data.paymentType}
                onChange={e => setData({...data, paymentType: e.target.value as any})}
              >
                <option value="SINGLE">À Vista</option>
                <option value="INSTALLMENTS">Parcelado</option>
              </select>
            </div>
            {data.paymentType === 'INSTALLMENTS' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Qtd Parcelas</label>
                <input
                  type="number"
                  min="2"
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  value={data.installmentsCount}
                  onChange={e => setData({...data, installmentsCount: parseInt(e.target.value)})}
                />
              </div>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Valor da Venda:</span>
              <span className="font-bold text-slate-800">{formatCurrency(commission.saleValue)}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-slate-600">Nova Comissão ({commissionPercentage}%):</span>
              <span className="font-bold text-green-600">{formatCurrency(commissionValue)}</span>
            </div>
          </div>

          <button type="submit" className="w-full bg-slate-900 text-amber-500 font-bold py-3.5 rounded-lg hover:bg-slate-800 transition-colors mt-2">
            Salvar Alterações
          </button>
        </form>
      </div>
    </div>
  );
};

// PAGE: CARDS (Cartões)
const CardsPage = () => {
  const { cards, companies, selectedCompanyId, addCard } = useFinance();
  const [showNewModal, setShowNewModal] = useState(false);
  const [formData, setFormData] = useState({ companyId: selectedCompanyId, name: '', last4: '', limit: 0, closingDay: 1, dueDay: 10 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addCard(formData);
    setFormData({ companyId: selectedCompanyId, name: '', last4: '', limit: 0, closingDay: 1, dueDay: 10 });
    setShowNewModal(false);
  };

  const companyCards = cards.filter(c => c.companyId === selectedCompanyId);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Cartões de Crédito</h2>
          <p className="text-sm text-slate-500">Gerencie os cartões da empresa selecionada.</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
        >
          <Plus size={18} /> Novo Cartão
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companyCards.map(card => (
          <div key={card.id} className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <CreditCard size={32} className="text-amber-500" />
                <div className="text-xs text-slate-400">Crédito</div>
              </div>
              <div className="mb-6">
                <div className="text-xs text-slate-400 mb-1">Cartão</div>
                <div className="text-xl font-bold">{card.name}</div>
                <div className="text-sm text-slate-400 font-mono mt-1">**** **** **** {card.last4}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="text-slate-400">Limite</div>
                  <div className="font-bold">{formatCurrency(card.limit)}</div>
                </div>
                <div>
                  <div className="text-slate-400">Fechamento</div>
                  <div className="font-bold">Dia {card.closingDay}</div>
                </div>
                <div>
                  <div className="text-slate-400">Vencimento</div>
                  <div className="font-bold">Dia {card.dueDay}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {companyCards.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border-2 border-dashed border-slate-200">
            <CreditCard size={48} className="mb-4 opacity-20" />
            <p className="font-medium">Nenhum cartão cadastrado.</p>
            <button onClick={() => setShowNewModal(true)} className="mt-4 text-amber-600 hover:text-amber-700 text-sm font-bold">Cadastrar o primeiro</button>
          </div>
        )}
      </div>

      {/* Modal Novo Cartão */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Novo Cartão</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Cartão</label>
                <input required className="w-full border rounded-lg px-3 py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Nubank Corporate" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Últimos 4 dígitos</label>
                <input required maxLength={4} className="w-full border rounded-lg px-3 py-2" value={formData.last4} onChange={e => setFormData({...formData, last4: e.target.value})} placeholder="1234" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Limite</label>
                <input required type="number" className="w-full border rounded-lg px-3 py-2" value={formData.limit} onChange={e => setFormData({...formData, limit: parseFloat(e.target.value)})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Dia Fechamento</label>
                  <input required type="number" min="1" max="31" className="w-full border rounded-lg px-3 py-2" value={formData.closingDay} onChange={e => setFormData({...formData, closingDay: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dia Vencimento</label>
                  <input required type="number" min="1" max="31" className="w-full border rounded-lg px-3 py-2" value={formData.dueDay} onChange={e => setFormData({...formData, dueDay: parseInt(e.target.value)})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-bold">Cadastrar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// PAGE: CASH FLOW (Fluxo de Caixa)
const CashFlowPage = () => {
  const { cashFlow, companies, selectedCompanyId, addCashFlowMovement } = useFinance();
  const [showNewModal, setShowNewModal] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [formData, setFormData] = useState({
    companyId: selectedCompanyId,
    date: new Date().toISOString().split('T')[0],
    type: 'INCOME' as 'INCOME' | 'EXPENSE',
    description: '',
    amount: 0,
    originType: 'MANUAL' as 'MANUAL' | 'INSTALLMENT' | 'INVOICE'
  });

  // Rateio entre empresas
  const [enableApportionment, setEnableApportionment] = useState(false);
  const [apportionment, setApportionment] = useState<{companyId: string, percentage: number}[]>([]);

  const addApportionmentCompany = () => {
    const availableCompanies = companies.filter(c => !apportionment.find(a => a.companyId === c.id));
    if (availableCompanies.length > 0) {
      setApportionment([...apportionment, { companyId: availableCompanies[0].id, percentage: 0 }]);
    }
  };

  const removeApportionmentCompany = (index: number) => {
    setApportionment(apportionment.filter((_, i) => i !== index));
  };

  const updateApportionment = (index: number, field: 'companyId' | 'percentage', value: string | number) => {
    const updated = [...apportionment];
    if (field === 'companyId') {
      updated[index].companyId = value as string;
    } else {
      updated[index].percentage = value as number;
    }
    setApportionment(updated);
  };

  const totalPercentage = apportionment.reduce((sum, a) => sum + a.percentage, 0);
  const isApportionmentValid = !enableApportionment || totalPercentage === 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (enableApportionment && formData.type === 'EXPENSE' && apportionment.length > 0) {
      // Criar movimentações para cada empresa do rateio
      for (const split of apportionment) {
        const splitAmount = (formData.amount * split.percentage) / 100;
        const company = companies.find(c => c.id === split.companyId);
        await addCashFlowMovement({
          companyId: split.companyId,
          date: formData.date,
          type: formData.type,
          description: `${formData.description} (${split.percentage}% rateio)`,
          amount: splitAmount,
          originType: formData.originType,
          apportionment: apportionment.map(a => ({
            companyId: a.companyId,
            percentage: a.percentage,
            value: (formData.amount * a.percentage) / 100
          }))
        });
      }
    } else {
      await addCashFlowMovement(formData);
    }

    setFormData({
      companyId: selectedCompanyId,
      date: new Date().toISOString().split('T')[0],
      type: 'INCOME',
      description: '',
      amount: 0,
      originType: 'MANUAL'
    });
    setEnableApportionment(false);
    setApportionment([]);
    setShowNewModal(false);
  };

  const companyCashFlow = cashFlow.filter(cf => cf.companyId === selectedCompanyId);
  const filtered = filter === 'ALL' ? companyCashFlow : companyCashFlow.filter(cf => cf.type === filter);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Fluxo de Caixa</h2>
          <p className="text-sm text-slate-500">Movimentações da empresa selecionada.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2">
            {['ALL', 'INCOME', 'EXPENSE'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 text-xs font-bold rounded-full transition-all border ${
                  filter === f ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {f === 'ALL' ? 'Todos' : f === 'INCOME' ? 'Receitas' : 'Despesas'}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Nova Movimentação
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-4">Data</th>
              <th className="p-4">Descrição</th>
              <th className="p-4">Tipo</th>
              <th className="p-4 text-right">Valor</th>
              <th className="p-4 text-right">Saldo Após</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(movement => (
              <tr key={movement.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 whitespace-nowrap text-slate-700">{formatDate(movement.date)}</td>
                <td className="p-4">
                  <p className="font-semibold text-slate-800">{movement.description}</p>
                  <p className="text-xs text-slate-500">{movement.originType}</p>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    movement.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {movement.type === 'INCOME' ? 'Receita' : 'Despesa'}
                  </span>
                </td>
                <td className={`p-4 text-right font-bold ${movement.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {movement.type === 'INCOME' ? '+' : '-'}{formatCurrency(movement.amount)}
                </td>
                <td className="p-4 text-right text-slate-700">{formatCurrency(movement.balanceAfter)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">Nenhuma movimentação encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Nova Movimentação */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Nova Movimentação</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select
                    required
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.type}
                    onChange={e => {
                      setFormData({...formData, type: e.target.value as any});
                      if (e.target.value === 'INCOME') {
                        setEnableApportionment(false);
                        setApportionment([]);
                      }
                    }}
                  >
                    <option value="INCOME">Receita</option>
                    <option value="EXPENSE">Despesa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Data</label>
                  <input required type="date" className="w-full border rounded-lg px-3 py-2" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <input required className="w-full border rounded-lg px-3 py-2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valor Total</label>
                <input required type="number" step="0.01" className="w-full border rounded-lg px-3 py-2" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} />
              </div>

              {/* Opção de Rateio - apenas para despesas */}
              {formData.type === 'EXPENSE' && companies.length > 1 && (
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-slate-700">Ratear entre empresas?</label>
                    <button
                      type="button"
                      onClick={() => {
                        setEnableApportionment(!enableApportionment);
                        if (!enableApportionment) {
                          setApportionment([{ companyId: companies[0].id, percentage: 100 }]);
                        } else {
                          setApportionment([]);
                        }
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        enableApportionment ? 'bg-amber-500' : 'bg-slate-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        enableApportionment ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {enableApportionment && (
                    <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                      <p className="text-xs text-slate-500 mb-3">Defina a porcentagem para cada empresa. O total deve ser 100%.</p>

                      {apportionment.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <select
                            className="flex-1 border rounded-lg px-3 py-2 text-sm"
                            value={item.companyId}
                            onChange={e => updateApportionment(index, 'companyId', e.target.value)}
                          >
                            {companies.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              className="w-20 border rounded-lg px-3 py-2 text-sm text-right"
                              value={item.percentage}
                              onChange={e => updateApportionment(index, 'percentage', parseInt(e.target.value) || 0)}
                            />
                            <span className="text-sm text-slate-500">%</span>
                          </div>
                          {apportionment.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeApportionmentCompany(index)}
                              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}

                      {apportionment.length < companies.length && (
                        <button
                          type="button"
                          onClick={addApportionmentCompany}
                          className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                        >
                          <Plus size={14} /> Adicionar empresa
                        </button>
                      )}

                      <div className={`flex justify-between items-center pt-3 border-t border-slate-200 ${
                        totalPercentage === 100 ? 'text-green-600' : 'text-red-500'
                      }`}>
                        <span className="text-sm font-medium">Total:</span>
                        <span className="font-bold">{totalPercentage}%</span>
                      </div>

                      {totalPercentage !== 100 && (
                        <p className="text-xs text-red-500">O total deve ser exatamente 100%</p>
                      )}

                      {formData.amount > 0 && totalPercentage === 100 && (
                        <div className="pt-3 border-t border-slate-200 space-y-1">
                          <p className="text-xs font-medium text-slate-600 mb-2">Valores por empresa:</p>
                          {apportionment.map((item, index) => {
                            const company = companies.find(c => c.id === item.companyId);
                            const value = (formData.amount * item.percentage) / 100;
                            return (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-slate-600">{company?.name}:</span>
                                <span className="font-medium text-slate-800">{formatCurrency(value)}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={!isApportionmentValid}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// PAGE: COMPANIES (Settings)
const CompanySettings = () => {
  const { companies, selectedCompanyId } = useFinance();
  const [showEditModal, setShowEditModal] = useState(false);
  const company = companies.find(c => c.id === selectedCompanyId);

  if (!company) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
       <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-slate-900 to-slate-800 z-0"></div>

          {/* Botão Editar no canto superior direito */}
          <button
            onClick={() => setShowEditModal(true)}
            className="absolute top-4 right-4 z-20 bg-white hover:bg-amber-50 text-amber-600 px-4 py-2 rounded-lg font-medium text-sm shadow-md transition-all flex items-center gap-2 border border-amber-200"
          >
            <Upload size={16} />
            Editar Empresa
          </button>
          
          <div className="relative z-10 pt-10">
            {company.logo ? (
                <img src={company.logo} alt={company.name} className="w-32 h-32 rounded-2xl mx-auto mb-4 object-cover shadow-xl border-4 border-white" />
            ) : (
                <div className="mx-auto mb-4 border-4 border-white rounded-2xl shadow-xl inline-block">
                    <LogoPlaceholder name={company.name} color={company.color} size="lg" />
                </div>
            )}
            <h1 className="text-3xl font-bold text-slate-900">{company.name}</h1>
            <p className="text-slate-500 font-mono mt-1">{company.cnpj}</p>
            
            <div className="mt-8 flex justify-center gap-6">
                <div className="px-8 py-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <p className="text-xs uppercase text-slate-400 font-bold tracking-wider">Saldo Inicial</p>
                    <p className="text-xl font-bold text-slate-800 mt-1">{formatCurrency(company.initialBalance)}</p>
                </div>
                <div className="px-8 py-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <p className="text-xs uppercase text-slate-400 font-bold tracking-wider">Saldo Atual</p>
                    <p className={`text-xl font-bold mt-1 ${company.currentBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatCurrency(company.currentBalance)}
                    </p>
                </div>
            </div>
          </div>
       </div>

       <EditCompanyModal
         isOpen={showEditModal}
         onClose={() => setShowEditModal(false)}
         company={company}
       />
    </div>
  );
};

// Reused Components (StatCard, PaymentModal) need to be defined or imported. 
// Assuming they are the same as before, just ensuring they are available in scope.
// (In a real app, these are separate files. Here, they are inside App.tsx or imported)
// For brevity, I am not re-pasting StatCard and PaymentModal unless logic changed significantly.
// PaymentModal logic was moved to Context but UI remains.

const StatCard = ({ title, value, type = 'neutral', subtext }: { title: string, value: string, type?: 'positive' | 'negative' | 'neutral' | 'info', subtext?: string }) => {
  const colors = {
    positive: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    negative: 'bg-rose-50 text-rose-700 border-rose-200',
    neutral: 'bg-white text-slate-700 border-slate-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200'
  };
  return (
    <div className={`p-5 rounded-xl border shadow-sm ${colors[type]} transition-transform hover:-translate-y-1`}>
      <h3 className="text-xs font-bold opacity-70 uppercase tracking-widest">{title}</h3>
      <p className="text-2xl font-bold mt-2 tracking-tight">{value}</p>
      {subtext && <p className="text-xs mt-1 opacity-75 font-medium">{subtext}</p>}
    </div>
  );
};

// PAGE: MONTHLY CLOSING (Fechamento Mensal)
const MonthlyClosingPage = () => {
  const { cashFlow, companies, selectedCompanyId } = useFinance();
  const { profitShareRecipients } = useAdmin();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [closingComplete, setClosingComplete] = useState(false);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Filter cash flow for selected month and company
  const monthCashFlow = cashFlow.filter(cf => {
    const cfDate = new Date(cf.date);
    return cf.companyId === selectedCompanyId &&
      cfDate.getMonth() === selectedMonth &&
      cfDate.getFullYear() === selectedYear;
  });

  const totalIncome = monthCashFlow
    .filter(cf => cf.type === 'INCOME')
    .reduce((sum, cf) => sum + cf.amount, 0);

  const totalExpense = monthCashFlow
    .filter(cf => cf.type === 'EXPENSE')
    .reduce((sum, cf) => sum + cf.amount, 0);

  const netProfit = totalIncome - totalExpense;
  const isProfit = netProfit > 0;

  // Calculate profit distribution
  const profitDistributions = profitShareRecipients.map(recipient => ({
    ...recipient,
    amount: isProfit ? (netProfit * recipient.percentage) / 100 : 0
  }));

  const totalDistributed = profitDistributions.reduce((sum, d) => sum + d.amount, 0);
  const retained = netProfit - totalDistributed;

  const handleExecuteClosing = () => {
    // Here you would save the closing to the database
    // For now, just show the confirmation
    setClosingComplete(true);
    setShowConfirmModal(false);
  };

  const company = companies.find(c => c.id === selectedCompanyId);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Fechamento Mensal</h2>
          <p className="text-sm text-slate-500">Calcule e distribua os lucros do período.</p>
        </div>
        <div className="flex gap-3">
          <select
            className="border border-slate-300 rounded-lg px-4 py-2"
            value={selectedMonth}
            onChange={e => setSelectedMonth(parseInt(e.target.value))}
          >
            {months.map((month, index) => (
              <option key={index} value={index}>{month}</option>
            ))}
          </select>
          <select
            className="border border-slate-300 rounded-lg px-4 py-2"
            value={selectedYear}
            onChange={e => setSelectedYear(parseInt(e.target.value))}
          >
            {[2024, 2025, 2026].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <ArrowRightLeft size={24} />
            </div>
          </div>
          <p className="text-sm text-slate-500 mb-1">Total Entradas</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <ArrowRightLeft size={24} />
            </div>
          </div>
          <p className="text-sm text-slate-500 mb-1">Total Saídas</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-lg ${isProfit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <DollarSign size={24} />
            </div>
          </div>
          <p className="text-sm text-slate-500 mb-1">{isProfit ? 'Lucro Líquido' : 'Prejuízo'}</p>
          <p className={`text-2xl font-bold ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(Math.abs(netProfit))}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <Building2 size={24} />
            </div>
          </div>
          <p className="text-sm text-slate-500 mb-1">Retido na Empresa</p>
          <p className="text-2xl font-bold text-amber-600">{formatCurrency(retained > 0 ? retained : 0)}</p>
        </div>
      </div>

      {/* Profit Distribution Preview */}
      {isProfit && profitShareRecipients.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Distribuição de Lucros</h3>
          <p className="text-sm text-slate-500 mb-6">
            Baseado nas configurações de admin, o lucro será distribuído da seguinte forma:
          </p>

          <div className="space-y-3">
            {profitDistributions.map(dist => (
              <div key={dist.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${dist.type === 'PERSON' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                    {dist.type === 'PERSON' ? <Users size={20} /> : <Building2 size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{dist.name}</p>
                    <p className="text-xs text-slate-500">{dist.percentage}% do lucro</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-green-600">{formatCurrency(dist.amount)}</p>
              </div>
            ))}

            {retained > 0 && (
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-amber-800">{company?.name || 'Empresa'}</p>
                    <p className="text-xs text-amber-600">Valor retido</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-amber-600">{formatCurrency(retained)}</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={closingComplete}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-colors ${
                closingComplete
                  ? 'bg-green-100 text-green-600 cursor-not-allowed'
                  : 'bg-slate-900 text-amber-500 hover:bg-slate-800'
              }`}
            >
              {closingComplete ? '✓ Fechamento Realizado' : 'Executar Fechamento'}
            </button>
          </div>
        </div>
      )}

      {/* No profit share configured */}
      {isProfit && profitShareRecipients.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl">
          <div className="flex items-start gap-4">
            <AlertTriangle className="text-amber-600 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-bold text-amber-800">Nenhum beneficiário configurado</h4>
              <p className="text-sm text-amber-700 mt-1">
                Configure os beneficiários da divisão de lucros na área de Admin antes de realizar o fechamento.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No profit */}
      {!isProfit && (
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl text-center">
          <p className="text-slate-600">
            {netProfit === 0 ? 'Não há lucro nem prejuízo neste período.' : 'Este período apresentou prejuízo. Não há lucros a distribuir.'}
          </p>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Confirmar Fechamento</h2>
            <p className="text-slate-500 mb-6">
              Você está prestes a executar o fechamento de {months[selectedMonth]}/{selectedYear}.
              Esta ação registrará a distribuição de lucros.
            </p>
            <div className="bg-slate-50 p-4 rounded-lg mb-6 text-left">
              <p className="text-sm text-slate-600 mb-2">Resumo:</p>
              <p className="font-medium">Lucro: <span className="text-green-600">{formatCurrency(netProfit)}</span></p>
              <p className="font-medium">A distribuir: <span className="text-blue-600">{formatCurrency(totalDistributed)}</span></p>
              <p className="font-medium">Retido: <span className="text-amber-600">{formatCurrency(retained)}</span></p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 px-4 border-2 border-slate-200 rounded-lg font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteClosing}
                className="flex-1 py-3 px-4 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {closingComplete && (
        <div className="bg-green-50 border border-green-200 p-6 rounded-xl">
          <div className="flex items-center gap-4">
            <CheckCircle className="text-green-600" size={24} />
            <div>
              <h4 className="font-bold text-green-800">Fechamento Realizado com Sucesso!</h4>
              <p className="text-sm text-green-700 mt-1">
                O fechamento de {months[selectedMonth]}/{selectedYear} foi registrado.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// PAGE: ADMIN
const AdminPage = () => {
  const {
    isAdminLoggedIn,
    adminLogin,
    adminLogout,
    commissionSettings,
    profitShareRecipients,
    updateCommissionSettings,
    addProfitShareRecipient,
    updateProfitShareRecipient,
    deleteProfitShareRecipient
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'commissions' | 'profitShare' | 'permissions'>('commissions');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Commission form
  const [commissionForm, setCommissionForm] = useState({
    sdrPercentage: commissionSettings.sdrPercentage,
    closerPercentage: commissionSettings.closerPercentage
  });

  // Profit share form
  const [showNewRecipient, setShowNewRecipient] = useState(false);
  const [recipientForm, setRecipientForm] = useState({
    name: '',
    type: 'PERSON' as 'PERSON' | 'COMPANY',
    document: '',
    percentage: 0
  });

  useEffect(() => {
    setCommissionForm({
      sdrPercentage: commissionSettings.sdrPercentage,
      closerPercentage: commissionSettings.closerPercentage
    });
  }, [commissionSettings]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = adminLogin(loginForm.username, loginForm.password);
    if (!success) {
      setLoginError('Credenciais inválidas');
    }
  };

  const handleSaveCommissions = async () => {
    await updateCommissionSettings(commissionForm);
    alert('Configurações de comissão salvas!');
  };

  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    await addProfitShareRecipient(recipientForm);
    setRecipientForm({ name: '', type: 'PERSON', document: '', percentage: 0 });
    setShowNewRecipient(false);
  };

  const totalProfitShare = profitShareRecipients.reduce((sum, r) => sum + r.percentage, 0);

  // Login screen if not admin
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto mt-20 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Área Admin</h1>
            <p className="text-slate-500 mt-1">Faça login para acessar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Usuário</label>
              <input
                type="text"
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                value={loginForm.username}
                onChange={e => setLoginForm({...loginForm, username: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <input
                type="password"
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                value={loginForm.password}
                onChange={e => setLoginForm({...loginForm, password: e.target.value})}
              />
            </div>
            {loginError && (
              <p className="text-red-500 text-sm">{loginError}</p>
            )}
            <button
              type="submit"
              className="w-full bg-slate-900 text-amber-500 font-bold py-3.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Painel Administrativo</h2>
          <p className="text-sm text-slate-500">Configure as opções do sistema.</p>
        </div>
        <button
          onClick={adminLogout}
          className="text-slate-500 hover:text-red-500 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
        >
          <LogOut size={18} /> Sair do Admin
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
        {[
          { id: 'commissions', label: 'Comissões', icon: BadgePercent },
          { id: 'profitShare', label: 'Divisão de Lucros', icon: DollarSign },
          { id: 'permissions', label: 'Permissões', icon: Lock }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-amber-500'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        {/* Commission Settings */}
        {activeTab === 'commissions' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4">Configuração de Comissões</h3>
              <p className="text-sm text-slate-500 mb-6">
                Defina a porcentagem de comissão para cada tipo de vendedor. Essas configurações serão aplicadas automaticamente ao criar novas comissões.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500 text-white rounded-lg">
                    <BadgePercent size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900">SDR</h4>
                    <p className="text-xs text-blue-600">Sales Development Representative</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-24 border border-blue-300 rounded-lg px-3 py-2 text-xl font-bold text-blue-900 text-center"
                    value={commissionForm.sdrPercentage}
                    onChange={e => setCommissionForm({...commissionForm, sdrPercentage: parseFloat(e.target.value) || 0})}
                  />
                  <span className="text-xl font-bold text-blue-600">%</span>
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-500 text-white rounded-lg">
                    <BadgePercent size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-purple-900">Closer</h4>
                    <p className="text-xs text-purple-600">Fechador de Vendas</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-24 border border-purple-300 rounded-lg px-3 py-2 text-xl font-bold text-purple-900 text-center"
                    value={commissionForm.closerPercentage}
                    onChange={e => setCommissionForm({...commissionForm, closerPercentage: parseFloat(e.target.value) || 0})}
                  />
                  <span className="text-xl font-bold text-purple-600">%</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveCommissions}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
            >
              Salvar Configurações
            </button>
          </div>
        )}

        {/* Profit Share */}
        {activeTab === 'profitShare' && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Divisão de Lucros</h3>
                <p className="text-sm text-slate-500">
                  Configure quem recebe parte dos lucros no fechamento mensal.
                </p>
              </div>
              <button
                onClick={() => setShowNewRecipient(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
              >
                <Plus size={16} /> Adicionar
              </button>
            </div>

            {/* Total Percentage */}
            <div className={`p-4 rounded-lg ${totalProfitShare === 100 ? 'bg-green-50 border border-green-200' : totalProfitShare > 100 ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
              <div className="flex justify-between items-center">
                <span className="font-medium">Total de Distribuição:</span>
                <span className={`text-xl font-bold ${totalProfitShare === 100 ? 'text-green-600' : totalProfitShare > 100 ? 'text-red-600' : 'text-amber-600'}`}>
                  {totalProfitShare}%
                </span>
              </div>
              {totalProfitShare !== 100 && (
                <p className="text-sm mt-2 opacity-75">
                  {totalProfitShare > 100 ? 'O total excede 100%. Ajuste os valores.' : 'O total não soma 100%. O restante ficará retido na empresa.'}
                </p>
              )}
            </div>

            {/* Recipients List */}
            <div className="space-y-3">
              {profitShareRecipients.map(recipient => (
                <div key={recipient.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${recipient.type === 'PERSON' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                      {recipient.type === 'PERSON' ? <Users size={20} /> : <Building2 size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{recipient.name}</p>
                      <p className="text-xs text-slate-500">{recipient.type === 'PERSON' ? 'Pessoa Física' : 'Pessoa Jurídica'} · {recipient.document}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-800">{recipient.percentage}%</p>
                    </div>
                    <button
                      onClick={() => deleteProfitShareRecipient(recipient.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {profitShareRecipients.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <DollarSign size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Nenhum beneficiário cadastrado.</p>
                </div>
              )}
            </div>

            {/* Add Recipient Modal */}
            {showNewRecipient && (
              <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Novo Beneficiário</h3>
                    <button onClick={() => setShowNewRecipient(false)} className="text-slate-400 hover:text-slate-600">
                      <X size={20} />
                    </button>
                  </div>
                  <form onSubmit={handleAddRecipient} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Tipo</label>
                      <select
                        className="w-full border rounded-lg px-3 py-2"
                        value={recipientForm.type}
                        onChange={e => setRecipientForm({...recipientForm, type: e.target.value as any})}
                      >
                        <option value="PERSON">Pessoa Física</option>
                        <option value="COMPANY">Pessoa Jurídica</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nome</label>
                      <input
                        required
                        className="w-full border rounded-lg px-3 py-2"
                        value={recipientForm.name}
                        onChange={e => setRecipientForm({...recipientForm, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{recipientForm.type === 'PERSON' ? 'CPF' : 'CNPJ'}</label>
                      <input
                        required
                        className="w-full border rounded-lg px-3 py-2"
                        value={recipientForm.document}
                        onChange={e => setRecipientForm({...recipientForm, document: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Porcentagem (%)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        max="100"
                        className="w-full border rounded-lg px-3 py-2"
                        value={recipientForm.percentage}
                        onChange={e => setRecipientForm({...recipientForm, percentage: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-bold">
                      Adicionar
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Permissions */}
        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Permissões de Usuários</h3>
              <p className="text-sm text-slate-500">
                Defina o que cada usuário pode acessar no sistema.
              </p>
            </div>

            <div className="text-center py-12 text-slate-400">
              <Lock size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium">Em desenvolvimento</p>
              <p className="text-sm mt-2">As permissões de usuários serão implementadas em breve.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PaymentModal = ({ isOpen, onClose, installment, onConfirm }: any) => {
   const { cards } = useFinance();
   const [method, setMethod] = useState<PaymentMethod>('PIX');
   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
   const [cardId, setCardId] = useState('');
 
   if (!isOpen || !installment) return null;
 
   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     onConfirm(method, date, method === 'CREDIT_CARD' ? cardId : undefined);
     onClose();
   };
 
   return (
     <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
         <button 
           onClick={onClose}
           className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all"
         >
           <X size={20} />
         </button>

         <h2 className="text-xl font-bold text-slate-900 mb-1">Confirmar Pagamento</h2>
         <p className="text-sm text-slate-500 mb-6">Realizar baixa da parcela.</p>

         <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-100">
           <p className="text-sm font-semibold text-slate-800">{installment.contractDescription}</p>
           <p className="text-xs text-slate-500 mt-1">{installment.supplierName}</p>
           <p className="text-xl font-bold text-slate-900 mt-2">{formatCurrency(installment.amount)}</p>
         </div>
         
         <form onSubmit={handleSubmit} className="space-y-4">
           <div>
             <label className="block text-sm font-medium mb-1 text-slate-700">Data do Pagamento</label>
             <input 
               type="date" 
               value={date} 
               onChange={e => setDate(e.target.value)} 
               className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" 
             />
           </div>
           <div>
             <label className="block text-sm font-medium mb-1 text-slate-700">Método</label>
             <select 
               value={method} 
               onChange={e => setMethod(e.target.value as any)} 
               className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
             >
               <option value="PIX">PIX</option>
               <option value="BOLETO">Boleto</option>
               <option value="TRANSFER">Transferência</option>
               <option value="CREDIT_CARD">Cartão de Crédito</option>
             </select>
           </div>
           {method === 'CREDIT_CARD' && (
             <div className="animate-in fade-in slide-in-from-top-2 duration-200">
               <label className="block text-sm font-medium mb-1 text-slate-700">Selecione o Cartão</label>
               <select 
                 value={cardId} 
                 onChange={e => setCardId(e.target.value)} 
                 className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" 
                 required
               >
                 <option value="">Selecione...</option>
                 {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
               <p className="text-xs text-amber-600 mt-2 flex items-center">
                 <AlertTriangle size={12} className="mr-1"/>
                 O valor entrará na fatura do cartão.
               </p>
             </div>
           )}
           <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
             <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancelar</button>
             <button type="submit" className="px-5 py-2.5 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all">Confirmar Pagamento</button>
           </div>
         </form>
       </div>
     </div>
   );
 };

// --- MAIN LAYOUT ---
const Layout = () => {
  const { companies, loading } = useFinance();
  const [activePage, setActivePage] = useState('dashboard');
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  // Handle "more" menu navigation
  const handleSetActivePage = (page: string) => {
    if (page === 'more') {
      setMoreMenuOpen(true);
    } else {
      setActivePage(page);
      setMoreMenuOpen(false);
    }
  };

  // Page titles for mobile header
  const pageTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    contracts: 'Contratos',
    agenda: 'Parcelas',
    cashflow: 'Fluxo de Caixa',
    companies: 'Minha Empresa',
    cards: 'Cartões',
    suppliers: 'Fornecedores',
  };

  // Show loading while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  // ONBOARDING CHECK: If no companies, force creation
  if (companies.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <NewCompanyModal isOpen={true} onClose={() => {}} isWelcome={true} />
      </div>
    );
  }

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'agenda': return <AgendaPage />;
      case 'contracts': return <ContractsPage />;
      case 'companies': return <CompanySettings />;
      case 'suppliers': return <SuppliersPage />;
      case 'clients': return <ClientsPage />;
      case 'commissions': return <CommissionsPage />;
      case 'cards': return <CardsPage />;
      case 'cashflow': return <CashFlowPage />;
      case 'closing': return <MonthlyClosingPage />;
      case 'admin': return <AdminPage />;
      default: return (
        <div className="flex flex-col items-center justify-center h-96 text-slate-400 animate-in fade-in duration-500">
          <Building2 size={48} className="mb-4 opacity-50"/>
          <h2 className="text-lg font-medium">Módulo em Desenvolvimento</h2>
          <p>A página <strong>{activePage.charAt(0).toUpperCase() + activePage.slice(1)}</strong> está pronta na estrutura.</p>
        </div>
      );
    }
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans pb-20">
        <MobileHeader title={pageTitles[activePage] || 'Dashboard'} />

        <main className="p-4 overflow-y-auto">
          {renderContent()}
        </main>

        <MobileBottomNav activePage={activePage} setActivePage={handleSetActivePage} />
        <MobileMoreMenu
          isOpen={moreMenuOpen}
          onClose={() => setMoreMenuOpen(false)}
          activePage={activePage}
          setActivePage={handleSetActivePage}
        />
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <div className="ml-64 flex-1 flex flex-col">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center text-slate-400 text-sm">
            <span>Financeiro</span>
            <span className="mx-2">/</span>
            <span className="text-slate-800 font-medium capitalize">{activePage}</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
            </button>
            <div className="h-9 w-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold border border-slate-200 shadow-sm">AD</div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto scrollbar-thin">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// --- APP ENTRY ---
const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <FinanceProvider>
      <AdminProvider>
        <Layout />
      </AdminProvider>
    </FinanceProvider>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;