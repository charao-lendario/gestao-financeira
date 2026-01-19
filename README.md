# 💰 Gestão Financeira - Sistema de Gestão de Contratos e Recebimentos

Sistema MVP de gestão financeira focado em **recebimentos de contratos** com design clean e intuitivo.

**Stack**: Next.js 14 + Express.js + PostgreSQL + Prisma + Shadcn/UI

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL running
- npm or yarn

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your PostgreSQL connection string:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/gestao_financeira"
   ```

3. **Setup database**
   ```bash
   npm run prisma db push --workspace=@gestao-financeira/database
   ```

4. **Start development servers**

   Terminal 1 - Backend API:
   ```bash
   npm run dev --workspace=@gestao-financeira/api
   ```

   Terminal 2 - Frontend:
   ```bash
   npm run dev --workspace=@gestao-financeira/web
   ```

   - API: http://localhost:3001
   - Frontend: http://localhost:3000

---

## 📚 Project Structure

```
gestao-financeira/
├── apps/
│   ├── web/          # Next.js 14 frontend
│   └── api/          # Express.js backend
├── packages/
│   ├── shared/       # Shared types, utils, validators
│   └── database/     # Prisma schema & migrations
├── package.json      # Monorepo with npm workspaces
└── .env.example      # Environment variables template
```

---

## 🔌 API Documentation

### Base URL
```
http://localhost:3001/api/v1
```

### Clients (`/clientes`)
```
POST   /                  Create client
GET    /                  List clients (with pagination)
GET    /:id               Get client details
PUT    /:id               Update client
DELETE /:id               Delete client
GET    /:id/contratos     List client contracts
```

### Contracts (`/contratos`)
```
POST   /                  Create contract (auto-generates installments)
GET    /                  List contracts
GET    /:id               Get contract details
PUT    /:id               Update contract
DELETE /:id               Delete contract
POST   /:id/gerar-parcelas  Regenerate installments
```

### Installments (`/parcelas`)
```
GET    /                  List installments (with filters)
GET    /:id               Get installment details
PUT    /:id               Update installment
POST   /:id/pagar         Mark as paid
```

### Dashboard (`/dashboard`)
```
GET    /resumo-mensal?mes=01&ano=2026       Monthly summary
GET    /resumo-geral                        Overall summary
GET    /proximos-vencimentos?dias=7         Due in next 7 days
GET    /atrasados                           Overdue installments
GET    /grafico-mensal?ano=2026              Chart data for year
```

---

## 💡 Key Features Implemented

### ✅ Backend (Fully Functional)
- **Client Management**: CRUD with CPF/CNPJ validation
- **Contract Management**: Auto-generated IDs (CTR-YYYY-XXXX)
- **Payment Generation**: Automatic installment creation based on payment method:
  - À vista: 1 installment
  - Parcelado: N equal installments
  - Mensalidade: Recurring monthly
- **Installment Tracking**: Status management (PREVISTO, PAGO, ATRASADO)
- **Cron Jobs**: Daily automatic status update for overdue installments
- **Dashboard Endpoints**: Pre-aggregated data for charts and summaries

### 🚧 Frontend (To Be Implemented)
- Client list and forms
- Contract forms with installment preview
- Financial calendar view
- Dashboard with cards and charts
- Authentication

---

## 📊 Data Model

### Cliente
- ID (UUID)
- clienteId (CLT-XXXX)
- nome, documento (CPF/CNPJ)
- contato, telefone, email
- cidade, UF
- status (ATIVO/INATIVO)

### Contrato
- ID (UUID)
- contratoId (CTR-YYYY-XXXX)
- clienteId (FK)
- nomeProjeto
- dataContrato, valorTotal
- formaPagamento (A_VISTA, PARCELADO, MENSALIDADE)
- qtdParcelas, diaVencimento
- dataInicioCobranca, dataFimCobranca
- status (ATIVO, FINALIZADO, CANCELADO)

### Parcela
- ID (UUID)
- parcelaId
- contratoId (FK)
- competência (MM/YYYY)
- numeroParcela, dataVencimento
- valorPrevisto, dataPagamento, valorPago
- status (PREVISTO, PAGO, ATRASADO, CANCELADO)
- diasAtraso, formaRecebimento

---

## 🧪 Testing the API

### Example: Create a Client
```bash
curl -X POST http://localhost:3001/api/v1/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Acme Corp",
    "documento": "12345678000195",
    "email": "contato@acme.com",
    "telefone": "(11) 99999-9999"
  }'
