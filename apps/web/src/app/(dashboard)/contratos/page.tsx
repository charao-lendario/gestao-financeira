'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useContratos, useDeleteContrato } from '@/hooks';
import { formatCurrency } from '@gestao-financeira/shared/utils';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function ContratosPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('ATIVO');
  const { data: contratosData, isLoading } = useContratos(page, undefined, status);
  const deleteContratoMutation = useDeleteContrato();

  const handleDelete = (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja deletar o contrato "${nome}"?`)) {
      deleteContratoMutation.mutate(id, {
        onSuccess: () => {
          toast.success('Contrato deletado com sucesso!');
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.error || 'Erro ao deletar contrato');
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contratos</h1>
          <p className="text-gray-600 mt-2">
            Total: {contratosData?.pagination?.total || 0} contrato(s)
          </p>
        </div>
        <Link
          href="/contratos/novo"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Contrato
        </Link>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['ATIVO', 'FINALIZADO', 'CANCELADO'].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              status === s
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Projeto</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cliente</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Valor</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Forma Pagamento</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : contratosData?.data && contratosData.data.length > 0 ? (
                contratosData.data.map((contrato: any) => (
                  <tr key={contrato.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{contrato.contratoId}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{contrato.nomeProjeto}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{contrato.cliente.nome}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {formatCurrency(contrato.valorTotal)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {contrato.formaPagamento === 'A_VISTA'
                          ? 'À Vista'
                          : contrato.formaPagamento === 'PARCELADO'
                          ? 'Parcelado'
                          : 'Mensalidade'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          contrato.status === 'ATIVO'
                            ? 'bg-green-100 text-green-800'
                            : contrato.status === 'FINALIZADO'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {contrato.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                      <Link
                        href={`/contratos/${contrato.id}`}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/contratos/${contrato.id}/editar`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(contrato.id, contrato.nomeProjeto)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        disabled={deleteContratoMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Nenhum contrato encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {contratosData?.pagination && contratosData.pagination.totalPages > 1 && (
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
              Página {page} de {contratosData.pagination.totalPages}
            </span>
          </div>
          <button
            onClick={() => setPage(Math.min(contratosData.pagination.totalPages, page + 1))}
            disabled={page === contratosData.pagination.totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
