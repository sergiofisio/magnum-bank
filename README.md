# Magnum Bank - Teste Full Stack (Node.js & React)

## 🚀 Deploy & Demonstração Online

A aplicação está disponível para teste nos seguintes links:

- **Frontend (Vercel):** [**https://magnum-bank-nu.vercel.app/**](https://magnum-bank-nu.vercel.app/) [cite: 52]
- **Backend (Render):** [**https://magnum-bank.onrender.com**](https://magnum-bank.onrender.com)

---

## 📖 Visão Geral do Projeto

**Magnum Bank** é uma aplicação web completa que simula as funcionalidades de um banco digital, desenvolvida em React. [cite: 5] O sistema permite que os utilizadores façam a gestão das suas finanças, incluindo a visualização de saldos e contas, realização de transações (PIX e TED) e consulta de um extrato detalhado com filtros avançados. [cite: 5]

Este projeto foi desenvolvido para ser abrangente, cobrindo uma vasta gama de habilidades de desenvolvimento full stack, desde a modelagem de dados e criação de uma API RESTful segura até à construção de uma interface de utilizador reativa, internacionalizada e componentizada. [cite: 80]

## ✨ Funcionalidades Implementadas

A aplicação atende a todos os requisitos funcionais especificados e inclui desafios extras. [cite: 56, 72]

#### Autenticação e Segurança
- **Cadastro de Utilizador:** Formulário de múltiplos passos para uma melhor experiência de utilizador.
- **Autenticação por JWT:** Login seguro com CPF e senha, gerando um token JWT para autenticação nas rotas protegidas. [cite: 9, 41]
- **Timer de Inatividade:** Desloga automaticamente o utilizador após 10 minutos de inatividade, com um aviso modal quando a sessão está prestes a expirar.
- **Trilha de Auditoria:** Registo no backend de todas as ações sensíveis (atualizações de dados, senhas, etc.) com informações do autor da ação, IP e User-Agent.

#### Gestão de Contas e Perfil
- **Múltiplas Contas:** Cada utilizador pode ter várias contas, com agência e número gerados automaticamente.
- **Dashboard Interativo:** A página inicial permite selecionar uma conta e ver dinamicamente as informações e o extrato correspondente.
- **Gestão de Dados:** CRUD completo para o utilizador gerir os seus próprios endereços e telefones.
- **Saldos Ocultáveis:** Funcionalidade para mostrar/ocultar os saldos das contas individualmente ou todos de uma vez.

#### Transações e Extrato
- **Realizar Transações:** Ecrã dedicado para realizar transferências do tipo PIX (para contas internas) e TED (simulação externa). [cite: 14]
- **Validação de Senha de Transação:** Exigência da senha de transação para confirmar qualquer transferência, como requerido. [cite: 15]
- **Extrato Detalhado:**
    - Lista de transações de **entrada e saída**. [cite: 27]
    - Agrupamento por dia, com exibição do saldo anterior e do saldo final do dia.
    - Filtros por período (7, 15, 30 e 90 dias). [cite: 28]

#### Desafios Extras
- **Internacionalização (i18n):** Suporte completo para Português, Inglês e Francês em todo o frontend. [cite: 78]
- **Backend Robusto:** Em vez de uma API mock, foi construída uma API completa com Node.js, Prisma e PostgreSQL para uma simulação mais realista. [cite: 31]

## 🚀 Tecnologias e Decisões Técnicas

O projeto foi organizado numa estrutura de monorepo, com duas pastas principais: `server` para o backend e `client` para o frontend.

### Backend (`server/`)
- **Stack**: Node.js, Express.js, TypeScript, Prisma, PostgreSQL.
- **Decisões**:
    - **Prisma**: Escolhido como ORM pela sua excelente integração com TypeScript (type-safety), sistema de migrações robusto e facilidade para realizar transações atómicas.
    - **API RESTful**: A arquitetura segue o padrão de Controladores para separar a lógica de negócio das definições de rotas.
    - **Segurança**: Utilização de `bcryptjs` para hashing de senhas e JWT para autenticação stateless. A lógica de `soft delete` e a trilha de auditoria foram implementadas para garantir a integridade e segurança dos dados.

### Frontend (`client/`)
- **Stack**: React 18, Vite, TypeScript, Redux Toolkit, React Router v6, Tailwind CSS, `i18next`.
- **Decisões**:
    - **Vite**: Escolhido pela sua performance superior em ambiente de desenvolvimento (HMR ultra-rápido).
    - **Redux Toolkit**: Utilizado para um gerenciamento de estado global previsível e escalável, especialmente para o estado de autenticação, dados do utilizador e estado da UI (como a conta selecionada). [cite: 33]
    - **React Router**: Gerencia toda a navegação e a proteção de rotas através de uma arquitetura de layouts aninhados. [cite: 40]
    - **Tailwind CSS**: Escolhido para a estilização pela sua abordagem "utility-first", que permite a construção de interfaces de forma rápida e consistente.
    - **Componentização**: A UI foi dividida em componentes pequenos e reutilizáveis (`Input`, `Button`, `BalanceCard`, etc.), cada um com uma responsabilidade única.

## 🔧 Configuração e Execução Local

**Pré-requisitos:** Node.js (v18+), Yarn, PostgreSQL e Git.

### Backend (`server/`)
```bash
# 1. Navegue para a pasta do servidor
cd server

# 2. Instale as dependências
yarn install

# 3. Crie e configure o ficheiro .env a partir do .env.example
# Preencha a DATABASE_URL com a sua string de conexão do PostgreSQL
cp .env.example .env

# 4. Execute as migrações do Prisma para criar as tabelas
yarn prisma migrate dev

# 5. (Opcional, mas recomendado) Popule o banco com dados de teste
yarn prisma:seed

# 6. Inicie o servidor de desenvolvimento
yarn dev
# O servidor estará a rodar em http://localhost:3333
```

### Frontend (`client/`)
```bash
# 1. Num novo terminal, navegue para a pasta do cliente
cd client

# 2. Instale as dependências
yarn install

# 3. Crie o ficheiro .env
# O conteúdo deve ser: VITE_API_BASE_URL=http://localhost:3333/api
echo "VITE_API_BASE_URL=http://localhost:3000/api" > .env

# 4. Inicie o cliente de desenvolvimento
yarn dev
# A aplicação estará a rodar em http://localhost:5173 (ou outra porta indicada)
```

## 👤 Credenciais de Teste (do Seed)

- **Utilizador Comum**:
    - **CPF**: `111.111.111-11`
    - **Senha**: `password123`
- **Utilizador Admin**:
    - **CPF**: `333.333.333-33`
    - **Senha**: `password123`
- **Senha de Transação (para todos)**: `1234`