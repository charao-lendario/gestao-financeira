import { ClienteForm } from '@/components/forms/cliente-form';

export default function NovoClientePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Novo Cliente</h1>
        <p className="text-gray-600 mt-2">Preencha os dados para criar um novo cliente</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <ClienteForm />
      </div>
    </div>
  );
}
