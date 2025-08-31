import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Spinner, Alert, Form, Badge } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import useDocumentTitle from 'hooks/useDocumentTitle';
import quoteService from 'services/quoteService';
import 'styles/QuotesPage.css';

function QuotesPage() {
  useDocumentTitle('Quotes');
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    // Initialize view mode from URL parameter, default to 'table'
    const urlView = searchParams.get('view');
    return urlView === 'kanban' || urlView === 'table' ? urlView : 'table';
  });
  const [groupBy, setGroupBy] = useState('quotedPersons'); // 'quotedPersons' or 'submitter'
  const [sortBy, setSortBy] = useState('timestamp'); // 'timestamp', 'submitter', 'quotedPersons'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'

  // Format date and time for Chicago timezone in M/DD/YYYY H:MM AM/PM format
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    const options = {
      timeZone: 'America/Chicago',
      month: 'numeric',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleString('en-US', options);
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  // Update URL when view mode changes
  useEffect(() => {
    setSearchParams({ view: viewMode });
  }, [viewMode, setSearchParams]);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quoteService.getAllQuotes();
      setQuotes(data);
    } catch (err) {
      setError('Failed to load quotes');
      console.error('Error loading quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sort quotes function
  const sortQuotes = (quotes) => {
    return [...quotes].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'timestamp':
          comparison = new Date(a.timestamp) - new Date(b.timestamp);
          break;
        case 'submitter':
          comparison = a.submitter.localeCompare(b.submitter);
          break;
        case 'quotedPersons':
          // Sort by first quoted person alphabetically
          const aFirstPerson = a.quotedPersons[0] || '';
          const bFirstPerson = b.quotedPersons[0] || '';
          comparison = aFirstPerson.localeCompare(bFirstPerson);
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'desc' ? -comparison : comparison;
    });
  };

  const handleDeleteQuote = async (quoteId) => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      try {
        await quoteService.deleteQuote(quoteId);
        setQuotes(quotes.filter(q => q.id !== quoteId));
      } catch (err) {
        setError('Failed to delete quote');
        console.error('Error deleting quote:', err);
      }
    }
  };

  const groupQuotes = () => {
    const grouped = {};
    const sortedQuotes = sortQuotes(quotes);
    
    sortedQuotes.forEach(quote => {
      let keys = [];
      if (groupBy === 'quotedPersons') {
        keys = quote.quotedPersons;
      } else {
        keys = [quote.submitter];
      }
      
      keys.forEach(key => {
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(quote);
      });
    });
    
    // Quotes are already sorted by the sortQuotes function
    // No need to sort again within groups
    
    return grouped;
  };

  const renderTableView = () => {
    const groupedQuotes = groupQuotes();
    
    return (
      <div>
        {Object.entries(groupedQuotes).map(([group, groupQuotes]) => (
          <Card key={group} className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                {groupBy === 'quotedPersons' ? '🗣️ ' : '📝 '}
                {group} ({groupQuotes.length} quotes)
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table striped hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th className="quote-text">Quote</th>
                    <th className="quoted-persons-cell">Quoted Person(s)</th>
                    <th className="submitter-cell">Submitted By</th>
                    <th className="date-cell">Date</th>
                    <th className="actions-cell">Actions</th>
                    <th className="spacer-cell"></th>
                  </tr>
                </thead>
                <tbody>
                  {groupQuotes.map((quote) => (
                    <tr key={quote.id}>
                      <td className="quote-text">"{quote.quoteText}"</td>
                      <td className="quoted-persons-cell">
                        {quote.quotedPersons.map((person, index) => (
                          <Badge key={index} bg="secondary" className="me-1">
                            {person}
                          </Badge>
                        ))}
                      </td>
                      <td className="submitter-cell">{quote.submitter}</td>
                      <td className="date-cell">{formatDateTime(quote.timestamp)}</td>
                      <td className="actions-cell">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteQuote(quote.id)}
                        >
                          Delete
                        </Button>
                      </td>
                      <td className="spacer-cell"></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        ))}
      </div>
    );
  };

  const renderKanbanView = () => {
    const groupedQuotes = groupQuotes();
    
    return (
      <div className="kanban-container">
        <div className="kanban-board">
          {Object.entries(groupedQuotes).map(([group, groupQuotes]) => (
            <div key={group} className="kanban-column">
              <Card className="kanban-column-card">
                <Card.Header className="kanban-column-header">
                  <h6 className="mb-0">
                    {groupBy === 'quotedPersons' ? '🗣️ ' : '📝 '}
                    {group}
                    <Badge bg="primary" className="ms-2">{groupQuotes.length}</Badge>
                  </h6>
                </Card.Header>
                <Card.Body className="kanban-column-body">
                  {groupQuotes.map((quote) => (
                    <Card key={quote.id} className="mb-3 quote-card">
                      <Card.Body className="py-2">
                        <div className="quote-content">
                          <blockquote className="blockquote mb-2">
                            <p className="mb-1">"{quote.quoteText}"</p>
                          </blockquote>
                          <div className="quote-meta small text-muted">
                            <div>
                              <strong>Quoted:</strong> {quote.quotedPersons.join(', ')}
                            </div>
                            <div>
                              <strong>By:</strong> {quote.submitter}
                            </div>
                            <div>
                              <strong>Date:</strong> {formatDateTime(quote.timestamp)}
                            </div>
                          </div>
                          <div className="mt-2">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteQuote(quote.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  // Use full-width layout for kanban view
  const ContainerComponent = viewMode === 'kanban' ? 'div' : Container;
  const containerProps = viewMode === 'kanban' ? { className: 'quotes-page-fullwidth' } : {};

  return (
    <>
      {/* Shared header for both views */}
      <div className={viewMode === 'kanban' ? 'kanban-header' : 'table-header'}>
        <Container>
          <Row className="mb-2 align-items-center">
            <Col md={4}>
              <h1 className="mb-0">📝 Quotes</h1>
            </Col>
            <Col md={8} className="d-flex align-items-end justify-content-end">
              <Badge bg="success" className="fs-6 quotes-counter">
                {quotes.length} quote{quotes.length !== 1 ? 's' : ''}
              </Badge>
            </Col>
          </Row>
          <Row className="mb-3 align-items-end">
            <Col md={3}>
              <Form.Group>
                <Form.Label>View Mode</Form.Label>
                <Form.Select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                >
                  <option value="table">Table View</option>
                  <option value="kanban">Kanban View</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Group By</Form.Label>
                <Form.Select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                >
                  <option value="quotedPersons">Quoted Person(s)</option>
                  <option value="submitter">Submitter</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Sort By</Form.Label>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="timestamp">Time</option>
                  <option value="submitter">Submitter</option>
                  <option value="quotedPersons">Quoted Person</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <button
                className="sort-direction-button"
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                title={`Currently sorting ${sortDirection === 'asc' ? 'ascending' : 'descending'}`}
              >
                {sortDirection === 'asc' ? '↑ Asc' : '↓ Desc'}
              </button>
            </Col>
          </Row>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </Container>
      </div>

      {/* Content area */}
      <ContainerComponent {...containerProps}>
        {quotes.length === 0 ? (
          <Alert variant="info">
            No quotes found. Start collecting quotes in your Discord channel!
          </Alert>
        ) : (
          <>
            {viewMode === 'table' ? renderTableView() : renderKanbanView()}
          </>
        )}
      </ContainerComponent>
    </>
  );
}

export default QuotesPage;