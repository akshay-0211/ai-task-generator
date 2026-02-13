# Prompts Used During Development

This document contains the prompts used to generate code for this project. Responses are not included to keep the file concise.

---

## Initial Project Setup Prompt

```
You are a senior full-stack engineer helping me build a clean, production-ready evaluation project.

Build a working web app called:

"AI Tasks Generator – Mini Planning Tool"

This is for a backend engineering role evaluation. Keep it clean, simple, and correct. Do NOT over-engineer. Do NOT skip requirements.

====================================================
TECH STACK
====================================================

Backend:
- Node.js
- Fastify
- TypeScript
- Prisma ORM
- PostgreSQL

Frontend:
- Next.js (App Router)
- TailwindCSS
- Keep UI simple and clean

LLM:
- Use OpenAI API
- Environment variable: OPENAI_API_KEY
- One structured generation call per spec

Deployment-ready:
- Dockerfile
- docker-compose.yml (app + postgres)
- .env.example
- No secrets in code

====================================================
CORE FUNCTIONAL REQUIREMENTS
====================================================

1) Home Page

Form fields:
- Goal (textarea, required)
- Target Users (textarea, required)
- Constraints (textarea, optional)
- Template Type (dropdown: Web App, Mobile App, Internal Tool)

Submit button: "Generate Plan"

Below form:
- Show last 5 generated specs
- Each clickable to view details

----------------------------------------------------

2) LLM Generation

When form is submitted:
- Call backend
- Backend calls OpenAI
- Generate structured JSON ONLY in this format:

{
  "user_stories": [
    {
      "title": "string",
      "description": "string",
      "tasks": [
        {
          "title": "string",
          "description": "string",
          "group": "string"
        }
      ]
    }
  ],
  "risks": [
    "string"
  ]
}

Rules:
- Enforce structured JSON response
- Validate with Zod
- If invalid JSON, return proper error
- Do not blindly trust model output

----------------------------------------------------

3) Database Schema (Prisma)

Models:

Spec:
- id (uuid)
- goal (string)
- users (string)
- constraints (string)
- templateType (string)
- createdAt (DateTime)

UserStory:
- id (uuid)
- specId (relation)
- title (string)
- description (string)
- position (int)

Task:
- id (uuid)
- storyId (relation)
- title (string)
- description (string)
- groupName (string)
- position (int)

Risk:
- id (uuid)
- specId (relation)
- description (string)

Add proper relations and cascade delete.

----------------------------------------------------

4) Spec Detail Page

Show:
- All user stories
- Tasks grouped by groupName
- Risks section

Allow:
- Edit task title/description
- Move task up/down (reorder via position)
- Save changes via API

Do NOT implement drag-and-drop.
Use simple move up/down buttons.

----------------------------------------------------

5) Export Feature

Add:
- "Copy as Markdown"
- "Download as .md"

Generate markdown on backend.

----------------------------------------------------

6) Status Page (/status)

Must show:

- Backend health
- Database connectivity check
- LLM connectivity test (simple test prompt)

Return JSON + simple UI page.

----------------------------------------------------

7) Validation & Error Handling

- Required field validation
- Graceful LLM failure handling
- Proper Fastify error handler
- No crashes on bad input

----------------------------------------------------

8) Code Quality Requirements

- Proper folder structure:
  backend/
  frontend/

Backend:
- routes/
- services/
- plugins/
- utils/

- Separate LLM service file
- Separate DB service
- No business logic in routes
- No any types
- Strict TypeScript

Frontend:
- Clean component separation
- No unnecessary complexity

----------------------------------------------------

9) Documentation Files (Generate fully)

README.md:
- Project overview
- Setup instructions
- How to run locally
- Docker usage
- Deployment instructions
- What is implemented
- What is NOT implemented
- Architecture explanation

AI_NOTES.md:
- Which AI tools were used to build the project
- What was manually reviewed
- Which LLM provider used in app and why
- Limitations
- Future improvements

PROMPTS_USED.md:
- Include prompts used to generate code
- Do NOT include responses
- Do NOT include API keys

ABOUTME.md:
- Placeholder:
  Name
  Role
  Tech Stack
  Resume link placeholder

----------------------------------------------------

10) Security & Repo Rules

- No API keys in code
- Use .env.example
- Validate environment variables
- Proper error messages
- Clean commit-ready structure

----------------------------------------------------

11) Output Format

Return:

1) Full project folder structure
2) Then provide code file-by-file
3) Ensure TypeScript compiles
4) Ensure Prisma schema is valid
5) Ensure app runs with:

docker-compose up --build

Do NOT provide partial implementation.
Do NOT skip required features.
Keep UI minimal but functional.
Focus on correctness and clarity.
```

---

## Notes

- This was the primary prompt used to generate the entire project
- No additional prompts were needed as the initial prompt was comprehensive
- The AI assistant (Claude) generated all code in a single session
- Manual review and validation were performed on the generated code
- No API keys or sensitive information were included in any prompts
