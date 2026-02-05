# 📧 Configurar Template de Email no Supabase

## 🎯 Como Personalizar o Email de Confirmação

### Passo 1: Acessar Configurações de Email
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Authentication** (menu lateral)
4. Clique em **Email Templates**

### Passo 2: Selecionar o Template
1. Encontre **Confirm signup** na lista de templates
2. Clique para editar

### Passo 3: Copiar o HTML
1. Abra o arquivo `confirm-signup.html` nesta pasta
2. **Copie TODO o conteúdo HTML**

### Passo 4: Colar no Supabase
1. No Supabase, role até a seção **Message (Body)**
2. **Cole** o HTML que você copiou
3. **Salve as alterações**

---

## 📝 Customizar o Template

O template usa variáveis do Supabase:

| Variável | O que faz |
|----------|-----------|
| `{{ .Email }}` | Email do usuário |
| `{{ .ConfirmationURL }}` | Link de confirmação |

### Personalizações Possíveis:

#### 1. Mudar as Cores
Procure por:
- **Cor principal (amarelo)**: `#f59e0b` → substitua pela cor desejada
- **Fundo escuro**: `#0f172a` e `#1e293b`
- **Texto**: `#475569`, `#64748b`, `#94a3b8`

#### 2. Mudar o Logo
Substitua o emoji 🏢 por:
- Uma imagem: `<img src="URL_DA_SUA_LOGO" style="width: 64px; height: 64px;" />`
- Outro emoji

#### 3. Adicionar Redes Sociais
No footer, adicione:
```html
<p style="margin: 16px 0 0 0;">
  <a href="https://twitter.com/seu-usuario" style="color: #f59e0b; text-decoration: none; margin: 0 8px;">Twitter</a>
  <a href="https://instagram.com/seu-usuario" style="color: #f59e0b; text-decoration: none; margin: 0 8px;">Instagram</a>
</p>
```

---

## 🎨 Prévia Visual

O email terá:

✅ **Cabeçalho elegante** com gradiente escuro
✅ **Logo da empresa** destacado
✅ **Botão de confirmação** grande e visível
✅ **Link alternativo** para copiar/colar
✅ **Aviso de expiração** (24h)
✅ **Preview das funcionalidades** com ícones
✅ **Footer profissional**

---

## 🚨 Importante

- O email é **responsivo** (funciona em celular)
- Testado nos principais clientes de email (Gmail, Outlook, etc.)
- Não usar JavaScript (emails não suportam)
- Estilos inline são necessários para compatibilidade

---

## 📱 Outros Templates para Personalizar

No Supabase, você também pode personalizar:

- **Magic Link** - Login sem senha
- **Change Email Address** - Mudança de email
- **Reset Password** - Recuperação de senha

Basta seguir os mesmos passos acima para cada template!

---

## ✨ Resultado

Depois de configurar, seus usuários receberão um email **profissional e moderno** quando se cadastrarem! 🎉

**Antes:** Email padrão sem estilo
**Depois:** Email branded e visual com sua identidade
