import { ContratoForm } from '@/components/forms/contrato-form';

export default function EditarContratoPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Editar Contrato</h1>
        <p className="text-gray-600 mt-2">Atualize os dados do contrato</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <ContratoForm contratoId={params.id} />
      </div>
    </div>
  );
}
