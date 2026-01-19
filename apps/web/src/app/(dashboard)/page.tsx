'use client';

import { useDashboardResumo, useDashboardGraficoMensal, useDashboardProximosVencimentos, useDashboardAtrasados } from '@/hooks';
import { formatCurrency } from '@gestao-financeira/shared/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, TrendingUp } from 'lucide-react';

const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function SummaryCard({
  title,
  value,
  color,
  icon: Icon,
}: {
  title: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(value)}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>{Icon}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: resumo, isLoading: loadingResumo } = useDashboardResumo();
  const { data: graficoData, isLoading: loadingGrafico } = useDashboardGraficoMensal();
  const { data: proximasVencimentos } = useDashboardProximosVencimentos();
  const { data: atrasados } = useDashboardAtrasados();

  const chartData = graficoData?.map((mes: any, idx: number) => ({
    mes: meses[mes.mes - 1],
    previsto: mes.previsto,
    pago: mes.pago,
  })) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Bem-vindo ao seu painel de gestão financeira</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Previsto"
          value={resumo?.previsto || 0}
          color="bg-blue-100"
          icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
        />
        <SummaryCard
          title="Pago"
          value={resumo?.pago || 0}
          color="bg-green-100"
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
        />
        <SummaryCard
          title="Em Aberto"
          value={resumo?.emAberto || 0}
          color="bg-yellow-100"
          icon={<TrendingUp className="w-6 h-6 text-yellow-600" />}
        />
        <SummaryCard
          title="Atrasado"
          value={resumo?.atrasado || 0}
          color="bg-red-100"
          icon={<AlertCircle className="w-6 h-6 text-red-600" />}
        />
      </div>

      {/* Chart */}
      {!loadingGrafico && chartData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Resumo Mensal</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="previsto" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="pago" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Vencimentos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Vencimentos (Próximos 7 dias)</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {proximasVencimentos?.parcelas && proximasVencimentos.parcelas.length > 0 ? (
              proximasVencimentos.parcelas.map((parcela: any) => (
                <div key={parcela.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">
                      {parcela.contrato.cliente.nome}
                    </p>
                    <p className="text-xs text-gray-600">{parcela.competencia}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(parcela.valorPrevisto)}</p>
                    <p className="text-xs text-gray-600">{new Date(parcela.dataVencimento).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Nenhum vencimento nos próximos 7 dias</p>
            )}
          </div>
        </div>

        {/* Atrasados */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Atrasados ({atrasados?.count || 0})
            </span>
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {atrasados?.parcelas && atrasados.parcelas.length > 0 ? (
              atrasados.parcelas.map((parcela: any) => (
                <div key={parcela.id} className="flex justify-between items-center p-3 bg-red-50 rounded">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">
                      {parcela.contrato.cliente.nome}
                    </p>
                    <p className="text-xs text-red-600">{parcela.diasAtraso} dias de atraso</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{formatCurrency(parcela.valorPrevisto)}</p>
                    <p className="text-xs text-gray-600">{new Date(parcela.dataVencimento).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Nenhuma parcela atrasada!</p>
            )}
          </div>
          {atrasados?.total && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="flex justify-between text-sm font-bold text-gray-900">
                <span>Total Atrasado:</span>
                <span className="text-red-600">{formatCurrency(atrasados.total)}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
