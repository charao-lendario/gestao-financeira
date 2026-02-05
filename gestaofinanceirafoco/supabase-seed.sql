-- =====================================================
-- DADOS DE EXEMPLO (SEED) - OPCIONAL
-- =====================================================
-- Execute este SQL APÓS criar sua primeira conta e empresa
-- =====================================================
-- IMPORTANTE: Substitua 'SEU_USER_ID' pelo seu ID de usuário
-- Para descobrir seu user_id, execute:
-- SELECT id FROM auth.users WHERE email = 'seu@email.com';
-- =====================================================

-- Exemplo de como inserir fornecedores de exemplo
-- Descomente e ajuste as linhas abaixo substituindo 'SEU_USER_ID'

/*
INSERT INTO suppliers (user_id, name, cnpj, category) VALUES
  ('SEU_USER_ID', 'AWS Services Brasil', '12.345.678/0001-90', 'Infraestrutura'),
  ('SEU_USER_ID', 'Google Cloud Platform', '98.765.432/0001-10', 'Infraestrutura'),
  ('SEU_USER_ID', 'WeWork Office', '45.123.789/0001-55', 'Aluguel'),
  ('SEU_USER_ID', 'Regus Business Center', '78.901.234/0001-22', 'Aluguel'),
  ('SEU_USER_ID', 'Consultoria Fiscal TW', '11.222.333/0001-44', 'Serviços'),
  ('SEU_USER_ID', 'Escritório Contábil XYZ', '99.888.777/0001-66', 'Serviços'),
  ('SEU_USER_ID', 'Light Energia', '55.666.777/0001-88', 'Utilidades'),
  ('SEU_USER_ID', 'Vivo Empresas', '44.333.222/0001-99', 'Telecomunicações');
*/

-- =====================================================
-- COMO USAR:
-- =====================================================
-- 1. Crie sua conta e faça login na aplicação
-- 2. Cadastre sua primeira empresa
-- 3. Execute no Supabase SQL Editor:
--    SELECT id, email FROM auth.users WHERE email = 'seu@email.com';
-- 4. Copie o ID retornado
-- 5. Descomente as linhas acima e substitua 'SEU_USER_ID' pelo ID copiado
-- 6. Execute este SQL no Supabase SQL Editor
-- =====================================================

-- Verificar fornecedores cadastrados:
-- SELECT * FROM suppliers WHERE user_id = 'SEU_USER_ID';
