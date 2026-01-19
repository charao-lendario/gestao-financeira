#!/bin/bash

# 🚀 Setup Local - Gestão Financeira

set -e

echo "================================================"
echo "🚀 Setup Local - Gestão Financeira"
echo "================================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir com cor
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# 1. Verificar Node.js
echo "1️⃣  Verificando Node.js..."
if ! command -v node &> /dev/null; then
    error "Node.js não encontrado. Instale em https://nodejs.org"
fi
NODE_VERSION=$(node --version)
success "Node.js $NODE_VERSION encontrado"
echo ""

# 2. Verificar npm
echo "2️⃣  Verificando npm..."
if ! command -v npm &> /dev/null; then
    error "npm não encontrado"
fi
NPM_VERSION=$(npm --version)
success "npm $NPM_VERSION encontrado"
echo ""

# 3. Verificar PostgreSQL ou Docker
echo "3️⃣  Verificando PostgreSQL ou Docker..."
HAS_POSTGRES=false
HAS_DOCKER=false

if command -v psql &> /dev/null; then
    HAS_POSTGRES=true
    success "PostgreSQL encontrado"
else
    warn "PostgreSQL não encontrado localmente"
fi

if command -v docker &> /dev/null; then
    HAS_DOCKER=true
    success "Docker encontrado"
else
    warn "Docker não encontrado"
fi

if [ "$HAS_POSTGRES" = false ] && [ "$HAS_DOCKER" = false ]; then
    error "Instale PostgreSQL (brew install postgresql@15) ou Docker"
fi
echo ""

# 4. Criar .env files
echo "4️⃣  Criando arquivos .env..."

# Backend .env
if [ ! -f .env ]; then
    cat > .env << 'EOF'
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gestao_financeira"
NODE_ENV="development"
PORT=3001
JWT_SECRET="seu-secret-super-secreto-dev-only"
JWT_EXPIRES_IN="7d"
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
EOF
    success ".env criado"
else
    success ".env já existe"
fi

# Frontend .env.local
if [ ! -f apps/web/.env.local ]; then
    cat > apps/web/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
EOF
    success "apps/web/.env.local criado"
else
    success "apps/web/.env.local já existe"
fi
echo ""

# 5. Instalar dependências
echo "5️⃣  Instalando dependências (pode levar ~2 min)..."
npm install
success "Dependências instaladas"
echo ""

# 6. Setup PostgreSQL
echo "6️⃣  Configurando banco de dados..."

if [ "$HAS_DOCKER" = true ]; then
    # Verificar se container já existe
    if docker ps -a --format '{{.Names}}' | grep -q "^gestao-db$"; then
        if docker ps --format '{{.Names}}' | grep -q "^gestao-db$"; then
            success "Container Docker já está rodando"
        else
            warn "Container encontrado mas não está rodando. Iniciando..."
            docker start gestao-db
            sleep 2
            success "Container iniciado"
        fi
    else
        warn "Criando container Docker..."
        docker run -d \
            --name gestao-db \
            -e POSTGRES_PASSWORD=postgres \
            -e POSTGRES_DB=gestao_financeira \
            -p 5432:5432 \
            postgres:15
        sleep 3
        success "Container Docker criado e rodando"
    fi
elif [ "$HAS_POSTGRES" = true ]; then
    # Verificar se PostgreSQL está rodando
    if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
        success "PostgreSQL está rodando"
    else
        warn "Iniciando PostgreSQL..."
        brew services start postgresql@15
        sleep 2
        success "PostgreSQL iniciado"
    fi

    # Criar database
    if psql -l | grep -q gestao_financeira; then
        success "Database gestao_financeira já existe"
    else
        warn "Criando database..."
        createdb gestao_financeira
        success "Database gestao_financeira criado"
    fi
fi
echo ""

# 7. Rodar migrations Prisma
echo "7️⃣  Rodando migrations Prisma..."
npm run prisma db push --workspace=@gestao-financeira/database
success "Migrations concluídas"
echo ""

# 8. Instruções finais
echo "================================================"
echo -e "${GREEN}✓ Setup Completo!${NC}"
echo "================================================"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "Terminal 1 - Rodar Backend API:"
echo "  npm run dev --workspace=@gestao-financeira/api"
echo ""
echo "Terminal 2 - Rodar Frontend:"
echo "  npm run dev --workspace=@gestao-financeira/web"
echo ""
echo "Depois:"
echo "  1. Abra http://localhost:3000"
echo "  2. Login com: demo@example.com / demo123"
echo "  3. Teste a aplicação!"
echo ""
echo "📚 Documentação:"
echo "  - LOCAL_SETUP.md - Setup detalhado"
echo "  - README.md - Visão geral"
echo ""
echo "================================================"
