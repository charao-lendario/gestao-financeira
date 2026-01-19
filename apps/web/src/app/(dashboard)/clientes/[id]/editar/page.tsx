import { ClienteForm } from '@/components/forms/cliente-form';

export default function EditarClientePage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Editar Cliente</h1>
        <p className="text-gray-600 mt-2">Atualize os dados do cliente</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <ClienteForm clienteId={params.id} />
      </div>
    </div>
  );
}
