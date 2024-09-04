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
            <div className="content-outer main-wrapper pd-2 bg-white question-wrapper">
            <div class="tabe-outer ">
   <div class="main-back-heading">
      <div class="container">
         <div class="row">
            <div class="col-md-6 p-0">
            <div className="profile-btns pt-0">
                <Button className="default-btn cancel-btn ml-0" onClick={() => navigate(-1)}>
                    Back
                </Button>
            </div>                  
            </div>
         </div>
      </div>
   </div>
</div>  
            <Container>
                <Row>
                    <Col md={{ span: 6 }}>
                        {loading && <Spinner animation="border" />}
                        {error && <Alert variant="danger">{error}</Alert>}
                        {!loading && question && (
                            <Card className="">
                                <Card.Body>
                                    <Card.Title className="mb-4">
                                        <strong>Question:</strong> {question.questionText}
                                    </Card.Title>
                                    {/* <Card.Subtitle className="mb-3 text-muted">
                                        <strong>Type:</strong> {question.questionType}
                                    </Card.Subtitle> */}
                                    <ListGroup className='custom-list'>
                                        <ul>
                                        {question.options.map((option, index) => (
                                                <ListGroup.Item key={index} as="li">
                                                {option.text} {option.isCorrect && <strong>(Correct)</strong>}
                                            </ListGroup.Item>
                                        ))}
                                            </ul>
                                    </ListGroup>
                                    <div className="mt-4 d-flex gap-3">
                                        {/* <Button variant="secondary" onClick={() => navigate('/questions')}>Back</Button> */}
                                        <Button variant="primary edit-btn" onClick={() => navigate(`/questions/${question._id}`)}>Edit</Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        )}
                    </Col>
                </Row>
                </Container>
                </div>
        </AuthLayout>
    );
}
