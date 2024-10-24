import React, { useState } from 'react'
import { Form, Button, Card } from 'react-bootstrap';

const GoalCreator = ({loading, handleSubmit, selectedOption, setSelectedOption, categories, chatResponse, setChatResponse }) => {
    const [errors, setErrors] = useState({
        chatResponse: '',
        selectedOption: ''
    });
    const handleSelectChange = (e) => {
        setSelectedOption(e.target.value);
    };
    const handleSubmited = () => {
        let formErrors = { chatResponse: '', selectedOption: '' };
        let isValid = true;
        if (!chatResponse.trim()) {
            formErrors.chatResponse = 'Please enter your message.';
            isValid = false;
        }

        if (selectedOption=='') {
            formErrors.selectedOption = 'Please select a relevant competency.';
            isValid = false;
        }
        setErrors(formErrors);
        if (isValid) {
            handleSubmit();
        }
    };
    return (
        <div className='plan_content'>
            <div className='mt-0'>


                <Card style={{ margin: 'auto', border: '1px solid #ccc' }}>
                    <Card.Body>
                        <Card.Text className="text-center">
                            Goal Development Creator
                        </Card.Text>
                        <Form >
                            {/* Textarea for Prompt */}
                            <Form.Group controlId="exampleForm.ControlTextarea1">
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Enter your message here..."
                                    value={chatResponse}
                                    onChange={(e) => setChatResponse(e.target.value)}
                                    required
                                />
                                  
                                {errors.chatResponse && (
                                    <small className="text-danger plan-error">{errors.chatResponse}</small>
                                    )}
                            </Form.Group>

                            {/* Select Option */}
                            <Form.Group controlId="exampleForm.ControlSelect1">
                                <Form.Control
                                    as="select"
                                    value={selectedOption} onChange={handleSelectChange}
                                    required>
                                    <option value=" ">Relevant Competency</option>
                                    {categories.map(category => (
                                        <option key={category._id} value={category.category_name}>
                                            {category.category_name}
                                        </option>
                                    ))}
                                </Form.Control>
                                    {errors.selectedOption && (
                                        <small className="text-danger plan-error">{errors.selectedOption}</small>
                                    )}
                            </Form.Group>
                            <Button variant="primary"  disabled={loading} onClick={handleSubmited}>
                                {loading ? 'Submitting' : 'Submit'}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </div>
        </div>
    )
}

export default GoalCreator
