import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './components/HomePage';
import GamesPage from './components/GamesPage';
import QuotePage from './components/QuotesPage';
import TimelinePage from './components/TimelinePage';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={HomePage} />
        <Route path="/games" component={GamesPage} />
        <Route path="/quotes" component={QuotePage} />
        <Route path="/timeline" component={TimelinePage} />
      </Switch>
    </Router>
  );
}

export default App;