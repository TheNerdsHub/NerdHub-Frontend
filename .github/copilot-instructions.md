This is the React frontend for the NerdHub application.

- It provides the UI for browsing games, user profiles, and admin functions.
- It uses Keycloak for authentication.
- It communicates with the NerdHub-Backend API.
- Key components:
  - `src/components/pages/GamesPage.js`: The main page for browsing games.
  - `src/components/pages/GameDetailsPage.js`: Shows details for a single game.
  - `src/services/gameService.js`: Contains functions for fetching data from the backend API.
- To run: `npm start`. The app is at http://localhost:3000.
- Use `npm test` to run tests.
