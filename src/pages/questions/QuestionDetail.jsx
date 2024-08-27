import React, { useState, useEffect } from 'react';
import AuthLayout from '../../layout/Auth';
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Card, ListGroup, Spinner, Alert } from 'react-bootstrap';

export default function QuestionDetail() {
    const { questionId } = useParams();
    const navigate = useNavigate();
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchQuestionDetails();
    }, [questionId]);

    console.log(`Question`, questionId);
    async function fetchQuestionDetails() {
        setLoading(true);
        try {
            const response = await fetch(`/api/questions/${questionId}`, {
                headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch question details');
            }

            const data = await response.json();
            setQuestion(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout title={'Question Details'} subTitle={'Details of the question'}>
            <Container>
                <Row>
                    <Col md={{ span: 8, offset: 2 }}>
                        {loading && <Spinner animation="border" />}
                        {error && <Alert variant="danger">{error}</Alert>}
                        {!loading && question && (
                            <Card className="mt-4 shadow-sm">
                                <Card.Body>
                                    <Card.Title className="mb-4"><strong>Question:</strong> {question.questionText}</Card.Title>
                                    <ListGroup className='custom-list '>
                                        {question.options.map((option, index) => (
                                            <ListGroup.Item key={index} as="li">
                                                {option.text}
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                    <div className="mt-4 d-flex justify-content-between">
                                        <Button variant="primary" onClick={() => navigate(`/questions/${question._id}`)}>Edit</Button>
                                        <Button variant="secondary" onClick={() => navigate('/questions')}>Back</Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        )}
                    </Col>
                </Row>
            </Container>
        </AuthLayout>
    );
}
