# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```
## Architecture system

```mermaid
graph TB
    %% External Users
    User((User))
    Admin((Admin))
    Teacher((Teacher))
    Student((Student))

    subgraph "Frontend Application"
        direction TB
        NuxtApp["Nuxt Application<br>(Nuxt.js/Vue.js)"]
        
        subgraph "Frontend Components"
            AuthModule["Authentication Module<br>(Vue.js)"]
            UIComponents["UI Components<br>(@nuxt/ui)"]
            Router["Router<br>(Vue Router)"]
            TailwindCSS["Styling<br>(TailwindCSS)"]
        end
    end

    subgraph "Backend Services"
        direction TB
        NitroServer["Nitro Server<br>(Nuxt/Nitro)"]
        
        subgraph "API Endpoints"
            AuthAPI["Auth API<br>(Node.js)"]
            AdminAPI["Admin API<br>(Node.js)"]
            TeacherAPI["Teacher API<br>(Node.js)"]
            StudentAPI["Student API<br>(Node.js)"]
            FileAPI["File API<br>(Node.js)"]
        end

        subgraph "Core Services"
            AuthService["Authentication Service<br>(JWT)"]
            FileService["File Service<br>(Node.js)"]
            GeminiAI["AI Service<br>(Google Gemini)"]
            SessionManager["Session Manager<br>(H3)"]
        end
    end

    subgraph "Data Layer"
        PrismaORM["Prisma ORM<br>(Prisma)"]
        Database[("Database<br>(PostgreSQL)")]
    end

    subgraph "External Services"
        GeminiAIAPI["Gemini AI API<br>(Google)"]
        YoutubeAPI["YouTube API<br>(Google)"]
    end

    %% User Interactions
    User --> NuxtApp
    Admin --> NuxtApp
    Teacher --> NuxtApp
    Student --> NuxtApp

    %% Frontend Internal Connections
    NuxtApp --> AuthModule
    NuxtApp --> UIComponents
    NuxtApp --> Router
    NuxtApp --> TailwindCSS

    %% Frontend to Backend Connections
    AuthModule -->|"Authentication Requests"| AuthAPI
    NuxtApp -->|"API Requests"| NitroServer

    %% Backend Service Connections
    NitroServer --> AuthAPI
    NitroServer --> AdminAPI
    NitroServer --> TeacherAPI
    NitroServer --> StudentAPI
    NitroServer --> FileAPI

    AuthAPI --> AuthService
    AuthAPI --> SessionManager
    FileAPI --> FileService
    StudentAPI --> GeminiAI

    %% Data Layer Connections
    AuthService --> PrismaORM
    AdminAPI --> PrismaORM
    TeacherAPI --> PrismaORM
    StudentAPI --> PrismaORM
    PrismaORM --> Database

    %% External Service Connections
    GeminiAI -->|"AI Requests"| GeminiAIAPI
    FileService -->|"Video Data"| YoutubeAPI

    %% Styling
    classDef container fill:#e1eeff,stroke:#9dc3e6,stroke-width:2px
    classDef component fill:#f5f5f5,stroke:#cccccc,stroke-width:1px
    classDef external fill:#fff3e0,stroke:#ffb74d,stroke-width:2px
    classDef database fill:#e8f5e9,stroke:#81c784,stroke-width:2px

    class NuxtApp,NitroServer container
    class AuthModule,UIComponents,Router,TailwindCSS,AuthAPI,AdminAPI,TeacherAPI,StudentAPI,FileAPI,AuthService,FileService,GeminiAI,SessionManager component
    class GeminiAIAPI,YoutubeAPI external
    class Database database
```


