# NerdHub-Frontend

This repository contains the React-based frontend for the NerdHub application. It provides the user interface for browsing games, viewing user profiles, and accessing administrative functions.

## Features

- **Game Library**: Browse and search for games available in the NerdHub library.
- **Game Details**: View detailed information for a specific game.
- **Quote Tracking**: Monitor and save memorable quotes from voice and text channels.
- **Timeline**: View historical game data and updates.
- **Admin Panel**: Manage server configuration and data.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v22 or later)
- [npm](https://www.npmjs.com/)

### Running Locally

1.  **Clone the repository:**
    ```sh
    git clone <repository-url>
    ```
2.  **Install dependencies:**
    ```sh
    npm install
    ```
3.  **Start the development server:**
    ```sh
    npm run dev
    ```
The application will be available at `http://localhost:5173`.

### Configuration

1.  Create a `.env` file in the root of the project.
2.  Add the following environment variables to the `.env` file:
    ```
    VITE_API_ROOT=http://localhost:5172
    VITE_VERSION=dev-prerelease
    ```

> **Note:** When running via Docker, the backend URL is injected at container start via the `API_URL_EXTERNAL` env var (not from `.env`). See the [NerdHub-Docker README](https://github.com/TheNerdsHub/NerdHub-Docker) for details.