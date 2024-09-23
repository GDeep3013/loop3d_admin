import React from 'react'
import { Container, Form, Button, Card } from 'react-bootstrap';

const GoalCreator = ({ prompt, setPrompt, handleSubmit, selectedOption, setSelectedOption, categories }) => {
    const handleSelectChange = (e) => {
        setSelectedOption(e.target.value);     
    };
    return (
        <Container className="mt-5">
            <Card style={{ margin: 'auto', border: '1px solid #ccc' }}>
                <Card.Body>
                    <Card.Text className="text-center">
                    Goal Development Creator
                    </Card.Text>
                    <Form onSubmit={handleSubmit}>
                        {/* Textarea for Prompt */}
                        <Form.Group controlId="exampleForm.ControlTextarea1">
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Enter your message here..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)} // Set the prompt from textarea
                            required
                            />
                        </Form.Group>

                        {/* Select Option */}
                        <Form.Group controlId="exampleForm.ControlSelect1">
                            <Form.Control
                                as="select"
                                value={selectedOption} onChange={handleSelectChange} // Set the selected option
                         
                                required>
                                <option value="">Select a category</option>
                                {categories.map(category => (
                                    <option key={category._id} value={category.category_name}>
                                        {category.category_name}
                                    </option>
                                ))}

                            </Form.Control>
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">
                            Submit
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    )
}

export default GoalCreator
