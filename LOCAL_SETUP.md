# 🏠 Setup Local Completo

Guia passo a passo para rodar a aplicação localmente.

---

## ✅ Pré-requisitos

- [ ] **Node.js 18+**: https://nodejs.org
- [ ] **npm** (vem com Node)
- [ ] **PostgreSQL 12+** OU **Docker**
- [ ] **Git** para clonar repositório

---

## 🗄️ Etapa 1: Setup Database

### Opção A: PostgreSQL Local (macOS com Homebrew)

```bash
# Instalar
brew install postgresql@15

# Iniciar
brew services start postgresql@15

# Verificar
psql --version
```

### Opção B: PostgreSQL com Docker (Recomendado)

```bash
# Instalar Docker: https://docker.com

# Rodar container
docker run -d \
  --name gestao-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=gestao_financeira \
  -p 5432:5432 \
  postgres:15

# Verificar se está rodando
docker ps | grep gestao-db
```

### Opção C: Database Online (Alternativa)

Se não quiser instalar localmente, use:
- **Vercel Postgres**: https://vercel.com/storage/postgres
- **Railway**: https://railway.app
- **PlanetScale**: https://planetscale.com

---

## 📝 Etapa 2: Clonar Repositório

```bash
cd ~/Documents

git clone https://github.com/charao-lendario/gestao-financeira.git

cd gestao-financeira
```

---

## 🔧 Etapa 3: Configurar Environment Variables

### 3.1 Backend (.env na raiz)

```bash
# Criar arquivo .env na raiz
cat > .env << EOF
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gestao_financeira"
NODE_ENV="development"
PORT=3001
JWT_SECRET="seu-secret-super-secreto-mudar-em-producao"
JWT_EXPIRES_IN="7d"
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
EOF
```

### 3.2 Frontend (.env.local em apps/web)

```bash
# Criar arquivo .env.local
cat > apps/web/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
EOF
```

---

## 📦 Etapa 4: Instalar Dependências

```bash
# Instalar todas as dependências do monorepo
npm install

# Isso vai instalar deps de:
# - apps/web
# - apps/api
# - packages/shared
# - packages/database
```

---

## 🗄️ Etapa 5: Setup Database

```bash
# Criar tabelas no PostgreSQL
npm run prisma db push --workspace=@gestao-financeira/database

# Você deve ver algo como:
# ✔ Your database is now in sync with your schema

# Verificar (opcional)
psql gestao_financeira -c "SELECT COUNT(*) FROM information_schema.tables;"
```

---

## 🚀 Etapa 6: Rodar Aplicação

### Terminal 1 - Backend API

```bash
npm run dev --workspace=@gestao-financeira/api

# Deve aparecer:
# ✓ Database connected
# ✓ Cron jobs started
# ✓ API running on http://localhost:3001
```

### Terminal 2 - Frontend

```bash
npm run dev --workspace=@gestao-financeira/web

# Deve aparecer:
# ▲ Next.js 14.0.4
# - Local: http://localhost:3000
```

---

## 🧪 Etapa 7: Testar Aplicação

### Abrir no Navegador

```
http://localhost:3000
```

### Login

```
Email: demo@example.com
Senha: demo123
```

### Testar Funcionalidades

- ✅ Dashboard - Ver cards e gráfico
- ✅ Clientes - Criar cliente novo
- ✅ Contratos - Criar contrato com 3 parcelas
- ✅ Calendario - Ver parcelas por mês
- ✅ Marcar Pago - Clicar em parcela e marcar como paga

---

## 🧪 Testar API com Postman/Insomnia

### Criar Cliente

```
POST http://localhost:3001/api/v1/clientes
Content-Type: application/json

{
  "nome": "Teste Client",
  "documento": "12345678000195",
  "email": "teste@example.com",
  "telefone": "(11) 99999-9999",
  "cidade": "São Paulo",
  "uf": "SP"
}
```

### Listar Clientes

