# 🚀 Guia de Deploy - Vercel

Instruções completas para fazer o deploy da aplicação no Vercel.

---

## ⚙️ Etapa 1: Preparar o Database

### Opção A: Vercel Postgres (Recomendado - mais fácil)

1. Vá para [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clique em **Storage** → **Create Database** → **Postgres**
3. Selecione a região (ex: us-east-1)
4. Copie a `DATABASE_URL` (vamos usar em breve)

### Opção B: Heroku Postgres

1. Crie uma conta no [heroku.com](https://heroku.com)
2. Crie um novo app
3. Adicione um Postgres Add-on (Eco Dyno)
4. Copie a `DATABASE_URL`

### Opção C: Railway / PlanetScale

Mesmo processo: criar database, copiar connection string

---

## 🔧 Etapa 2: Deploy da API (Backend)

A API pode rodar em **Serverless Functions** do Vercel.

### 2.1 Criar um novo projeto Vercel para a API

```bash
# Login no Vercel CLI
npm install -g vercel
vercel login

# Deploy da API
cd apps/api
vercel
```

### 2.2 Configurar Environment Variables

No painel do Vercel:

1. Vá para Settings → Environment Variables
2. Adicione:
   ```
   DATABASE_URL=seu-database-url-aqui
   JWT_SECRET=seu-secret-aleatorio-aqui
   NODE_ENV=production
   ```

### 2.3 Build & Deploy

```bash
# Se não deployou automaticamente
vercel --prod
```

**Copie o URL da API** (será algo como `https://api-xxx.vercel.app`)

---

## 🎨 Etapa 3: Deploy do Frontend (Next.js)

### 3.1 Conectar repositório GitHub

1. Vá para [vercel.com/new](https://vercel.com/new)
2. Clique em **Import Git Repository**
3. Selecione seu repositório `gestao-financeira`
4. Clique **Import**

### 3.2 Configurar Build Settings

- **Framework Preset**: Next.js
- **Root Directory**: `apps/web`
- **Build Command**: `npm run build --workspace=@gestao-financeira/web`
- **Output Directory**: `.next`

### 3.3 Configurar Environment Variables

Adicione:

```
NEXT_PUBLIC_API_URL=https://api-xxx.vercel.app/api/v1
```

(Substitua `api-xxx.vercel.app` pela URL da sua API)

### 3.4 Deploy

Clique em **Deploy** e aguarde!

---

## ✅ Etapa 4: Testar Aplicação

1. Vá para a URL do frontend (será algo como `https://seu-app.vercel.app`)
2. Login com:
   - Email: `demo@example.com`
   - Senha: `demo123`
3. Teste as funcionalidades

---

## 🔗 Conectar API com Frontend

Se a API estiver rodando no Vercel, o frontend automaticamente vai conectar.

Se não conectar:

1. Frontend Settings → Environment Variables
2. Atualize `NEXT_PUBLIC_API_URL` para a URL correta da API
3. Redeploy o frontend

---

## 📊 Estrutura de Deploy

```
Seu Projeto GitHub (main branch)
    ↓
Vercel detecta mudanças
    ↓
Deploy automático
    ├─ Frontend (apps/web)
    └─ API (apps/api) [opcional - se usar Vercel Functions]
```

---

## 🚨 Troubleshooting

### "Cannot find module '@gestao-financeira/shared'"

**Solução**: Adicione no build command:
```
npm install && npm run build --workspaces
```

### API retorna 404

**Solução**: Verifique se a URL da API está correta em `NEXT_PUBLIC_API_URL`

### Database conexão recusada

**Solução**:
1. Verifique se `DATABASE_URL` está correto
2. Adicione seu IP do Vercel na whitelist do banco (se necessário)
3. Para Vercel Postgres: está automático

---

## 📱 Acessar depois de Deploy

- **Frontend**: `https://seu-app.vercel.app`
- **API**: `https://seu-api.vercel.app` (se deployada)
- **Credenciais**: demo@example.com / demo123

---

## 🔄 Deploy Contínuo (CI/CD)

Vercel automáticamente:

1. Detecta commits na branch `main`
2. Roda `npm run build`
3. Deploy automático em produção
4. Cria preview URLs para PRs

---

## 💡 Dicas Extras

### Monitorar Logs em Produção

```bash
vercel logs
```

### Redeployal Manual

```bash
vercel --prod
```

### Configurar Domain Custom

No painel Vercel → Settings → Domains

---

## 📞 Suporte

Se algo der errado:

1. Verifique os logs no painel Vercel
2. Confira todas as environment variables
3. Teste a API com Postman/Insomnia
4. Verifique DATABASE_URL com `psql` localmente

---

**Pronto! Sua aplicação está no ar! 🎉**
