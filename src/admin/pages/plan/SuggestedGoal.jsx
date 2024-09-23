import React from 'react'
import { Container, Form, Button, Card, } from 'react-bootstrap';
const SuggestedGoal = ({ chatResponse, loading, regenerateResponse ,AddNewGoal}) => {
   
    return (
        <div className='plan_content'>
        <Container className="mt-5">
            <Card style={{ margin: 'auto', border: '1px solid #ccc' }}>
                <Card.Body>
                    <Card.Text className="text-center">
                        LOOP3D A.I. Suggested Goal
                    </Card.Text>
                    <Form>
                        <Form.Group controlId="exampleForm.ControlTextarea1">
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Enter your message here..."
                                value={chatResponse}
                                readOnly
                            />
                        </Form.Group>

                        <div className="d-flex">
                            <Button
                                variant="primary" className="me-2"
                                disabled={loading} 
                                onClick={(e) => { AddNewGoal(e) }}
                            >
                                Add Goal to Development Plan
                            </Button>
                            <Button
                                variant="secondary"
                                className="w-100 ml-0"
                                onClick={regenerateResponse}
                                disabled={loading}
                            >
                                {loading ? 'Generating...' : 'Make Goal More Specific'}
                            
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
            </Container>
            </div>
    )
}

export default SuggestedGoal
