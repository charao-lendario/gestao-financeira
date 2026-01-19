'use client';

import { useDashboardResumo, useDashboardGraficoMensal, useDashboardProximosVencimentos, useDashboardAtrasados } from '@/hooks';
import { formatCurrency, formatDate } from '@gestao-financeira/shared/utils';
import { useState } from 'react';
import Link from 'next/link';

const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function StatCard({ title, value, subtitle, color = 'blue' }: {
    title: string;
    value: string;
    subtitle?: string;
    color?: 'blue' | 'green' | 'yellow' | 'red';
}) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-700',
        green: 'bg-green-50 text-green-700',
        yellow: 'bg-yellow-50 text-yellow-700',
        red: 'bg-red-50 text-red-700',
    };

    return (
        <div className={`p-6 rounded-lg ${colorClasses[color]}`}>
            <h3 className="text-sm font-medium opacity-75">{title}</h3>
            <p className="text-2xl font-bold mt-2">{value}</p>
            {subtitle && <p className="text-xs mt-1 opacity-60">{subtitle}</p>}
        </div>
    );
}

export default function DashboardPage() {
    const { data: resumo, isLoading: loadingResumo } = useDashboardResumo();
    const { data: graficoData, isLoading: loadingGrafico } = useDashboardGraficoMensal();
    const { data: proximasVencimentos } = useDashboardProximosVencimentos();
    const { data: atrasados } = useDashboardAtrasados();

    const [selectedMonth] = useState(new Date().getMonth());

    if (loadingResumo || loadingGrafico) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <div className="text-sm text-gray-500">
                    {MONTHS[selectedMonth]} {new Date().getFullYear()}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Previsto (Mês)"
                    value={formatCurrency(resumo?.previsto || 0)}
                    color="blue"
                />
                <StatCard
                    title="Recebido (Mês)"
                    value={formatCurrency(resumo?.pago || 0)}
                    color="green"
                />
                <StatCard
                    title="Em Aberto"
                    value={formatCurrency(resumo?.emAberto || 0)}
                    color="yellow"
                />
                <StatCard
                    title="Atrasado"
                    value={formatCurrency(resumo?.atrasado || 0)}
                    color="red"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Próximos Vencimentos */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Próximos Vencimentos (7 dias)
                    </h2>
                    {proximasVencimentos?.length > 0 ? (
                        <div className="space-y-3">
                            {proximasVencimentos.slice(0, 5).map((parcela: any) => (
                                <div key={parcela.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{parcela.contrato?.cliente?.nome}</p>
                                        <p className="text-sm text-gray-500">{parcela.contrato?.nomeProjeto}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">{formatCurrency(Number(parcela.valorPrevisto))}</p>
                                        <p className="text-sm text-gray-500">{formatDate(parcela.dataVencimento)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">Nenhum vencimento nos próximos 7 dias</p>
                    )}
                </div>

                {/* Parcelas Atrasadas */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Parcelas Atrasadas
                    </h2>
                    {atrasados?.length > 0 ? (
                        <div className="space-y-3">
                            {atrasados.slice(0, 5).map((parcela: any) => (
                                <div key={parcela.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{parcela.contrato?.cliente?.nome}</p>
                                        <p className="text-sm text-gray-500">{parcela.contrato?.nomeProjeto}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-red-600">{formatCurrency(Number(parcela.valorPrevisto))}</p>
                                        <p className="text-sm text-red-500">{parcela.diasAtraso} dias de atraso</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">Nenhuma parcela atrasada 🎉</p>
                    )}
                </div>
            </div>

            {/* Gráfico Mensal */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Receitas por Mês
                </h2>
                {graficoData?.length > 0 ? (
                    <div className="flex items-end gap-2 h-48">
                        {graficoData.map((item: any, index: number) => (
                            <div key={index} className="flex-1 flex flex-col items-center">
                                <div
                                    className="w-full bg-blue-500 rounded-t"
                                    style={{
                                        height: `${Math.max(10, (item.pago / Math.max(...graficoData.map((d: any) => d.previsto || 1))) * 100)}%`,
                                    }}
                                />
                                <p className="text-xs text-gray-500 mt-2">{MONTHS[item.mes - 1]?.slice(0, 3)}</p>
                                <p className="text-xs font-medium">{formatCurrency(item.pago)}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">Sem dados para exibir</p>
                )}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/clientes/novo" className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center">
                    + Novo Cliente
                </Link>
                <Link href="/contratos/novo" className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center">
                    + Novo Contrato
                </Link>
                <Link href="/agenda-financeira" className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-center">
                    Ver Agenda Financeira
                </Link>
            </div>
        </div>
    );
}
