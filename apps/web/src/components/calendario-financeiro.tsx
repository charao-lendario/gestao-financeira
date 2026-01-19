'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@gestao-financeira/shared/utils';

interface Parcela {
  id: string;
  dataVencimento: string;
  valorPrevisto: number;
  status: string;
  contrato: {
    cliente: {
      nome: string;
    };
  };
}

interface CalendarioFinanceiroProps {
  parcelas: Parcela[];
  onSelectParcela?: (parcela: Parcela) => void;
}

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

export function CalendarioFinanceiro({ parcelas, onSelectParcela }: CalendarioFinanceiroProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const mesAtual = currentDate.getMonth();
  const anoAtual = currentDate.getFullYear();

  // Agrupar parcelas por dia
  const parcelasPorDia = useMemo(() => {
    const mapa: { [key: string]: Parcela[] } = {};

    parcelas.forEach((parcela) => {
      const data = new Date(parcela.dataVencimento);
      if (data.getMonth() === mesAtual && data.getFullYear() === anoAtual) {
        const dia = data.getDate();
        const key = dia.toString();
        if (!mapa[key]) mapa[key] = [];
        mapa[key].push(parcela);
      }
    });

    return mapa;
  }, [parcelas, mesAtual, anoAtual]);

  // Calcular dias do mês
  const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay();
  const ultimoDia = new Date(anoAtual, mesAtual + 1, 0).getDate();

  const diasDoMes = [];
  for (let i = 0; i < primeiroDia; i++) {
    diasDoMes.push(null);
  }
  for (let i = 1; i <= ultimoDia; i++) {
    diasDoMes.push(i);
  }

  const handleMesAnterior = () => {
    setCurrentDate(new Date(anoAtual, mesAtual - 1));
  };

  const handleProxMes = () => {
    setCurrentDate(new Date(anoAtual, mesAtual + 1));
  };

  const getCorStatus = (status: string) => {
    switch (status) {
      case 'PAGO':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'ATRASADO':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {meses[mesAtual]} {anoAtual}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleMesAnterior}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleProxMes}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {diasSemana.map((dia) => (
          <div
            key={dia}
            className="text-center font-semibold text-gray-600 text-sm py-2"
          >
            {dia}
          </div>
        ))}
      </div>

      {/* Dias do mês */}
      <div className="grid grid-cols-7 gap-1">
        {diasDoMes.map((dia, idx) => {
          const dia_parcelas = dia ? parcelasPorDia[dia.toString()] || [] : [];

          return (
            <div
              key={idx}
              className={`min-h-32 p-2 border border-gray-200 rounded-lg ${dia ? 'bg-white' : 'bg-gray-50'
                }`}
            >
              {dia && (
                <>
                  <div className="font-bold text-gray-900 mb-2">{dia}</div>
                  <div className="space-y-1">
                    {dia_parcelas.slice(0, 3).map((parcela) => (
                      <button
                        key={parcela.id}
                        onClick={() => onSelectParcela?.(parcela)}
                        className={`w-full text-left text-xs p-1.5 rounded border cursor-pointer hover:shadow-sm transition truncate ${getCorStatus(parcela.status)}`}
                        title={`${parcela.contrato.cliente.nome} - ${formatCurrency(parcela.valorPrevisto)}`}
                      >
                        <div className="font-semibold text-xs truncate">
                          {formatCurrency(parcela.valorPrevisto)}
                        </div>
                        <div className="text-xs truncate opacity-75">
                          {parcela.contrato.cliente.nome}
                        </div>
                      </button>
                    ))}
                    {dia_parcelas.length > 3 && (
                      <div className="text-xs text-gray-500 px-1">
                        +{dia_parcelas.length - 3} mais
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
          <span className="text-gray-600">Previsto</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span className="text-gray-600">Pago</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span className="text-gray-600">Atrasado</span>
        </div>
      </div>
    </div>
  );
}
