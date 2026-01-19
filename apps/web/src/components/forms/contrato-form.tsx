'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateContrato, useUpdateContrato, useContratoById, useClientes } from '@/hooks';
import { GeradorParcelasService } from '@gestao-financeira/shared/utils';
import { FormaPagamento, formatDate, formatCurrency } from '@gestao-financeira/shared/utils';
import { toast } from 'sonner';

interface ContratoFormProps {
  contratoId?: string;
}

export function ContratoForm({ contratoId }: ContratoFormProps) {
  const router = useRouter();
  const { data: contrato, isLoading: loadingContrato } = useContratoById(contratoId || '');
  const { data: clientesData } = useClientes(1, '');
  const createMutation = useCreateContrato();
  const updateMutation = useUpdateContrato();

  const [formData, setFormData] = useState(
    contrato || {
      clienteId: '',
      nomeProjeto: '',
      dataContrato: new Date().toISOString().split('T')[0],
      valorTotal: 0,
      formaPagamento: 'A_VISTA',
      qtdParcelas: 1,
      diaVencimento: 15,
      dataInicioCobranca: new Date().toISOString().split('T')[0],
      dataFimCobranca: '',
      observacoes: '',
    }
  );

  // Gerar preview de parcelas
  const parcelasPreview = useMemo(() => {
    if (!formData.valorTotal || formData.valorTotal <= 0) return [];

    try {
      const parcelas = GeradorParcelasService.gerarParcelas(
        'PREVIEW',
        formData.formaPagamento as FormaPagamento,
        Number(formData.valorTotal),
        formData.qtdParcelas,
        formData.diaVencimento,
        formData.dataInicioCobranca ? new Date(formData.dataInicioCobranca) : undefined,
        formData.dataFimCobranca ? new Date(formData.dataFimCobranca) : undefined
      );
      return parcelas;
    } catch (error) {
      return [];
    }
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'valorTotal' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.clienteId) {
      toast.error('Cliente é obrigatório');
      return;
    }

    if (!formData.nomeProjeto.trim()) {
      toast.error('Nome do projeto é obrigatório');
      return;
    }

    if (!formData.valorTotal || formData.valorTotal <= 0) {
      toast.error('Valor total deve ser maior que 0');
      return;
    }

    if (formData.formaPagamento === 'PARCELADO' && (!formData.qtdParcelas || formData.qtdParcelas < 1)) {
      toast.error('Quantidade de parcelas é obrigatória');
      return;
    }

    if (formData.formaPagamento !== 'A_VISTA' && (!formData.diaVencimento || formData.diaVencimento < 1 || formData.diaVencimento > 31)) {
      toast.error('Dia de vencimento deve estar entre 1 e 31');
      return;
    }

    const mutation = contratoId ? updateMutation : createMutation;

    mutation.mutate(
      contratoId
        ? { id: contratoId, data: formData }
        : formData,
      {
        onSuccess: () => {
          toast.success(
            contratoId
              ? 'Contrato atualizado com sucesso!'
              : 'Contrato criado com sucesso!'
          );
          router.push('/contratos');
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.error || 'Erro ao salvar contrato'
          );
        },
      }
    );
  };

  if (contratoId && loadingContrato) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente *
            </label>
            <select
              name="clienteId"
              value={formData.clienteId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione um cliente</option>
              {clientesData?.data?.map((cliente: any) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome} ({cliente.clienteId})
                </option>
              ))}
            </select>
          </div>

          {/* Nome Projeto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Projeto *
            </label>
            <input
              type="text"
              name="nomeProjeto"
              value={formData.nomeProjeto}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descrição do projeto"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Data Contrato */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data do Contrato *
              </label>
              <input
                type="date"
                name="dataContrato"
                value={formData.dataContrato}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Valor Total */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Total *
              </label>
              <input
                type="number"
                name="valorTotal"
                value={formData.valorTotal}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Forma Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forma de Pagamento *
            </label>
            <select
              name="formaPagamento"
              value={formData.formaPagamento}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="A_VISTA">À Vista</option>
              <option value="PARCELADO">Parcelado</option>
              <option value="MENSALIDADE">Mensalidade</option>
            </select>
          </div>

          {/* Conditional Fields */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            {formData.formaPagamento === 'PARCELADO' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade de Parcelas *
                </label>
                <input
                  type="number"
                  name="qtdParcelas"
                  value={formData.qtdParcelas}
                  onChange={handleChange}
                  min="1"
                  max="360"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {(formData.formaPagamento === 'PARCELADO' || formData.formaPagamento === 'MENSALIDADE') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dia de Vencimento *
                </label>
                <input
                  type="number"
                  name="diaVencimento"
                  value={formData.diaVencimento}
                  onChange={handleChange}
                  min="1"
                  max="31"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Início da Cobrança
              </label>
              <input
                type="date"
                name="dataInicioCobranca"
                value={formData.dataInicioCobranca}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {formData.formaPagamento === 'MENSALIDADE' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Fim da Cobrança (opcional)
                </label>
                <input
                  type="date"
                  name="dataFimCobranca"
                  value={formData.dataFimCobranca}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Observações adicionais"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {contratoId ? 'Atualizar' : 'Criar'} Contrato
            </button>
          </div>
        </form>
      </div>

      {/* Preview Parcelas */}
      <div className="lg:col-span-1">
        <div className="bg-gray-50 p-4 rounded-lg sticky top-4">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Preview das Parcelas</h3>

          {parcelasPreview.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {parcelasPreview.map((p: any, idx: number) => (
                <div key={idx} className="p-3 bg-white rounded border border-gray-200">
                  <p className="text-xs text-gray-600 font-medium">#{p.numeroParcela}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {formatCurrency(Number(p.valorPrevisto))}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(p.dataVencimento)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {p.competencia}
                  </p>
                </div>
              ))}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 font-medium mb-2">RESUMO</p>
                <p className="flex justify-between text-sm font-bold text-gray-900">
                  <span>Parcelas:</span>
                  <span>{parcelasPreview.length}</span>
                </p>
                <p className="flex justify-between text-sm text-gray-600">
                  <span>Total:</span>
                  <span>{formatCurrency(formData.valorTotal)}</span>
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">
              Preencha os campos para ver o preview das parcelas
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
