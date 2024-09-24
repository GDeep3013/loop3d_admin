import React from 'react'
import { Container, Form, Button, Card, } from 'react-bootstrap';
const SuggestedGoal = ({ chatResponse, loading, regenerateResponse, AddNewGoal,setChatResponse }) => {

    return (
        <div className='plan_content suggest_goals'>
            <div className="mt-0">
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
                                    onChange={(e) => setChatResponse(e.target.value)}
                                />
                            </Form.Group>
                            <div className="d-flex">
                                <Button
                                    variant="primary" className="w-50 me-2"
                                    disabled={loading}
                                    onClick={(e) => { AddNewGoal(e) }}
                                >
                                    {loading ? 'Generating...' : 'Add Goal to Development Plan'}
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="w-50 ml-0"
                                    onClick={regenerateResponse}
                                    disabled={loading}
                                > {loading ? 'Generating...' : 'Make Goal More Specific'}
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </div>
        </div>
    )
}

export default SuggestedGoal
