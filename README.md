
📌 Taskify – Personal & Collaborative Task Manager
Organize your day, projects, and goals in a simple, productive, and beautiful way.

📝 Overview
Taskify is a web application for personal and collaborative task management, allowing you to:

Create workspaces (private or shared)

Organize by categories and due dates

Use a rich text editor for detailed task notes

Collaborate with different permission levels (Owner, Editor, Viewer)

Enjoy a clean and responsive interface for desktop and mobile

Designed with productivity and user experience in mind, Taskify also serves as a professional portfolio project.

🚀 Features (MVP)
User authentication with JWT

CRUD operations for tasks (title, description, status, due date)

Private and shared workspaces

Custom categories

Rich notes editor for each task

Filters and search by status, category, or date

Notifications and deadline alerts

🗄️ Database Model
Taskify follows a relational database structure with these main entities:

users – Users with secure authentication (BCrypt)

workspaces – Task organization environments

usuario_workspace – User-workspace relationship with roles

categories – User-created categories

tasks – Tasks with status and deadlines

task_notes – Rich notes for each task

Main relationships:

1 user → N workspaces (owner)

N users ↔ N workspaces (sharing)

1 workspace → N tasks

1 category → N tasks

1 task → 1 note

Schema migrations are managed with Flyway and indexes are used for performance optimization.

🛠️ Tech Stack
Backend
Java 21

Spring Boot

Spring Security (JWT)

Spring Data JPA

PostgreSQL (production) / H2 (development)

Flyway (migrations)

Frontend
React (Vite)

Tailwind CSS

Axios for API calls

DevOps & Tools
Docker / Docker Compose

Git + GitHub

Insomnia
