# NerdHub-Frontend

This repository contains the React-based frontend for the NerdHub application. It provides the user interface for browsing games, viewing user profiles, and accessing administrative functions.

## Features

- **Game Library**: Browse and search for games available in the NerdHub library.
- **Game Details**: View detailed information for a specific game.
- **User Authentication**: Integrates with Keycloak for secure user authentication.
- **API Communication**: Communicates with the NerdHub-Backend API to fetch and display data.

## Key Components

- `src/components/pages/GamesPage.js`: The main page for browsing the game library.
- `src/components/pages/GameDetailsPage.js`: Displays detailed information for a selected game.
- `src/services/gameService.js`: Contains functions for making API calls to the backend.
- `src/contexts/AuthContext.js`: Manages the application's authentication state.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
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
    npm start
    ```
The application will be available at `http://localhost:3000`.

### Configuration

1.  Create a `.env` file in the root of the project.
2.  Add the following environment variables to the `.env` file:
    ```
    REACT_APP_API_ROOT=http://localhost:5000
    VERSION=dev-prerelease
    ```