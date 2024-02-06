import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

function NavigationBar() {
  return (
    <Navbar bg="dark" data-bs-theme="dark" expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="/">NerdHub</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/games">Games</Nav.Link>
            <Nav.Link href="/timeline">Timeline</Nav.Link>
            <NavDropdown title="Quotes" id="basic-nav-dropdown">
                <NavDropdown.Item href="/quotes">Table View</NavDropdown.Item>
                <NavDropdown.Item href="/quotes">List View</NavDropdown.Item>
                <NavDropdown.Item href="/quotes">KanBan View</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="/quotes" target="_blank">Legacy Trello</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;