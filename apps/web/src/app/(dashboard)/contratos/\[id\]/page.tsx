'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useContratoById, useMarcarPago } from '@/hooks';
import { formatCurrency, formatDate } from '@gestao-financeira/shared/utils';
import { ArrowLeft, Edit2, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function ContratoDetailPage({ params }: { params: { id: string } }) {
  const { data: contrato, isLoading } = useContratoById(params.id);
  const marcarPagoMutation = useMarcarPago();
  const [selectedParcela, setSelectedParcela] = useState<any>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [pagamentoData, setPagamentoData] = useState({
    dataPagamento: new Date().toISOString().split('T')[0],
    valorPago: 0,
    formaRecebimento: 'PIX',
  });

  const handleMarcarPago = () => {
    if (!selectedParcela) return;

    if (!pagamentoData.dataPagamento || pagamentoData.valorPago <= 0) {
      toast.error('Preencha todos os campos');
      return;
    }

    marcarPagoMutation.mutate(
      { id: selectedParcela.id, data: pagamentoData },
      {
        onSuccess: () => {
          toast.success('Parcela marcada como paga!');
          setShowPaymentForm(false);
          setSelectedParcela(null);
          setPagamentoData({
            dataPagamento: new Date().toISOString().split('T')[0],
            valorPago: 0,
            formaRecebimento: 'PIX',
          });
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.error || 'Erro ao marcar como pago');
        },
      }
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (!contrato) {
    return <div className="text-center py-8">Contrato não encontrado</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/contratos"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{contrato.nomeProjeto}</h1>
            <p className="text-gray-600 mt-1">{contrato.contratoId}</p>
          </div>
        </div>
        <Link
          href={`/contratos/${contrato.id}/editar`}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <Edit2 className="w-5 h-5" />
          Editar
        </Link>
      </div>

      {/* Contract Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Cliente</p>
          <p className="text-xl font-bold text-gray-900 mt-2">{contrato.cliente.nome}</p>
          <p className="text-sm text-gray-500 mt-1">{contrato.cliente.clienteId}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Valor Total</p>
          <p className="text-xl font-bold text-gray-900 mt-2">
            {formatCurrency(contrato.valorTotal)}
          </p>
          <p className="text-sm text-gray-500 mt-1">{contrato.formaPagamento}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Status</p>
          <p className="text-xl font-bold text-gray-900 mt-2">{contrato.status}</p>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(contrato.dataContrato)}
          </p>
        </div>
      </div>

      {/* Installments */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Parcelas ({contrato.parcelas?.length || 0})</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nº</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Competência</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Vencimento</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Valor</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contrato.parcelas && contrato.parcelas.length > 0 ? (
                contrato.parcelas.map((parcela: any) => (
                  <tr key={parcela.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {parcela.numeroParcela}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{parcela.competencia}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(parcela.dataVencimento)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {formatCurrency(parcela.valorPrevisto)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          parcela.status === 'PAGO'
                            ? 'bg-green-100 text-green-800'
                            : parcela.status === 'ATRASADO'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {parcela.status}
                        {parcela.diasAtraso > 0 && ` (${parcela.diasAtraso}d)`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {parcela.status !== 'PAGO' && (
                        <button
                          onClick={() => {
                            setSelectedParcela(parcela);
                            setPagamentoData({
                              dataPagamento: new Date().toISOString().split('T')[0],
                              valorPago: Number(parcela.valorPrevisto),
                              formaRecebimento: 'PIX',
                            });
                            setShowPaymentForm(true);
                          }}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 text-xs font-medium flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Marcar Pago
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhuma parcela encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && selectedParcela && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Marcar Parcela #{selectedParcela.numeroParcela} como Paga
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data do Pagamento
                </label>
                <input
                  type="date"
                  value={pagamentoData.dataPagamento}
                  onChange={(e) =>
                    setPagamentoData((prev) => ({
                      ...prev,
                      dataPagamento: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Pago
                </label>
                <input
                  type="number"
                  value={pagamentoData.valorPago}
                  onChange={(e) =>
                    setPagamentoData((prev) => ({
                      ...prev,
                      valorPago: parseFloat(e.target.value) || 0,
                    }))
                  }
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forma de Recebimento
                </label>
                <select
                  value={pagamentoData.formaRecebimento}
                  onChange={(e) =>
                    setPagamentoData((prev) => ({
                      ...prev,
                      formaRecebimento: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="PIX">PIX</option>
                  <option value="TRANSFERENCIA">Transferência</option>
                  <option value="BOLETO">Boleto</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CARTAO">Cartão</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t">
              <button
                onClick={() => {
                  setShowPaymentForm(false);
                  setSelectedParcela(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleMarcarPago}
                disabled={marcarPagoMutation.isPending}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
