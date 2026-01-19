import { ContratoForm } from '@/components/forms/contrato-form';

export default function NovoContratoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Novo Contrato</h1>
        <p className="text-gray-600 mt-2">Preencha os dados para criar um novo contrato. As parcelas serão geradas automaticamente.</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <ContratoForm />
      </div>
    </div>
  );
}
