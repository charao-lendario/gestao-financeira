# ⚡ Quick Deploy - 5 Minutos

Instruções rápidas para fazer deploy em ~5 minutos.

---

## 🚀 Opção 1: Deploy FULL-STACK no Vercel (Recomendado)

### 1️⃣ Preparar Database (2 min)

```bash
# Ir em https://vercel.com/dashboard
# Storage → Create Database → Postgres
# Copie a DATABASE_URL
```

### 2️⃣ Conectar GitHub ao Vercel (1 min)

```bash
# Ir em https://vercel.com/new
# Import Git Repository
# Selecione: charao-lendario/gestao-financeira
```

### 3️⃣ Configurar Build Settings (1 min)

- **Root Directory**: `apps/web`
- **Build Command**: `npm run build --workspace=@gestao-financeira/web`

### 4️⃣ Adicionar Environment Variables (30 sec)

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

(Depois você conecta uma API backend separadamente)

### 5️⃣ Deploy (1 min)

Clique em **Deploy** e aguarde!

---

## 🎯 Opção 2: Deploy só Frontend (Mais Rápido)

Se você quer rodar a API localmente:

1. **Deploy Frontend no Vercel** (como acima)
2. **Rodar API localmente**:

```bash
npm run dev --workspace=@gestao-financeira/api
```

3. **Mudar NEXT_PUBLIC_API_URL para**:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

---

## ✅ Pronto!

Sua aplicação estará online em:
```
https://seu-app.vercel.app
```

Com login:
- Email: `demo@example.com`
- Senha: `demo123`

---

## 🔌 Para Rodar API no Vercel depois

Quando quiser fazer deploy da API também:

1. Crie um novo projeto Vercel para a API
2. Set `DATABASE_URL` environment variable
3. Deploy com:
   ```bash
   cd apps/api
   vercel --prod
   ```
4. Update frontend com nova URL da API

---

**Fácil assim! 🎉**
