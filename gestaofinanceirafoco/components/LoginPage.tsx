import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, User, AlertCircle, CheckCircle, Send } from 'lucide-react';
import { BackgroundAnimation } from './FloatingPaths';

export const LoginPage = () => {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setError(error.message || 'Erro ao fazer login');
        }
      } else {
        // Registro
        if (formData.password !== formData.confirmPassword) {
          setError('As senhas não coincidem');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres');
          setLoading(false);
          return;
        }

        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          setError(error.message || 'Erro ao criar conta');
        } else {
          setError('');
          setSuccessMessage(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar requisição');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-6 sm:p-4 overflow-hidden">
      <BackgroundAnimation />
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-6 sm:mb-8 animate-in fade-in zoom-in duration-500">
          <img
            src="/foco-logo.png"
            alt="Foco no Comercial"
            className="h-16 sm:h-24 mx-auto mb-3 sm:mb-4"
          />
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">Gestão <span className="text-amber-500">Financeira</span></h1>
          <p className="text-slate-400 text-sm sm:text-base">Controle financeiro profissional</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-8 mb-4 sm:mb-6 animate-in slide-in-from-top-4 duration-500">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-full mb-3 sm:mb-4">
                <CheckCircle size={24} className="text-emerald-600 sm:hidden" />
                <CheckCircle size={32} className="text-emerald-600 hidden sm:block" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Conta criada com sucesso!</h3>
              <p className="text-slate-600 mb-4">
                Enviamos um email de confirmação para <span className="font-semibold text-amber-600">{formData.email}</span>
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Send size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm text-amber-900 font-medium mb-1">Verifique sua caixa de entrada</p>
                    <p className="text-xs text-amber-700">
                      Clique no link de confirmação que enviamos para ativar sua conta e fazer login.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setSuccessMessage(false);
                  setIsLogin(true);
                  setFormData({ email: '', password: '', fullName: '', confirmPassword: '' });
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Ir para o Login
              </button>
            </div>
          </div>
        )}

        {/* Form Card */}
        {!successMessage && (
          <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {isLogin ? 'Bem-vindo de volta' : 'Criar nova conta'}
            </h2>
            <p className="text-slate-500 mt-1 text-sm sm:text-base">
              {isLogin ? 'Entre para acessar sua conta' : 'Cadastre-se para começar'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top duration-200">
              <AlertCircle size={18} className="text-rose-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-rose-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nome Completo
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                    placeholder="Seu nome"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processando...
                </span>
              ) : (
                <span>{isLogin ? 'Entrar' : 'Criar Conta'}</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ email: '', password: '', fullName: '', confirmPassword: '' });
              }}
              className="text-sm text-slate-600 hover:text-amber-600 transition-colors"
            >
              {isLogin ? (
                <>Não tem uma conta? <span className="font-bold">Criar conta</span></>
              ) : (
                <>Já tem uma conta? <span className="font-bold">Fazer login</span></>
              )}
            </button>
          </div>
        </div>
        )}

        {/* Footer */}
        <div className="text-center mt-4 sm:mt-8 text-slate-400 text-xs sm:text-sm animate-in fade-in duration-700 delay-200">
          <p>Gestão financeira completa para holdings e empresas</p>
        </div>
      </div>
    </div>
  );
};
