'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateCliente, useUpdateCliente, useClienteById } from '@/hooks';
import { validateCPFOrCNPJ, formatCPFOrCNPJ } from '@gestao-financeira/shared/utils';
import { toast } from 'sonner';

interface ClienteFormProps {
  clienteId?: string;
}

export function ClienteForm({ clienteId }: ClienteFormProps) {
  const router = useRouter();
  const { data: cliente, isLoading: loadingCliente } = useClienteById(clienteId || '');
  const createMutation = useCreateCliente();
  const updateMutation = useUpdateCliente();

  const [formData, setFormData] = useState(
    cliente || {
      nome: '',
      documento: '',
      contatoNome: '',
      telefone: '',
      email: '',
      cidade: '',
      uf: '',
      responsavelInterno: '',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (!validateCPFOrCNPJ(formData.documento)) {
      toast.error('CPF/CNPJ inválido');
      return;
    }

    if (formData.email && !formData.email.includes('@')) {
      toast.error('Email inválido');
      return;
    }

    if (formData.uf && formData.uf.length !== 2) {
      toast.error('UF deve ter 2 caracteres');
      return;
    }

    const mutation = clienteId ? updateMutation : createMutation;

    mutation.mutate(
      clienteId
        ? { id: clienteId, data: formData }
        : formData,
      {
        onSuccess: () => {
          toast.success(
            clienteId
              ? 'Cliente atualizado com sucesso!'
              : 'Cliente criado com sucesso!'
          );
          router.push('/clientes');
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.error || 'Erro ao salvar cliente'
          );
        },
      }
    );
  };

  if (clienteId && loadingCliente) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome *
          </label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nome completo ou razão social"
          />
        </div>

        {/* Documento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CPF/CNPJ *
          </label>
          <input
            type="text"
            name="documento"
            value={formData.documento}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '');
              if (value.length > 14) value = value.slice(0, 14);
              setFormData((prev) => ({
                ...prev,
                documento: value,
              }));
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Apenas números"
          />
          {formData.documento && validateCPFOrCNPJ(formData.documento) && (
            <p className="text-xs text-green-600 mt-1">
              ✓ {formatCPFOrCNPJ(formData.documento)}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="exemplo@email.com"
          />
        </div>

        {/* Telefone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefone
          </label>
          <input
            type="tel"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="(11) 99999-9999"
          />
        </div>

        {/* Contato Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome do Contato
          </label>
          <input
            type="text"
            name="contatoNome"
            value={formData.contatoNome}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nome da pessoa de contato"
          />
        </div>

        {/* Cidade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cidade
          </label>
          <input
            type="text"
            name="cidade"
            value={formData.cidade}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Cidade"
          />
        </div>

        {/* UF */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            UF
          </label>
          <input
            type="text"
            name="uf"
            value={formData.uf}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                uf: e.target.value.toUpperCase().slice(0, 2),
              }));
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="SP"
            maxLength={2}
          />
        </div>

        {/* Responsável Interno */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Responsável Interno
          </label>
          <input
            type="text"
            name="responsavelInterno"
            value={formData.responsavelInterno}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nome do responsável"
          />
        </div>
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
          {clienteId ? 'Atualizar' : 'Criar'} Cliente
        </button>
      </div>
    </form>
  );
}
