---
name: project-context
description: Detailed project information, historical context, and business logic explanation.
---

## System Overview
Argus Server: A TypeScript/Node.js backend application serving as the core of the Argus platform.

## Architecture
- **Layered Architecture:** Likely follows Controller-Service-Repository pattern (common with Express/Sequelize).
- **Communication:** REST API (Express), GraphQL API (Apollo), and WebSocket events (Socket.IO).

## Integrations
- **Cloud Storage:** AWS S3 (`@aws-sdk/client-s3`).
- **Authentication:** JWT, Firebase Admin.
- **Notifications:** Nodemailer (Email), Firebase (Push).
- **Hardware Integration:** Teltonika parser (`complete-teltonika-parser`) suggests IoT/telematics capabilities.

## Development Workflow
- **Linting:** ESLint + Prettier.
- **Testing:** Docker-based testing environment.
- **Deployment:** Docker containers managed via PM2 in production.
