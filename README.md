# EdgePress: Neo-Brutalist Media Centre & CMS

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ariedotcodotnz/edgepress)

EdgePress is a full-stack, production-ready Media Centre and Content Management System (CMS) built on Cloudflare's serverless platform. It features a striking, public-facing neo-brutalist frontend for press releases and company information, designed to be visually impactful and memorable. Complementing this is a clean, intuitive, and password-protected admin panel for content creators to manage press releases, static pages, media assets, and users. The system includes advanced features like scheduled publishing, per-article analytics, and an automated email content generator to streamline media outreach.

## ✨ Key Features

*   **Public-Facing Media Centre**: A visually distinct neo-brutalist frontend for press releases, about pages, and contact information.
*   **Password-Protected Admin CMS**: A clean, modern, and intuitive interface for content management.
*   **Press Release Management**: Full CRUD functionality for press releases, including a rich text editor, status management (Draft, Published), and SEO fields.
*   **Scheduled Publishing**: Write content in advance and schedule it to be published automatically at a future date and time.
*   **Static Page Management**: Easily edit and manage content for pages like 'About', 'Contact', and 'Media Assets'.
*   **Built-in Analytics**: Track page views and engagement for each press release directly within the admin dashboard.
*   **User Management**: Simple system for managing admin and editor roles.
*   **Email Content Generation**: Automatically generate formatted email copy for new press releases to streamline journalist outreach.
*   **Serverless Architecture**: Built entirely on Cloudflare Workers and Durable Objects for global scale, performance, and reliability.

## 🚀 Technology Stack

*   **Framework**: Hono (Backend), React (Frontend)
*   **Language**: TypeScript
*   **Platform**: Cloudflare Workers
*   **Storage**: Cloudflare Durable Objects
*   **UI/Styling**: Tailwind CSS, shadcn/ui, Framer Motion
*   **State Management**: Zustand
*   **Routing**: React Router
*   **Forms**: React Hook Form, Zod
*   **Tooling**: Vite, Bun

## 🏁 Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Bun](https://bun.sh/) installed on your machine.
*   A [Cloudflare account](https://dash.cloudflare.com/sign-up).
*   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed and authenticated.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd edgepress-media-center
    ```

2.  **Install dependencies:**
    This project uses Bun as the package manager.
    ```bash
    bun install
    ```

3.  **Run the development server:**
    This command starts the Vite frontend server and the Wrangler dev server for the backend worker simultaneously.
    ```bash
    bun dev
    ```
    The application will be available at `http://localhost:3000`.

## 🏗️ Project Structure

The project is organized into three main directories:

*   `src/`: Contains the entire frontend React application, including pages, components, hooks, and utility functions.
*   `worker/`: Contains the backend Hono application that runs on Cloudflare Workers. This is where API routes, entities, and core server logic reside.
*   `shared/`: Contains TypeScript types and interfaces that are shared between the frontend and the backend to ensure type safety across the stack.

## 🛠️ Development

*   **Frontend**: All frontend code is located in the `src` directory. Create new pages in `src/pages` and reusable components in `src/components`.
*   **Backend**: API endpoints are defined in `worker/user-routes.ts` using the Hono framework.
*   **Data Models**: Data structures (Entities) that map to Durable Objects are defined in `worker/entities.ts`.
*   **Shared Types**: To add or modify data types used by both the client and server, edit the files in `shared/`.

## ☁️ Deployment

This project is designed for seamless deployment to Cloudflare's global network.

### One-Click Deploy

You can deploy this application with a single click using the button below.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ariedotcodotnz/edgepress)

### Manual Deployment via CLI

1.  **Authenticate with Wrangler:**
    If you haven't already, log in to your Cloudflare account.
    ```bash
    wrangler login
    ```

2.  **Build the project:**
    This command bundles the frontend and backend assets for production.
    ```bash
    bun build
    ```

3.  **Deploy the application:**
    This command publishes your application to Cloudflare Workers.
    ```bash
    bun deploy
    ```
    Wrangler will provide you with the URL of your deployed application.