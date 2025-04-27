import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Button from 'react-bootstrap/Button';
import '../styles/NavigationBar.css';

function NavigationBar({ keycloak, isAuthenticated }) {
  return (
    <Navbar expand="lg" style={{ backgroundColor: "#0797ff" }}>
      <Container>
        <Navbar.Brand href="/" className="navbar-link-white text-shadow">NerdHub</Navbar.Brand>
        <Navbar.Toggle 
            className="navbar-link-white custom-toggler"
        aria-controls="basic-navbar-nav"
        >
  <span className="custom-toggler-icon"></span>
</Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/games" className="navbar-link-white text-shadow">Games</Nav.Link>
            <Nav.Link href="/timeline" className="navbar-link-white text-shadow">Timeline</Nav.Link>
            <NavDropdown title="Quotes" id="basic-nav-dropdown" className="navbar-link-white">
              <NavDropdown.Item href="/quotes">Table View</NavDropdown.Item>
              <NavDropdown.Item href="/quotes">List View</NavDropdown.Item>
              <NavDropdown.Item href="/quotes">KanBan View</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="https://trello.com/b/QZ49oGxK/quotes" target="_blank">
                Legacy Trello
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Nav className="ms-auto">
            {isAuthenticated ? (
              <NavDropdown
                title={
                  <span>
                    <img
                      src={`https://www.gravatar.com/avatar/${keycloak.tokenParsed?.emailHash}?d=identicon`}
                      alt="Profile"
                      style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }}
                    />
                    {keycloak.tokenParsed?.preferred_username}
                  </span>
                }
                id="user-nav-dropdown"
              >
                <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
                <NavDropdown.Item onClick={() => keycloak.logout()}>Sign Out</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Button variant="outline-light" className="text-shadow" onClick={() => keycloak.login()}>
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