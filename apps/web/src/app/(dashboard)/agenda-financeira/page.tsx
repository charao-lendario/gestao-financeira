'use client';

import { useState, useMemo } from 'react';
import { useParcelas, useMarcarPago } from '@/hooks';
import { formatCurrency, formatDate } from '@gestao-financeira/shared/utils';
import { CalendarioFinanceiro } from '@/components/calendario-financeiro';
import { Check } from 'lucide-react';
import { toast } from 'sonner';

export default function AgendaFinanceiraPage() {
  const { data: parcelasData } = useParcelas(1, {});
  const marcarPagoMutation = useMarcarPago();
  const [selectedParcela, setSelectedParcela] = useState<any>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [pagamentoData, setPagamentoData] = useState({
    dataPagamento: new Date().toISOString().split('T')[0],
    valorPago: 0,
    formaRecebimento: 'PIX',
  });

  // Contar parcelas por status
  const stats = useMemo(() => {
    if (!parcelasData?.data) return { previsto: 0, pago: 0, atrasado: 0 };

    const contadores = {
      previsto: 0,
      pago: 0,
      atrasado: 0,
    };

    parcelasData.data.forEach((p: any) => {
      if (p.status === 'PAGO') contadores.pago++;
      else if (p.status === 'ATRASADO') contadores.atrasado++;
      else contadores.previsto++;
    });

    return contadores;
  }, [parcelasData]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Agenda Financeira</h1>
        <p className="text-gray-600 mt-2">Visualize as parcelas por data de vencimento</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-yellow-50 rounded-lg shadow p-4 border-l-4 border-yellow-400">
          <p className="text-gray-600 text-sm font-medium">Previstos</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.previsto}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 border-l-4 border-green-400">
          <p className="text-gray-600 text-sm font-medium">Pagos</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pago}</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4 border-l-4 border-red-400">
          <p className="text-gray-600 text-sm font-medium">Atrasados</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.atrasado}</p>
        </div>
      </div>

      {/* Calendar */}
      <CalendarioFinanceiro
        parcelas={parcelasData?.data || []}
        onSelectParcela={(parcela) => {
          setSelectedParcela(parcela);
          setPagamentoData({
            dataPagamento: new Date().toISOString().split('T')[0],
            valorPago: Number(parcela.valorPrevisto),
            formaRecebimento: 'PIX',
          });
          if (parcela.status !== 'PAGO') {
            setShowPaymentForm(true);
          }
        }}
      />

      {/* Selected Parcela Info */}
      {selectedParcela && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Detalhes da Parcela</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Cliente</p>
              <p className="font-semibold text-gray-900 mt-1">
                {selectedParcela.contrato.cliente.nome}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor</p>
              <p className="font-semibold text-gray-900 mt-1">
                {formatCurrency(selectedParcela.valorPrevisto)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vencimento</p>
              <p className="font-semibold text-gray-900 mt-1">
                {formatDate(selectedParcela.dataVencimento)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className={`font-semibold mt-1 ${
                selectedParcela.status === 'PAGO'
                  ? 'text-green-600'
                  : selectedParcela.status === 'ATRASADO'
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }`}>
                {selectedParcela.status}
              </p>
            </div>
          </div>

          {selectedParcela.status !== 'PAGO' && (
            <button
              onClick={() => setShowPaymentForm(true)}
              className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Marcar como Pago
            </button>
          )}
        </div>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && selectedParcela && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Marcar Parcela como Paga
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Cliente: <strong>{selectedParcela.contrato.cliente.nome}</strong>
            </p>

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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
