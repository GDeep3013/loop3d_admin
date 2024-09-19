import React from 'react'
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
const SuggestedGoal = () => {
    return (
        <Container className="mt-5">
            <Card style={{ margin: 'auto', border: '1px solid #ccc' }}>
                <Card.Body>
                    <Card.Text className="text-center">
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
                            <Button variant="primary" className="w-100 mr-0">
                                Add Goal to Development Plan
                            </Button>
                            <Button variant="secondary" className="w-100 ml-0">
                                Make Goal More Specific
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    )
}

export default SuggestedGoal
