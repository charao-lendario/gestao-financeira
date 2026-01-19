## **1\) MVP em planilha (começa agora, funciona e dá controle)**

### **Aba 1 — CLIENTES**

Uma linha por cliente.

**Colunas**

* Cliente\_ID (ex: CLT-0001)  
* Nome do Cliente  
* CNPJ/CPF  
* Contato (Nome)  
* Telefone  
* E-mail  
* Cidade/UF  
* Responsável Interno (quem atende)  
* Status do Cliente (Ativo / Pausado / Encerrado)

---

### **Aba 2 — CONTRATOS**

Uma linha por contrato (um cliente pode ter vários contratos).

**Colunas**

* Contrato\_ID (ex: CTR-2026-001)  
* Cliente\_ID (puxa da aba CLIENTES)  
* Nome do Projeto/Serviço  
* Data do Contrato  
* Valor Total do Contrato  
* Forma de Pagamento (À vista / Parcelado / Mensalidade)  
* Qtd Parcelas (se parcelado)  
* Dia do Vencimento (ex: todo dia 10\)  
* Data Início Cobrança  
* Data Fim Cobrança (se tiver)  
* Observações  
* Status do Contrato (Ativo / Encerrado / Cancelado)

---

### **Aba 3 — PAGAMENTOS (REALIZADOS \+ PREVISTOS)**

Aqui é o coração. **Uma linha \= uma parcela/cobrança** (prevista ou paga).

**Colunas**

* Pagamento\_ID  
* Contrato\_ID  
* Competência (Mês/Ano) (ex: 01/2026)  
* Data Prevista  
* Valor Previsto  
* Data Pago (preenche quando cair)  
* Valor Pago  
* Status (Previsto / Pago / Atrasado / Renegociado / Cancelado)  
* Dias em Atraso (cálculo)  
* Forma de Recebimento (PIX / Boleto / Transferência / Cartão)  
* Comprovante (link) (opcional)  
* Observação Financeiro

✅ **Como você enxerga por mês?**

* Você filtra por Competência (01/2026, 02/2026…)  
* E tem o resumo mensal (aba 4\) automaticamente

---

### **Aba 4 — RESUMO MENSAL (Dashboard)**

Uma linha por mês (12 linhas no ano, ou contínuo).

**Colunas**

* Mês/Ano  
* Total Previsto  
* Total Pago  
* Total em Aberto  
* Total Atrasado  
* % Realizado (Pago/Previsto)  
* Top 10 em Aberto (pode ser lista/visão)

**Regras básicas**

* **Total Previsto** \= soma Valor Previsto do mês  
* **Total Pago** \= soma Valor Pago do mês  
* **Em Aberto** \= Previsto \- Pago (ou soma por status “Previsto”)  
* **Atrasado** \= soma por status “Atrasado”

---

## **2\) Versão “Nível 1000” (o que levar pro desenvolvedor)**

Abaixo está o “pacote completo” para virar app (ou AppSheet/Flutter/web), com **dados, telas, regras, alertas e relatórios**.

# **A) Estrutura de Dados (modelo ideal)**

### **Tabela: clientes**

* id, nome, documento, contatos, endereço, responsavel\_interno, status

### **Tabela: contratos**

* id, cliente\_id, descricao, data\_contrato, valor\_total  
* tipo\_cobranca (avista/parcelado/mensalidade)  
* qtd\_parcelas, valor\_parcela (se fixo), dia\_vencimento  
* inicio, fim, status, anexos

### **Tabela: parcelas (agenda financeira)**

* id, contrato\_id, competencia, vencimento  
* valor\_previsto, valor\_pago, data\_pagamento  
* status (previsto/pago/atrasado/renegociado/cancelado)  
* meio\_pagamento, observacao, comprovante\_url

### **(Opcional mas “premium”) Tabela: renegociacoes**

* id, parcela\_id (ou contrato\_id), motivo, de\_data/de\_valor, para\_data/para\_valor, aprovado\_por, data\_registro

### **(Opcional) Tabela: centro\_de\_receita / produtos**

* para você segmentar: Consultoria, CRM, Mentoria, etc.

---

# **B) Regras automáticas (motor do financeiro)**

### **1\) Geração automática de previsões**

Ao criar contrato:

* Se **à vista** → cria 1 parcela  
* Se **parcelado** → cria N parcelas (com competência, vencimento e valor)  
* Se **mensalidade** → cria parcelas recorrentes até data fim (ou “sem fim” até cancelar)

### **2\) Status automático**

* Se data\_pagamento preenchida → **Pago**  
* Se hoje \> vencimento e não pago → **Atrasado**  
* Se alterou vencimento/valor → **Renegociado**

### **3\) Alertas**

* D-7 e D-3 do vencimento: lembrete interno  
* D+1 (atraso): alerta \+ lista de cobrança do dia  
* Fechamento do mês: trava/valida (evitar bagunça)

---

# **C) Telas (UX de app) — simples de usar**

### **Tela 1 — Visão Geral (Home)**

* Cards: Previsto do mês / Pago do mês / Em aberto / Atrasado  
* Lista “Vence nos próximos 7 dias”  
* Lista “Atrasados”

### **Tela 2 — Clientes**

* Busca por nome/CNPJ  
* Ao abrir o cliente: contratos \+ parcelas \+ histórico

### **Tela 3 — Contratos**

* Criar/editar contrato  
* Botão: “Gerar parcelas / Regerar parcelas” (com validações)

### **Tela 4 — Agenda Financeira**

* Filtro por mês  
* Agrupa por dia (tipo calendário)  
* Ação rápida: marcar como pago (preenche data e valor)

### **Tela 5 — Relatórios**

* Por mês (linha do tempo)  
* Por cliente (inadimplência, histórico)  
* Por responsável interno (carteira)  
* Por produto/serviço (separar receitas)

---

# **D) Relatórios “nível diretor” (o que impressiona)**

1. **DRE simples de recebimento (caixa)**  
* Previsto vs Realizado por mês  
* Atraso acumulado e % inadimplência  
1. **Aging (envelhecimento da inadimplência)**  
* 1–7 dias, 8–15, 16–30, 31–60, 60+  
1. **Previsão de caixa (próximos 90 dias)**  
* Quanto entra por semana  
* Top riscos (clientes com histórico de atraso)  
1. **Ranking**  
* Top clientes por receita  
* Top clientes por atraso  
* Top contratos por valor

---

# **E) Permissões e segurança (pra ficar profissional)**

* Admin (vê tudo, altera estrutura)  
* Financeiro (dá baixa, ajusta valores)  
* Comercial/CS (vê clientes e vencimentos, não altera valores)  
* Logs: quem editou o quê e quando

---

# **F) Integrações \- Somente se não tiver muitos custo ou complexidade \- Opção**

* WhatsApp (mensagem automática de cobrança com dados da parcela)  
* Emissão de boleto/nota (se aplicável)  
* Banco/PIX (conciliação)  
* Google Drive (comprovantes)  
* E-mail automático de lembrete

## **3\) Resumo pronto)**

Se você mandar isso pro desenvolvedor, ele entende o que construir:

* **Entidades:** clientes, contratos, parcelas, renegociações (opcional)  
* **Fluxo:** criar contrato → gerar parcelas → acompanhar vencimentos → dar baixa → relatórios  
* **Regras:** status automático \+ alertas \+ previsões por mês  
* **Telas:** home dashboard \+ agenda mensal \+ detalhes cliente/contrato \+ relatórios  
* **KPIs:** previsto, pago, aberto, atrasado, aging, forecast 90 dias

