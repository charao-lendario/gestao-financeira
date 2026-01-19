'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useClientes, useDeleteCliente } from '@/hooks';
import { formatCPFOrCNPJ } from '@gestao-financeira/shared/utils';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function ClientesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data: clientesData, isLoading } = useClientes(page, search);
  const deleteClienteMutation = useDeleteCliente();

  const handleDelete = (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja deletar o cliente "${nome}"?`)) {
      deleteClienteMutation.mutate(id, {
        onSuccess: () => {
          toast.success('Cliente deletado com sucesso!');
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.error || 'Erro ao deletar cliente');
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-2">
            Total: {clientesData?.pagination?.total || 0} cliente(s)
          </p>
        </div>
        <Link
          href="/clientes/novo"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome, documento ou email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nome</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Documento</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : clientesData?.data && clientesData.data.length > 0 ? (
                clientesData.data.map((cliente: any) => (
                  <tr key={cliente.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{cliente.clienteId}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{cliente.nome}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatCPFOrCNPJ(cliente.documento)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{cliente.email || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          cliente.status === 'ATIVO'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {cliente.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                      <Link
                        href={`/clientes/${cliente.id}/editar`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(cliente.id, cliente.nome)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        disabled={deleteClienteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhum cliente encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {clientesData?.pagination && clientesData.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Página {page} de {clientesData.pagination.totalPages}
            </span>
          </div>
          <button
            onClick={() => setPage(Math.min(clientesData.pagination.totalPages, page + 1))}
            disabled={page === clientesData.pagination.totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
