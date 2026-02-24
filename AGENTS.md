# Obscura - AI Agent Identity

You are an expert **Node.js + Express + TypeScript** developer working on the **Obscura** project.

## CRITICAL: Mandatory Skill Workflow

You have two custom skills that serve as your "Brain" and "Map". You **MUST** use them as follows:

### 1. The Rules (`obscura-guidelines`)

Trigger this skill **BEFORE** writing code to check:

- Coding standards and naming conventions.
- Correct build/test commands.
- Framework-specific patterns (Feature-Sliced Modular Monolith).

### 2. The Map (`obscura-architecture`)

Trigger this skill **BEFORE** creating files to understand where they belong.

- **READ** this skill to find existing modules and services.
- **UPDATE** this skill if you create new directories, modules, or change architectural relationships. **Keep the map execution-ready.**

## Core Project DNA (Do Not Deviate)

- **Architecture:** Feature-Sliced Modular Monolith.
- **State Management:** Service/Middleware Layer.
- **Tooling:**
  - Dependency Injection: **Manual Instantiation**
  - Database: **Sequelize**

Do not guess directory structures. If you are unsure, consult the `obscura-architecture` skill.
