# 🎨 Frontend Development Guide

Complete guide for implementing the React/Next.js frontend for the Financial Management system.

---

## 📋 Setup Prerequisites

### 1. Install Shadcn/UI Components

Run in `apps/web/`:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add calendar
```

### 2. Create API Client

`apps/web/src/lib/api-client.ts`:
```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### 3. Create React Query Hooks

`apps/web/src/hooks/use-clientes.ts`:
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Cliente, CreateClienteInput } from '@gestao-financeira/shared';

export const useClientes = (page = 1, search?: string) => {
  return useQuery({
    queryKey: ['clientes', page, search],
    queryFn: async () => {
      const { data } = await apiClient.get('/clientes', {
        params: { page, search, pageSize: 10 },
      });
      return data.data;
    },
  });
};

export const useClienteById = (id: string) => {
  return useQuery({
    queryKey: ['cliente', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/clientes/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateCliente = () => {
  return useMutation({
    mutationFn: async (input: CreateClienteInput) => {
      const { data } = await apiClient.post('/clientes', input);
      return data.data;
    },
  });
};
```

### 4. Create Layout

`apps/web/src/app/(dashboard)/layout.tsx`:
```typescript
import { PropsWithChildren } from 'react';
import Navbar from '@/components/navbar';
import Sidebar from '@/components/sidebar';

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
```

---

## 🎯 Component Implementation Order

### Phase 1: Core Components (2-3 hours)

#### 1.1 Navbar
`apps/web/src/components/navbar.tsx` - Top navigation with user menu

#### 1.2 Sidebar
`apps/web/src/components/sidebar.tsx` - Navigation menu with links

#### 1.3 Common Layouts
- `components/layouts/page-header.tsx` - Page title with actions
- `components/layouts/content-container.tsx` - Centered content wrapper

---

### Phase 2: Clientes (1-2 hours)

#### 2.1 ClientesList
Location: `apps/web/src/app/(dashboard)/clientes/page.tsx`

Features:
- DataTable with columns: ID, Name, Document, Email, Actions
- Pagination
- Search bar
- New Client button
- Delete action with confirmation
- Link to edit

#### 2.2 ClienteForm
Location: `apps/web/src/components/forms/cliente-form.tsx`

Fields:
- Nome (required)
- Documento (CPF/CNPJ with validation)
- Email (optional, with validation)
- Telefone (optional)
- Contato Nome (optional)
- Cidade (optional)
- UF (optional, 2 chars)
- Responsável Interno (optional)

Submit on: create and edit modes

#### 2.3 ClientesCreate
Location: `apps/web/src/app/(dashboard)/clientes/novo/page.tsx`

Simple page with ClienteForm

#### 2.4 ClientesEdit
Location: `apps/web/src/app/(dashboard)/clientes/[id]/editar/page.tsx`

Load and pre-populate ClienteForm

---

### Phase 3: Dashboard (1-2 hours)

Location: `apps/web/src/app/(dashboard)/page.tsx`

Components:
- **SummaryCards**: 4 cards showing (Previsto, Pago, Em Aberto, Atrasado)
- **MonthlySummaryChart**: Line/Bar chart from `/dashboard/grafico-mensal`
- **ProximasVencimentos**: Table of due in next 7 days
- **Atrasados**: Alert list of overdue with total

```typescript
// Example SummaryCard
<Card>
  <CardHeader>
    <CardTitle>Em Aberto</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold">
      {formatCurrency(resumo.emAberto)}
    </div>
    <p className="text-sm text-muted-foreground mt-2">
      {proximasVencimentos.length} vencendo
    </p>
  </CardContent>
</Card>
```

---

### Phase 4: Contratos (2-3 hours)

#### 4.1 ContratosList
Location: `apps/web/src/app/(dashboard)/contratos/page.tsx`

Features:
- DataTable: ID, Project Name, Client, Value, Payment Method, Status
- Filters by status
- New Contract button
- Edit/Delete/View actions

#### 4.2 ContratoForm
Location: `apps/web/src/components/forms/contrato-form.tsx`

Core Fields:
- Cliente (select dropdown)
- Nome Projeto (required)
- Data Contrato (date picker)
- Valor Total (currency)
- Forma Pagamento (select: A_VISTA, PARCELADO, MENSALIDADE)

Conditional Fields:
- If PARCELADO: Qtd Parcelas, Dia Vencimento
- If MENSALIDADE: Dia Vencimento, Data Fim (optional)

#### 4.3 ParcelasPreview
Location: `apps/web/src/components/parcelas-preview.tsx`

Shows table after form submission preview:
- Nº Parcela, Data Vencimento, Competência, Valor Previsto
- Updates live as user changes payment method

#### 4.4 ContratoCreate/Edit
Location: `apps/web/src/app/(dashboard)/contratos/novo/page.tsx`

---

### Phase 5: Calendar (2-3 hours)

Location: `apps/web/src/app/(dashboard)/agenda-financeira/page.tsx`

Components:
- **MonthSelector**: Previous/Next month navigation
- **CalendarioFinanceiro**: Grid calendar showing:
  - Each day with grouped parcelas
  - Color coding (Verde=Pago, Amarelo=Previsto, Vermelho=Atrasado)
  - Click to expand and mark paid

```typescript
// Example: Calendar cell
<div className="border p-2 min-h-24 cursor-pointer hover:bg-gray-50">
  <div className="font-bold mb-1">{day}</div>
  {parcelas.map((p) => (
    <div
      key={p.id}
      className={`text-xs p-1 rounded mb-1 cursor-pointer ${
        p.status === 'PAGO'
          ? 'bg-green-100 text-green-800'
          : p.status === 'ATRASADO'
          ? 'bg-red-100 text-red-800'
          : 'bg-yellow-100 text-yellow-800'
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelectParcela(p);
      }}
    >
      {p.contrato.cliente.nome} - {formatCurrency(p.valorPrevisto)}
    </div>
  ))}
</div>
```

---

### Phase 6: Authentication (1 hour)

#### 6.1 Login Page
Location: `apps/web/src/app/(auth)/login/page.tsx`

Simple form with email/password (can be mock for MVP)

#### 6.2 Protected Routes
Location: `apps/web/src/middleware.ts`

Check for token, redirect to login if missing

---

## 🎨 Styling Patterns

### Button Usage
```tsx
<Button>Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>
<Button size="sm">Small</Button>
```

### Form Usage with React Hook Form
```tsx
const form = useForm<ClienteInput>({
  resolver: zodResolver(updateClienteSchema),
  defaultValues: cliente,
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="nome"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nome</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

### Cards
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>{content}</CardContent>
</Card>
```

---

## 🔗 React Query Setup

Add to root layout:
```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { PropsWithChildren } from 'react';

const queryClient = new QueryClient();

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster position="top-right" />
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

---

## 📊 Chart Implementation

Using Recharts:
```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export function MonthlySummaryChart({ data }) {
  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="mes" />
      <YAxis />
      <Tooltip formatter={(value) => formatCurrency(value)} />
      <Legend />
      <Line type="monotone" dataKey="previsto" stroke="#8884d8" />
      <Line type="monotone" dataKey="pago" stroke="#82ca9d" />
    </LineChart>
  );
}
```

---

## 📱 Responsive Design

Use Tailwind breakpoints:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Cards */}
</div>
```

---

## ⚠️ Error Handling

```tsx
import { toast } from 'sonner';

const mutation = useMutation({
  mutationFn: async (data) => {
    // call api
  },
  onError: (error: any) => {
    toast.error(error.response?.data?.error || 'Erro ao salvar');
  },
  onSuccess: () => {
    toast.success('Salvo com sucesso!');
    queryClient.invalidateQueries({ queryKey: ['items'] });
  },
});
```

---

## 🔄 Loading States

```tsx
import { Loader2 } from 'lucide-react';

{isPending && (
  <div className="flex justify-center items-center">
    <Loader2 className="mr-2 animate-spin" />
    Carregando...
  </div>
)}
```

---

## 🧪 Testing Checklist

- [ ] Create client, view in list
- [ ] Update client details
- [ ] Create contract à vista → 1 parcela
- [ ] Create contract parcelado 3x → 3 parcelas
- [ ] Create contract mensalidade → 12 parcelas
- [ ] Mark installment as paid
- [ ] View dashboard with data
- [ ] Check calendar view
- [ ] Test filters and search
- [ ] Verify responsiveness (mobile, tablet, desktop)

---

## 🚀 Performance Tips

1. Use React Query caching
2. Implement pagination (10 items per page default)
3. Lazy load components with `dynamic()`
4. Memoize expensive components
5. Use suspense for async operations

---

## 📚 Useful Resources

- [Shadcn/UI Documentation](https://ui.shadcn.com/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/)
- [date-fns pt-BR](https://date-fns.org/docs/Locale)

---

## 🎯 Next Steps After Frontend

1. Add JWT authentication
2. Deploy to Vercel
3. Add email notifications
4. Implement installment receipts upload
5. Add audit logs
6. Create admin panel for user management
