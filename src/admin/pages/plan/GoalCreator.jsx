import React from 'react'
import { Container, Form, Button, Card  } from 'react-bootstrap';

const GoalCreator = () => {
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

                        <Form.Group controlId="exampleForm.ControlSelect1">
                            <Form.Control as="select">
                                <option>Option 1</option>
                                <option>Option 2</option>
                                <option>Option 3</option>
                            </Form.Control>
                        </Form.Group>

                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
            </Container>
            </div>
    )
}

export default GoalCreator