```
GET http://localhost:3001/api/v1/clientes
```

### Criar Contrato

```
POST http://localhost:3001/api/v1/contratos
Content-Type: application/json

{
  "clienteId": "ID_DO_CLIENTE",
  "nomeProjeto": "Projeto Teste",
  "dataContrato": "2026-01-19",
  "valorTotal": 30000,
  "formaPagamento": "PARCELADO",
  "qtdParcelas": 3,
  "diaVencimento": 15,
  "dataInicioCobranca": "2026-01-19"
}
```

---

## 🛑 Parar Aplicação

```bash
# Ctrl + C em ambos os terminais

# Se estiver usando Docker:
docker stop gestao-db
```

---

## 🆘 Troubleshooting

### Erro: "Cannot connect to database"

**Solução**:
```bash
# Verificar se PostgreSQL está rodando
brew services list | grep postgres

# Se não estiver:
brew services start postgresql@15

# Ou se usar Docker:
docker ps | grep gestao-db
docker start gestao-db
```

### Erro: "Port 3000 already in use"

**Solução**:
```bash
# Mudar porta (em Terminal 2)
npm run dev --workspace=@gestao-financeira/web -- -p 3001

# Ou matar processo:
lsof -ti:3000 | xargs kill -9
```

### Erro: "modules not found"

**Solução**:
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro ao rodar Prisma

**Solução**:
```bash
# Gerar Prisma Client
npm run prisma generate --workspace=@gestao-financeira/database

# Depois rodar migrations
npm run prisma db push --workspace=@gestao-financeira/database
```

---

## 📊 URLs Locais

| Aplicação | URL | Descrição |
|-----------|-----|-----------|
| Frontend | http://localhost:3000 | Interface da app |
| Backend API | http://localhost:3001/api/v1 | API REST |
| Prisma Studio | http://localhost:5555 | Visualizar DB |
| Login | http://localhost:3000/login | Página de login |
| Dashboard | http://localhost:3000/dashboard | Dashboard principal |

---

## 🔍 Verificar Saúde da Aplicação

```bash
# API Health Check
curl http://localhost:3001/health

# Deve retornar:
# {"status":"ok"}
```

---

## 📱 Testar em Mobile

```bash
# Pegar seu IP local
ipconfig getifaddr en0

# Acessar no celular (mesmo WiFi):
http://YOUR_IP:3000
```

---

## 🐛 Debugging

### Ver logs do API

```bash
# Terminal rodando API mostra logs em tempo real
# Procure por:
# [CRON] Running overdue parcelas status update
# ✓ Database connected
```

### Ver logs do Frontend

```bash
# Abrir DevTools no navegador
# F12 → Console
# Procure por erros vermelhos
```

### Usar Prisma Studio (Visualizar DB)

```bash
npm run prisma studio --workspace=@gestao-financeira/database

# Abre em: http://localhost:5555
```

---

## ✨ Pronto!

Sua aplicação está rodando localmente! 🎉

Pode testar todas as funcionalidades:
- Dashboard
- CRUD de Clientes
- CRUD de Contratos
- Calendário Financeiro
- Marcar como pago

---

## 📝 Próximos Passos

1. **Explorar funcionalidades** da aplicação
2. **Testar criar dados** (clientes, contratos)
3. **Verificar se backend e frontend se comunicam bem**
4. **Se tudo OK** → Partir para Deploy no Vercel

---

## 💾 Dados de Teste

Depois que estiver rodando, crie alguns dados:

### Cliente Teste
- Nome: Acme Corp
- Documento: 12.345.678/0001-95 (CNPJ)
- Email: contato@acme.com
- Telefone: (11) 9999-9999

### Contrato Teste
- Cliente: Acme Corp
- Projeto: Projeto Website
- Valor: R$ 30.000,00
- Forma: Parcelado 3x
- Dia Vencimento: 15

---

**Divirta-se testando! 🚀**
