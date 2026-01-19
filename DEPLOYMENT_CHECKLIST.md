# ✅ Deployment Checklist

Use este checklist para fazer o deploy da sua aplicação.

---

## 📋 PRÉ-DEPLOY

- [ ] Código commitado e pushed para `main` branch
- [ ] Todas as features testadas localmente
- [ ] Environment variables (.env) não commitadas
- [ ] Credenciais de acesso seguras

---

## 🚀 DEPLOYMENT (5 MINUTOS)

### Passo 1: Criar Conta Vercel
- [ ] Ir para [vercel.com](https://vercel.com)
- [ ] Sign up com GitHub
- [ ] Conectar repositório

### Passo 2: Criar Database (Opcional mas Recomendado)
- [ ] Vercel Storage → PostgreSQL
- [ ] Copiar `DATABASE_URL`
- [ ] OU usar Heroku Postgres / Railway

### Passo 3: Deploy Frontend
- [ ] Vá para https://vercel.com/new
- [ ] Import `charao-lendario/gestao-financeira`
- [ ] Root Directory: `apps/web`
- [ ] Build Command: `npm run build --workspace=@gestao-financeira/web`
- [ ] Add Environment Variable:
  ```
  NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
  ```
- [ ] Click **Deploy**
- [ ] Aguarde ~2 min

### Passo 4: Deploy Backend (API)
Opção A: Vercel
- [ ] `cd apps/api`
- [ ] `vercel --prod`
- [ ] Add Environment Variable: `DATABASE_URL`

Opção B: Heroku / Railway / etc
- [ ] Deploy para seu provedor
- [ ] Set DATABASE_URL
- [ ] Copiar URL de deploy

### Passo 5: Conectar API com Frontend
- [ ] Frontend Settings → Environment Variables
- [ ] Update `NEXT_PUBLIC_API_URL` para URL da API
- [ ] Redeploy frontend

---

## ✨ PÓS-DEPLOY

- [ ] Acessar https://seu-app.vercel.app
- [ ] Login com `demo@example.com` / `demo123`
- [ ] Testar Dashboard
- [ ] Testar Criar Cliente
- [ ] Testar Criar Contrato
- [ ] Testar Calendário
- [ ] Checar que todas as features funcionam

---

## 🔐 PRODUÇÃO (Extras)

### Segurança
- [ ] Mudar credenciais de demo
- [ ] Implementar autenticação real (JWT com API)
- [ ] Adicionar HTTPS (automático no Vercel)
- [ ] Configurar CORS correto

### Performance
- [ ] Ativar CDN do Vercel (automático)
- [ ] Otimizar imagens
- [ ] Implementar cache

### Monitoramento
- [ ] Setup logs/monitoring no Vercel
- [ ] Setup alertas para erros
- [ ] Monitor database performance

---

## 📊 URLs Importantes

```
Frontend:  https://seu-app.vercel.app
API:       https://seu-api.vercel.app
Dashboard: https://seu-app.vercel.app/dashboard
GitHub:    https://github.com/charao-lendario/gestao-financeira
```

---

## 🆘 Troubleshooting

### Build falha com erro de módulos
```bash
Solution: Verificar se npm install --workspaces rodou
vercel logs  # Ver logs de erro
```

### Frontend não consegue conectar na API
```bash
Solution: Checar NEXT_PUBLIC_API_URL
Deve ser a URL completa: https://seu-api.vercel.app/api/v1
```

### Database connection error
```bash
Solution: Verificar DATABASE_URL
Testar localmente: psql $DATABASE_URL
```

### Deploy leva muito tempo
```bash
Solution: Normal na primeira vez (instala deps)
Próximos deploys são mais rápidos
```

---

## 📞 Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Settings**: https://github.com/settings
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

**Parabéns! 🎉 Sua aplicação está online!**
