# 🚀 Guia de Setup - FinanceHolding com Supabase

## ✅ Status da Integração
A aplicação foi completamente integrada com Supabase! Agora todos os dados são salvos em um banco de dados real PostgreSQL.

## 📋 Pré-requisitos
- Node.js instalado
- Conta no Supabase (gratuita)
- As credenciais já estão configuradas no `.env.local`

---

## 🗄️ Passo 1: Configurar o Banco de Dados

### 1.1 Acesse o Supabase SQL Editor
1. Vá para: https://supabase.com/dashboard
2. Entre no seu projeto
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**

### 1.2 Execute o Schema SQL
1. Abra o arquivo `supabase-schema.sql` na raiz do projeto
2. Copie **TODO** o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **RUN** ou pressione `Ctrl+Enter`

✅ **Sucesso!** Você verá a mensagem de sucesso e todas as tabelas serão criadas:
- `companies` (Empresas)
- `suppliers` (Fornecedores)
- `contracts` (Contratos)
- `installments` (Parcelas)
- `credit_cards` (Cartões de Crédito)
- `cash_flow_movements` (Fluxo de Caixa)

---

## 🔐 Passo 2: Configurar Autenticação no Supabase

### 2.1 Habilitar Email Authentication
1. No Supabase Dashboard, vá em **Authentication** → **Providers**
2. Certifique-se que **Email** está habilitado
3. (Opcional) Desabilite "Confirm email" se quiser testar sem confirmação de email

### 2.2 Configurar Email Settings (Opcional)
Para produção, configure um provedor de email (SendGrid, AWS SES, etc.) em:
**Authentication** → **Settings** → **Email Templates**

---

## 🏃 Passo 3: Rodar a Aplicação

### 3.1 Instalar Dependências (já feito)
```bash
npm install
```

### 3.2 Iniciar o Servidor
```bash
npm run dev
```

A aplicação estará rodando em: http://localhost:5173

---

## 👤 Passo 4: Primeiro Acesso

### 4.1 Criar sua Conta
1. Abra a aplicação no navegador
2. Clique em **"Criar conta"**
3. Preencha:
   - Nome completo
   - Email
   - Senha (mínimo 6 caracteres)
   - Confirmar senha
4. Clique em **"Criar Conta"**

### 4.2 Confirmar Email (se necessário)
- Se a confirmação de email estiver ativada, verifique sua caixa de entrada
- Clique no link de confirmação
- Volte para a aplicação e faça login

### 4.3 Fazer Login
1. Use seu email e senha cadastrados
2. Clique em **"Entrar"**

---

## 🏢 Passo 5: Cadastrar sua Primeira Empresa

Após fazer login, você será direcionado para cadastrar sua primeira empresa:

1. **Upload Logo** (opcional): Clique no quadrado para fazer upload
2. **Nome da Empresa**: Ex: "Grupo Focco"
3. **CNPJ**: Digite o CNPJ
4. **Saldo Inicial**: Valor inicial em conta (Ex: 50000)
5. **Cor de Identificação**: Escolha uma cor
6. Clique em **"Começar a Usar"**

---

## ✨ Funcionalidades Disponíveis

### 📊 Dashboard
- Visualize saldo atual da empresa
- Valores a pagar e pagos
- Gráficos e estatísticas

### 🏢 Gestão de Empresas
- Cadastrar múltiplas empresas/holdings
- Trocar entre empresas no menu lateral
- Visualizar informações detalhadas

### 📑 Contratos
- Cadastrar novos contratos
- Definir recorrência (único, parcelado, mensal)
- Vincular fornecedores

### 📅 Agenda de Parcelas
- Visualizar em lista ou calendário
- Filtrar por status (pendentes, atrasadas, pagas)
- Realizar baixa de pagamentos

### 💳 Métodos de Pagamento
- PIX
- Boleto
- Transferência
- Cartão de Crédito

### 💰 Fluxo de Caixa
- Movimentações automáticas ao pagar parcelas
- Atualização de saldo em tempo real
- Histórico completo

---

## 🔒 Segurança

### Row Level Security (RLS)
Todas as tabelas têm **RLS ativado**, garantindo que:
- Cada usuário só vê seus próprios dados
- Não é possível acessar dados de outros usuários
- Total isolamento entre contas

### Políticas de Segurança
As seguintes políticas foram configuradas:
- `SELECT`: Usuários só veem seus dados
- `INSERT`: Usuários só inserem em seus dados
- `UPDATE`: Usuários só atualizam seus dados
- `DELETE`: Usuários só deletam seus dados

---

## 🛠️ Estrutura do Projeto

```
gestaofinanceirafoco/
├── .env.local                    # Variáveis de ambiente
├── supabase-schema.sql           # Schema do banco de dados
├── lib/
│   └── supabase.ts              # Cliente Supabase + Types
├── contexts/
│   ├── AuthContext.tsx          # Context de autenticação
│   └── FinanceContext.tsx       # Context de dados financeiros
├── components/
│   └── LoginPage.tsx            # Página de login/registro
├── App.tsx                       # Aplicação principal
├── types.ts                      # Tipos TypeScript
└── constants.ts                  # Constantes (agora vazio)
```

---

## 🔧 Troubleshooting

### Erro: "Missing Supabase environment variables"
- Verifique se o arquivo `.env.local` existe
- Verifique se as variáveis estão corretas:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### Erro ao fazer login: "Invalid login credentials"
- Verifique se o email e senha estão corretos
- Se for novo usuário, crie uma conta primeiro

### Erro: "relation does not exist"
- Execute o SQL do arquivo `supabase-schema.sql` no Supabase
- Verifique se todas as tabelas foram criadas

### Tabelas vazias após criar empresa
- Verifique o console do navegador (F12) para erros
- Verifique se o RLS está configurado corretamente
- Confirme que você está logado (verifique auth.users)

---

## 📞 Próximos Passos

1. ✅ Execute o SQL no Supabase
2. ✅ Rode a aplicação com `npm run dev`
3. ✅ Crie sua conta
4. ✅ Cadastre sua primeira empresa
5. 🎉 Comece a gerenciar suas finanças!

---

## 🎯 Features Implementadas

- ✅ Autenticação com Supabase Auth
- ✅ Banco de dados PostgreSQL
- ✅ Row Level Security (RLS)
- ✅ CRUD de Empresas
- ✅ CRUD de Contratos
- ✅ Gestão de Parcelas
- ✅ Agenda Financeira (Lista + Calendário)
- ✅ Fluxo de Caixa
- ✅ Múltiplas empresas por usuário
- ✅ Rateio de despesas
- ✅ Cartões de crédito
- ✅ Fornecedores

---

## 💡 Dicas

1. **Backup**: O Supabase faz backup automático dos dados
2. **Logs**: Acesse **Database** → **Database** → **Logs** para debug
3. **Explorar Dados**: Use o **Table Editor** do Supabase para ver os dados
4. **API**: Todos os dados estão acessíveis via API REST automática do Supabase

---

**Desenvolvido com ❤️ usando React + TypeScript + Supabase**
