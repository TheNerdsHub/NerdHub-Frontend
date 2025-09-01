import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Button from 'react-bootstrap/Button';
import 'styles/NavigationBar.css';
import { useAuth } from 'contexts/AuthContext';

function NavigationBar() {
  const { isAuthenticated, user, login, logout } = useAuth();
  return (
    <Navbar expand="lg" style={{ backgroundColor: "#0797ff" }}>
      <Container>
        <Navbar.Brand href="/" className="navbar-link-white text-shadow">NerdHub</Navbar.Brand>
        <Navbar.Toggle className="navbar-link-white custom-toggler" aria-controls="basic-navbar-nav">
          <span className="custom-toggler-icon"></span>
        </Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/games" className="navbar-link-white text-shadow">Games</Nav.Link>
            {isAuthenticated && (
              <Nav.Link href="/timeline" className="navbar-link-white text-shadow">Timeline</Nav.Link>
            )}
            {isAuthenticated && (
              <NavDropdown title="Quotes" id="basic-nav-dropdown" className="navbar-link-white">
                <NavDropdown.Item href="/quotes?view=table">Table View</NavDropdown.Item>
                <NavDropdown.Item href="/quotes?view=kanban">Kanban View</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="https://trello.com/b/QZ49oGxK/quotes" target="_blank">
                  Legacy Trello
                </NavDropdown.Item>
              </NavDropdown>
            )}
            {isAuthenticated && (
              <NavDropdown title="Nerds Tools" id="basic-nav-dropdown" className="navbar-link-white">
                <NavDropdown.Item href="URLTOCALENDAR">TheNerds Calendar</NavDropdown.Item>
                <NavDropdown.Item href="URLTOFILESHARE">File Sharing</NavDropdown.Item>
                <NavDropdown.Item href="URLTOKB">Knowledge Base</NavDropdown.Item>
                <NavDropdown.Item href="URLTOBRACKETMAKER">Bracket Maker</NavDropdown.Item>
              </NavDropdown>
            )}
            <Nav.Link href="/about" className="navbar-link-white text-shadow">About</Nav.Link>
            {isAuthenticated && (
              <Nav.Link href="/admin" className="navbar-link-white text-shadow">Admin</Nav.Link>
            )}
          </Nav>
          <Nav className="ms-auto">
            {isAuthenticated ? (
              <NavDropdown
                title={
                  <span>
                    <img
                      src={user?.avatar || `https://www.gravatar.com/avatar/?d=identicon`}
                      alt="Profile"
                      style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }}
                    />
                    {user?.username || 'User'}
                  </span>
                }
                id="user-nav-dropdown"
              >
                <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
                <NavDropdown.Item onClick={logout}>Sign Out</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Button variant="outline-light" className="text-shadow" onClick={login}>
                Sign In
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;