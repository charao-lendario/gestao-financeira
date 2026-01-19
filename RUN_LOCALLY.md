# 🏃 Execute Localmente - 3 Comandos

Apenas 3 passos para rodar a aplicação localmente!

---

## ⚡ Opção 1: Automático (Recomendado)

### Passo 1: Rodar Setup

```bash
cd ~/Documents/gestao-financeira

chmod +x setup.sh
./setup.sh
```

O script vai:
- ✅ Verificar Node.js e npm
- ✅ Verificar PostgreSQL/Docker
- ✅ Criar arquivos .env
- ✅ Instalar dependências
- ✅ Configurar banco de dados
- ✅ Rodar migrations

**Tempo estimado: 2-3 minutos**

### Passo 2: Terminal 1 - Backend

```bash
npm run dev --workspace=@gestao-financeira/api
```

Você deve ver:
```
✓ Database connected
✓ Cron jobs started
✓ API running on http://localhost:3001
```

### Passo 3: Terminal 2 - Frontend

```bash
npm run dev --workspace=@gestao-financeira/web
```

Você deve ver:
```
▲ Next.js 14.0.4
- Local: http://localhost:3000
```

### Passo 4: Abrir Navegador

```
http://localhost:3000
```

---

## 📋 Opção 2: Manual (Passo a Passo)

Se o script automático não funcionar:

### 1. Instalar Deps
```bash
npm install
```

### 2. Criar .env
```bash
# Na raiz do projeto
cat > .env << EOF
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gestao_financeira"
NODE_ENV="development"
PORT=3001
JWT_SECRET="dev-secret-key"
JWT_EXPIRES_IN="7d"
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
EOF
```

### 3. Criar .env.local (frontend)
```bash
cat > apps/web/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
EOF
```

### 4. Verificar/Iniciar PostgreSQL

**Se tem Homebrew + PostgreSQL:**
```bash
brew services start postgresql@15
createdb gestao_financeira
```

**Se tem Docker:**
```bash
docker run -d --name gestao-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=gestao_financeira \
  -p 5432:5432 \
  postgres:15
```

### 5. Rodar Migrations
```bash
npm run prisma db push --workspace=@gestao-financeira/database
```

### 6. Rodar Backend (Terminal 1)
```bash
npm run dev --workspace=@gestao-financeira/api
```

### 7. Rodar Frontend (Terminal 2)
```bash
npm run dev --workspace=@gestao-financeira/web
```

---

## 🧪 Testar Aplicação

### Login
```
URL: http://localhost:3000
Email: demo@example.com
Senha: demo123
```

### Testar Features

- [ ] Dashboard - Ver cards e gráfico
- [ ] Criar Cliente - Adicionar novo cliente
- [ ] Criar Contrato - Fazer contrato parcelado
- [ ] Calendário - Ver parcelas por mês
- [ ] Marcar Pago - Clicar em parcela

### Testar API (Postman/Insomnia)

```
GET http://localhost:3001/api/v1/clientes
GET http://localhost:3001/api/v1/contratos
POST http://localhost:3001/health
```

---

## 🛑 Parar Tudo

```bash
# Terminal 1 e 2:
Ctrl + C

# Se usar Docker:
docker stop gestao-db
```

---

## 🐛 Se Algo Não Funcionar

### "Cannot connect to database"
```bash
# Verificar PostgreSQL
psql gestao_financeira

# Ou Docker
docker ps | grep gestao-db
```

### "Port 3000 already in use"
```bash
# Matar processo
lsof -ti:3000 | xargs kill -9

# Ou usar outra porta
npm run dev --workspace=@gestao-financeira/web -- -p 3001
```

### "Modules not found"
```bash
# Reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 URLs

| Aplicação | URL |
|-----------|-----|
| **Frontend** | http://localhost:3000 |
| **API** | http://localhost:3001/api/v1 |
| **Login** | http://localhost:3000/login |
| **Dashboard** | http://localhost:3000/dashboard |

---

## ✅ Checklist

- [ ] Node.js 18+ instalado
- [ ] npm funcionando
- [ ] PostgreSQL ou Docker instalado
- [ ] Repositório clonado
- [ ] `./setup.sh` executado com sucesso
- [ ] Backend rodando em terminal 1
- [ ] Frontend rodando em terminal 2
- [ ] Navegador abrindo http://localhost:3000
- [ ] Login funcionando
- [ ] Dashboard carregando

---

## 🎉 Sucesso!

Se chegou até aqui, sua aplicação está rodando localmente!

**Próximo passo**: Testar todas as funcionalidades e depois fazer deploy no Vercel.

---

**Tempo total: ~5 minutos**
