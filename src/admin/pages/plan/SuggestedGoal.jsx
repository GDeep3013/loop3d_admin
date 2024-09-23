import React from 'react'
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
const SuggestedGoal = () => {
    return (
        <div className='plan_content'>
        <Container className="mt-5">
            <Card style={{ margin: 'auto', border: '1px solid #ccc' }}>
                <Card.Body>
                    <Card.Text>
                        This is a description of the form.
                    </Card.Text>
                    <Form>
                        <Form.Group controlId="exampleForm.ControlTextarea1">
                            <Form.Control as="textarea" rows={3} placeholder="Enter your message here..." />
                        </Form.Group>

                        {/* <Button variant="primary" type="submit" className='w-100'>
                            Submit
                        </Button> */}
                        <div className="d-flex">
                            <Button variant="primary" className="me-2">
                                Add Goal to Development Plan
                            </Button>
                            <Button variant="secondary" className="ml-0">
                                Make Goal More Specific
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
