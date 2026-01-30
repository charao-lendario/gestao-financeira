'use client';

import { useState, useMemo } from 'react';
import { useClientes, useParcelas, useEmpresas } from '@/hooks';
import { formatCurrency, formatDate } from '@gestao-financeira/shared/utils';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const STATUS_OPTIONS = [
    { value: '', label: 'Todos os status' },
    { value: 'PREVISTO', label: 'Previsto' },
    { value: 'PAGO', label: 'Pago' },
    { value: 'ATRASADO', label: 'Atrasado' },
    { value: 'CANCELADO', label: 'Cancelado' },
];

const FORMA_PAGAMENTO_OPTIONS = [
    { value: '', label: 'Todas as formas' },
    { value: 'A_VISTA', label: 'À Vista' },
    { value: 'PARCELADO', label: 'Parcelado' },
    { value: 'MENSALIDADE', label: 'Mensalidade' },
];

export default function RelatoriosPage() {
    const currentYear = new Date().getFullYear();

    // Filtros
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [selectedCliente, setSelectedCliente] = useState<string>('');
    const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [selectedFormaPagamento, setSelectedFormaPagamento] = useState<string>('');
    const [dataInicio, setDataInicio] = useState<string>('');
    const [dataFim, setDataFim] = useState<string>('');
    const [valorMinimo, setValorMinimo] = useState<string>('');
    const [valorMaximo, setValorMaximo] = useState<string>('');
    const [ordenarPor, setOrdenarPor] = useState<string>('dataVencimento');
    const [ordemAsc, setOrdemAsc] = useState(true);

    const { data: clientesData } = useClientes(1, '');
    const { data: parcelasData } = useParcelas(1);
    const { data: empresasData } = useEmpresas();

    const parcelas = parcelasData?.data || [];
    const clientes = clientesData?.data || [];
    const empresas = empresasData?.data || [];

    // Filtrar parcelas
    const filteredParcelas = useMemo(() => {
        let result = [...parcelas];

        // Filtro por ano/mês
        if (!dataInicio && !dataFim) {
            result = result.filter((parcela: any) => {
                const dataVencimento = new Date(parcela.dataVencimento);
                const matchesYear = dataVencimento.getFullYear() === selectedYear;
                const matchesMonth = selectedMonth === null || dataVencimento.getMonth() === selectedMonth;
                return matchesYear && matchesMonth;
            });
        }

        // Filtro por período customizado
        if (dataInicio) {
            result = result.filter((p: any) => new Date(p.dataVencimento) >= new Date(dataInicio));
        }
        if (dataFim) {
            result = result.filter((p: any) => new Date(p.dataVencimento) <= new Date(dataFim));
        }

        // Filtro por cliente
        if (selectedCliente) {
            result = result.filter((p: any) => p.contrato?.clienteId === selectedCliente);
        }

        // Filtro por Empresa (Rateio)
        if (selectedEmpresa) {
            result = result.filter((p: any) => {
                const rateio = p.contrato?.rateio || [];
                // Se não tem rateio, assume empresa padrão (ou mostra se for a padrão)
                // Mas por segurança, só mostra se tiver no rateio explícito
                return rateio.some((r: any) => r.empresaId === selectedEmpresa);
            }).map((p: any) => {
                // Ajustar valores baseado na porcentagem
                const rateio = p.contrato?.rateio?.find((r: any) => r.empresaId === selectedEmpresa);
                if (rateio) {
                    const percent = Number(rateio.percentual) / 100;
                    return {
                        ...p,
                        valorPrevisto: Number(p.valorPrevisto) * percent,
                        valorPago: p.valorPago ? Number(p.valorPago) * percent : p.valorPago,
                        isRateio: true, // Marker to indicate split view
                        percentual: rateio.percentual
                    };
                }
                return p;
            });
        }

        // Filtro por status
        if (selectedStatus) {
            result = result.filter((p: any) => p.status === selectedStatus);
        }

        // Filtro por forma de pagamento
        if (selectedFormaPagamento) {
            result = result.filter((p: any) => p.contrato?.formaPagamento === selectedFormaPagamento);
        }

        // Filtro por valor
        if (valorMinimo) {
            result = result.filter((p: any) => Number(p.valorPrevisto) >= Number(valorMinimo));
        }
        if (valorMaximo) {
            result = result.filter((p: any) => Number(p.valorPrevisto) <= Number(valorMaximo));
        }

        // Ordenação
        result.sort((a: any, b: any) => {
            let valueA, valueB;

            switch (ordenarPor) {
                case 'dataVencimento':
                    valueA = new Date(a.dataVencimento).getTime();
                    valueB = new Date(b.dataVencimento).getTime();
                    break;
                case 'valorPrevisto':
                    valueA = Number(a.valorPrevisto);
                    valueB = Number(b.valorPrevisto);
                    break;
                case 'cliente':
                    valueA = a.contrato?.cliente?.nome || '';
                    valueB = b.contrato?.cliente?.nome || '';
                    break;
                case 'status':
                    valueA = a.status;
                    valueB = b.status;
                    break;
                default:
                    valueA = new Date(a.dataVencimento).getTime();
                    valueB = new Date(b.dataVencimento).getTime();
            }

            if (ordemAsc) {
                return valueA > valueB ? 1 : -1;
            } else {
                return valueA < valueB ? 1 : -1;
            }
        });

        return result;
    }, [parcelas, selectedYear, selectedMonth, selectedCliente, selectedEmpresa, selectedStatus, selectedFormaPagamento, dataInicio, dataFim, valorMinimo, valorMaximo, ordenarPor, ordemAsc]);

    // Calcular totais
    const totalPrevisto = filteredParcelas.reduce((acc: number, p: any) => acc + Number(p.valorPrevisto), 0);
    const totalPago = filteredParcelas.filter((p: any) => p.status === 'PAGO').reduce((acc: number, p: any) => acc + Number(p.valorPago || p.valorPrevisto), 0);
    const totalEmAberto = filteredParcelas.filter((p: any) => p.status === 'PREVISTO').reduce((acc: number, p: any) => acc + Number(p.valorPrevisto), 0);
    const totalAtrasado = filteredParcelas.filter((p: any) => p.status === 'ATRASADO').reduce((acc: number, p: any) => acc + Number(p.valorPrevisto), 0);

    // Agrupar por cliente
    const parcelasPorCliente = filteredParcelas.reduce((acc: any, parcela: any) => {
        const clienteNome = parcela.contrato?.cliente?.nome || 'Sem Cliente';
        if (!acc[clienteNome]) {
            acc[clienteNome] = { parcelas: [], total: 0, pago: 0 };
        }
        acc[clienteNome].parcelas.push(parcela);
        acc[clienteNome].total += Number(parcela.valorPrevisto);
        if (parcela.status === 'PAGO') {
            acc[clienteNome].pago += Number(parcela.valorPago || parcela.valorPrevisto);
        }
        return acc;
    }, {});

    // Exportar para Excel
    const exportToExcel = () => {
        const data = filteredParcelas.map((p: any) => ({
            'Cliente': p.contrato?.cliente?.nome || '-',
            'Projeto': p.contrato?.nomeProjeto || '-',
            'Competência': p.competencia || '-',
            'Parcela': p.numeroParcela || '-',
            'Vencimento': formatDate(p.dataVencimento),
            'Valor Previsto': Number(p.valorPrevisto).toFixed(2),
            'Valor Pago': p.valorPago ? Number(p.valorPago).toFixed(2) : '-',
            'Data Pagamento': p.dataPagamento ? formatDate(p.dataPagamento) : '-',
            'Status': p.status,
            'Forma Pagamento': p.contrato?.formaPagamento || '-',
        }));

        // Adicionar linha de totais
        data.push({
            'Cliente': 'TOTAIS',
            'Projeto': '',
            'Competência': '',
            'Parcela': '',
            'Vencimento': '',
            'Valor Previsto': totalPrevisto.toFixed(2),
            'Valor Pago': totalPago.toFixed(2),
            'Data Pagamento': '',
            'Status': '',
            'Forma Pagamento': '',
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');

        // Ajustar largura das colunas
        worksheet['!cols'] = [
            { wch: 25 }, // Cliente
            { wch: 20 }, // Projeto
            { wch: 12 }, // Competência
            { wch: 8 },  // Parcela
            { wch: 12 }, // Vencimento
            { wch: 15 }, // Valor Previsto
            { wch: 12 }, // Valor Pago
            { wch: 12 }, // Data Pagamento
            { wch: 10 }, // Status
            { wch: 15 }, // Forma Pagamento
        ];

        const fileName = `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    // Exportar para PDF
    const exportToPDF = () => {
        const doc = new jsPDF('landscape');

        // Título
        doc.setFontSize(18);
        doc.text('Relatório Financeiro', 14, 22);

        // Subtítulo com período
        doc.setFontSize(10);
        const periodo = selectedMonth !== null
            ? `${MONTHS[selectedMonth]} de ${selectedYear}`
            : `Ano ${selectedYear}`;
        doc.text(`Período: ${periodo}`, 14, 30);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 36);

        // Resumo
        doc.setFontSize(12);
        doc.text(`Total Previsto: ${formatCurrency(totalPrevisto)}`, 14, 46);
        doc.text(`Total Recebido: ${formatCurrency(totalPago)}`, 100, 46);
        doc.text(`Em Aberto: ${formatCurrency(totalEmAberto)}`, 180, 46);
        doc.text(`Atrasado: ${formatCurrency(totalAtrasado)}`, 250, 46);

        // Tabela
        const tableData = filteredParcelas.map((p: any) => [
            p.contrato?.cliente?.nome || '-',
            p.contrato?.nomeProjeto || '-',
            p.competencia || '-',
            formatDate(p.dataVencimento),
            formatCurrency(Number(p.valorPrevisto)),
            p.valorPago ? formatCurrency(Number(p.valorPago)) : '-',
            p.status,
        ]);

        autoTable(doc, {
            head: [['Cliente', 'Projeto', 'Competência', 'Vencimento', 'Previsto', 'Pago', 'Status']],
            body: tableData,
            startY: 52,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [59, 130, 246] },
        });

        const fileName = `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
    };

    // Limpar filtros
    const limparFiltros = () => {
        setSelectedYear(currentYear);
        setSelectedMonth(null);
        setSelectedCliente('');
        setSelectedEmpresa('');
        setSelectedStatus('');
        setSelectedFormaPagamento('');
        setDataInicio('');
        setDataFim('');
        setValorMinimo('');
        setValorMaximo('');
        setOrdenarPor('dataVencimento');
        setOrdemAsc(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
                <div className="flex gap-2">
                    <button
                        onClick={exportToExcel}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Excel
                    </button>
                    <button
                        onClick={exportToPDF}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        PDF
                    </button>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                    <button
                        onClick={limparFiltros}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        Limpar filtros
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Ano */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Ano</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                        >
                            {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    {/* Empresa (Nova Funcionalidade) - Atualizado */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Empresa do Grupo</label>
                        <select
                            value={selectedEmpresa}
                            onChange={(e) => setSelectedEmpresa(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm bg-blue-50 border-blue-200"
                        >
                            <option value="">Todas as Empresas (Consolidado)</option>
                            {empresas.map((emp: any) => (
                                <option key={emp.id} value={emp.id}>{emp.nome}</option>
                            ))}
                        </select>
                    </div>

                    {/* Mês */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Mês</label>
                        <select
                            value={selectedMonth ?? ''}
                            onChange={(e) => setSelectedMonth(e.target.value === '' ? null : Number(e.target.value))}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                        >
                            <option value="">Todos os meses</option>
                            {MONTHS.map((month, index) => (
                                <option key={index} value={index}>{month}</option>
                            ))}
                        </select>
                    </div>

                    {/* Cliente */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Cliente</label>
                        <select
                            value={selectedCliente}
                            onChange={(e) => setSelectedCliente(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                        >
                            <option value="">Todos os clientes</option>
                            {clientes.map((cliente: any) => (
                                <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Status</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Forma de Pagamento */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Forma de Pagamento</label>
                        <select
                            value={selectedFormaPagamento}
                            onChange={(e) => setSelectedFormaPagamento(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                        >
                            {FORMA_PAGAMENTO_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Data Início */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Data Início</label>
                        <input
                            type="date"
                            value={dataInicio}
                            onChange={(e) => setDataInicio(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                    </div>

                    {/* Data Fim */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Data Fim</label>
                        <input
                            type="date"
                            value={dataFim}
                            onChange={(e) => setDataFim(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                    </div>

                    {/* Ordenar Por */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Ordenar por</label>
                        <div className="flex gap-2">
                            <select
                                value={ordenarPor}
                                onChange={(e) => setOrdenarPor(e.target.value)}
                                className="flex-1 px-3 py-2 border rounded-lg text-sm"
                            >
                                <option value="dataVencimento">Vencimento</option>
                                <option value="valorPrevisto">Valor</option>
                                <option value="cliente">Cliente</option>
                                <option value="status">Status</option>
                            </select>
                            <button
                                onClick={() => setOrdemAsc(!ordemAsc)}
                                className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
                                title={ordemAsc ? 'Crescente' : 'Decrescente'}
                            >
                                {ordemAsc ? '↑' : '↓'}
                            </button>
                        </div>
                    </div>

                    {/* Valor Mínimo */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Valor Mínimo (R$)</label>
                        <input
                            type="number"
                            value={valorMinimo}
                            onChange={(e) => setValorMinimo(e.target.value)}
                            placeholder="0,00"
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                    </div>

                    {/* Valor Máximo */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Valor Máximo (R$)</label>
                        <input
                            type="number"
                            value={valorMaximo}
                            onChange={(e) => setValorMaximo(e.target.value)}
                            placeholder="0,00"
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                    </div>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                    {filteredParcelas.length} resultado(s) encontrado(s)
                </div>
            </div>

            {/* Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium">Total Previsto</p>
                    <p className="text-xl font-bold text-blue-700">{formatCurrency(totalPrevisto)}</p>
                    <p className="text-xs text-blue-500 mt-1">{filteredParcelas.length} parcelas</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-xs text-green-600 font-medium">Total Recebido</p>
                    <p className="text-xl font-bold text-green-700">{formatCurrency(totalPago)}</p>
                    <p className="text-xs text-green-500 mt-1">{filteredParcelas.filter((p: any) => p.status === 'PAGO').length} parcelas pagas</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-xs text-yellow-600 font-medium">Em Aberto</p>
                    <p className="text-xl font-bold text-yellow-700">{formatCurrency(totalEmAberto)}</p>
                    <p className="text-xs text-yellow-500 mt-1">{filteredParcelas.filter((p: any) => p.status === 'PREVISTO').length} parcelas</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-xs text-red-600 font-medium">Atrasado</p>
                    <p className="text-xl font-bold text-red-700">{formatCurrency(totalAtrasado)}</p>
                    <p className="text-xs text-red-500 mt-1">{filteredParcelas.filter((p: any) => p.status === 'ATRASADO').length} parcelas</p>
                </div>
            </div>

            {/* Relatório por Cliente */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo por Cliente</h2>

                {Object.keys(parcelasPorCliente).length > 0 ? (
                    <div className="space-y-4">
                        {Object.entries(parcelasPorCliente)
                            .sort((a: any, b: any) => b[1].total - a[1].total)
                            .map(([clienteNome, data]: [string, any]) => (
                                <div key={clienteNome} className="border-b pb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-medium text-gray-900">{clienteNome}</h3>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">Total: {formatCurrency(data.total)}</p>
                                            <p className="text-sm text-green-600">Pago: {formatCurrency(data.pago)}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 text-sm text-gray-500">
                                        <span>{data.parcelas.length} parcela(s)</span>
                                        <span>•</span>
                                        <span>{((data.pago / data.total) * 100).toFixed(0)}% recebido</span>
                                    </div>
                                    {/* Barra de progresso */}
                                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 rounded-full"
                                            style={{ width: `${(data.pago / data.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">Nenhum dado encontrado para os filtros selecionados</p>
                )}
            </div>

            {/* Lista de Parcelas */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Parcelas do Período</h2>

                {filteredParcelas.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projeto</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Competência</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Previsto</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pago</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredParcelas.slice(0, 100).map((parcela: any) => (
                                    <tr key={parcela.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {parcela.contrato?.cliente?.nome || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {parcela.contrato?.nomeProjeto || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {parcela.competencia || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {formatDate(parcela.dataVencimento)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                            {formatCurrency(Number(parcela.valorPrevisto))}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                            {parcela.valorPago ? formatCurrency(Number(parcela.valorPago)) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${parcela.status === 'PAGO' ? 'bg-green-100 text-green-800' :
                                                parcela.status === 'ATRASADO' ? 'bg-red-100 text-red-800' :
                                                    parcela.status === 'CANCELADO' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {parcela.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-100">
                                <tr>
                                    <td colSpan={4} className="px-4 py-3 text-sm font-semibold text-gray-900">
                                        TOTAL ({filteredParcelas.length} parcelas)
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                                        {formatCurrency(totalPrevisto)}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-green-600 text-right">
                                        {formatCurrency(totalPago)}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                        {filteredParcelas.length > 100 && (
                            <p className="text-sm text-gray-500 text-center mt-4">
                                Mostrando 100 de {filteredParcelas.length} resultados. Exporte para ver todos.
                            </p>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">Nenhuma parcela encontrada</p>
                )}
            </div>
        </div>
    );
}
