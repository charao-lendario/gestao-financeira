import { PropsWithChildren } from 'react';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { ProtectedRoute } from '@/components/protected-route';

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-8">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
