'use client';

import { Menu, LogOut, User } from 'lucide-react';
import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 rounded hover:bg-gray-100">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Gestão Financeira</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <User className="w-5 h-5 text-gray-600" />
        </button>
        <button
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
        >
          <LogOut className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </nav>
  );
}
