📌 Taskify – Gerenciador de Tarefas Pessoais e Colaborativas
Organize seu dia, seus projetos e seus objetivos de forma simples, produtiva e bonita.

📝 Visão Geral
O Taskify é uma aplicação web para gestão de tarefas pessoais e colaborativas, permitindo:

Criação de workspaces (privados ou compartilhados)

Organização por categorias e datas

Editor de notas rico associado a cada tarefa

Colaboração com diferentes níveis de permissão (Owner, Editor, Viewer)

Interface clean e responsiva para desktop e mobile

Este projeto foi pensado para produtividade e experiência do usuário, além de servir como um portfólio profissional.

🚀 Funcionalidades (MVP)
Autenticação de usuários com JWT

CRUD de tarefas com título, descrição, status e data de vencimento

Workspaces privados e compartilhados

Categorias personalizadas

Editor de notas para cada tarefa

Filtros e busca por status, categoria ou data

Notificações e alertas de deadlines

🗄️ Modelagem do Banco de Dados
O Taskify segue uma arquitetura relacional com as seguintes entidades principais:

users – Usuários com autenticação segura (BCrypt)

workspaces – Ambientes de organização de tarefas

usuario_workspace – Relação usuário-workspace com papéis

categories – Categorias criadas pelos usuários

tasks – Tarefas com status e prazos

task_notes – Notas ricas para cada tarefa

Principais relacionamentos:

1 usuário → N workspaces (owner)

N usuários ↔ N workspaces (compartilhamento)

1 workspace → N tarefas

1 categoria → N tarefas

1 tarefa → 1 nota

Migrations controladas via Flyway e uso de índices para otimizar consultas.

🛠️ Tecnologias Utilizadas
Backend
Java 17+

Spring Boot

Spring Security (JWT)

Spring Data JPA

PostgreSQL (produção) / H2 (desenvolvimento)

Flyway (migrations)

Frontend
React (Vite)

Tailwind CSS

Axios para chamadas à API

DevOps e Ferramentas
Docker / Docker Compose

Git + GitHub

Postman / Insomnia

DBeaver

📂 Estrutura de Pastas
bash
Copiar
Editar
taskify/
├─ backend/    # Java Spring Boot
│   ├─ controller
│   ├─ service
│   ├─ repository
│   ├─ model
│   ├─ dto
│   └─ config
└─ frontend/   # React + Vite + Tailwind
    ├─ components
    ├─ pages
    ├─ services
    ├─ hooks
    ├─ utils
    └─ assets
⚙️ Como Rodar o Projeto
1️⃣ Clonar o repositório
bash
Copiar
Editar
git clone https://github.com/seu-usuario/taskify.git
cd taskify
2️⃣ Backend (Spring Boot)
bash
Copiar
Editar
cd backend
./mvnw spring-boot:run
3️⃣ Frontend (React + Vite)
bash
Copiar
Editar
cd frontend
npm install
npm run dev
O frontend estará disponível em http://localhost:5173 e o backend em http://localhost:8080.

📌 Roadmap
 Autenticação de usuários

 CRUD de tarefas

 Organização por categorias

 Compartilhamento via workspaces

 Sistema de notificações

 Integração com calendário

 Tema dark/light

