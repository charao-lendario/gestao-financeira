'use client';

import { Menu, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 rounded hover:bg-gray-100">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Gestão Financeira</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2">
          <User className="w-5 h-5 text-gray-600" />
          <span className="text-sm text-gray-600">{user?.nome || user?.email}</span>
        </div>
        <button
          className="p-2 rounded-full hover:bg-gray-100 transition"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </nav>
  );
}