```

### Example: Create a Contract (Parcelado - 3x)
```bash
curl -X POST http://localhost:3001/api/v1/contratos \
  -H "Content-Type: application/json" \
  -d '{
    "clienteId": "uuid-here",
    "nomeProjeto": "Projeto X",
    "dataContrato": "2026-01-19",
    "valorTotal": 30000,
    "formaPagamento": "PARCELADO",
    "qtdParcelas": 3,
    "diaVencimento": 15
  }'
```

Response includes automatically generated parcelas:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "contratoId": "CTR-2026-0001",
    "parcelas": [
      {
        "parcelaId": "CTR-2026-0001-001",
        "numeroParcela": 1,
        "dataVencimento": "2026-01-15",
        "valorPrevisto": 10000
      },
      {
        "parcelaId": "CTR-2026-0001-002",
        "numeroParcela": 2,
        "dataVencimento": "2026-02-15",
        "valorPrevisto": 10000
      },
      {
        "parcelaId": "CTR-2026-0001-003",
        "numeroParcela": 3,
        "dataVencimento": "2026-03-15",
        "valorPrevisto": 10000
      }
    ]
  }
}
```

---

## 🔄 Cron Jobs

**Daily Status Update** (00:00 every day)
- Automatically marks PREVISTO installments as ATRASADO if dataVencimento < today
- Updates diasAtraso field
- Also runs on server startup

---

## 📦 Shared Utilities

### Date Utilities (pt-BR)
```typescript
import { formatDate, formatCompetencia, daysUntilDue } from '@gestao-financeira/shared/utils';

formatDate(new Date()) // "19/01/2026"
formatCompetencia(new Date()) // "01/2026"
daysUntilDue(new Date()) // -5 (negative = overdue)
```

### Currency Utilities (BRL)
```typescript
import { formatCurrency, parseCurrency } from '@gestao-financeira/shared/utils';

formatCurrency(30000) // "R$ 30.000,00"
parseCurrency("R$ 30.000,00") // 30000
```

### Validators
```typescript
import { validateCPF, validateCNPJ, formatCPFOrCNPJ } from '@gestao-financeira/shared/utils';

validateCPF("123.456.789-10") // true/false
formatCPFOrCNPJ("12345678000195") // "12.345.678/0001-95"
```

---

## 🛠️ Available Scripts

```bash
# Development
npm run dev --workspaces

# Build
npm run build --workspaces

# Database
npm run prisma db push --workspace=@gestao-financeira/database
npm run prisma studio --workspace=@gestao-financeira/database  # Prisma Studio

# Shared package
npm run build --workspace=@gestao-financeira/shared
```

---

## 🔐 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/gestao_financeira

# Node
NODE_ENV=development
PORT=3001

# JWT (for future auth)
JWT_SECRET=seu-secret-aqui
JWT_EXPIRES_IN=7d

# Frontend API
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

---

## 📋 Implementation Checklist

- ✅ **Phase 1**: Monorepo, TypeScript, Prisma, Next.js, Express
- ✅ **Phase 2**: Client CRUD backend
- ✅ **Phase 3**: Contract & Installment CRUD + Gerador-Parcelas
- ✅ **Phase 4**: Dashboard endpoints
- ✅ **Phase 5**: Status updater cron job
- ⏳ **Phase 6**: Frontend components (in progress)
- ⏳ **Phase 7**: Authentication & Deployment

See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for detailed progress.

---

## 🐛 Troubleshooting

### Database connection failed
- Check if PostgreSQL is running
- Verify `DATABASE_URL` in `.env`
- Ensure database exists

### Port 3001 already in use
```bash
lsof -i :3001  # Find process
kill -9 <PID>  # Kill process
```

### Modules not resolving
```bash
npm install
npm run build --workspace=@gestao-financeira/shared
```

---

## 📖 Documentation

- **API Documentation**: See [API Endpoints](#-api-documentation) above
- **Implementation Status**: See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)
- **Product Requirements**: See [PRD.md](./PRD.md)

---

## 📝 License

MIT

---

## 🤝 Support

For issues or questions, check the implementation status document or the PRD for more context.
