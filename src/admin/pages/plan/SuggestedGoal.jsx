import React, {useState } from 'react'
import { Container, Form, Button, Card, } from 'react-bootstrap';
const SuggestedGoal = ({ promptResponse, loading, regenerateResponse,AddNewGoal,setPromptResponse }) => {
    const [errors, setErrors] = useState({
        promptResponse: '',   
    });
    const handleSubmited = (e) => {
        let formErrors = { promptResponse: ''};
        let isValid = true;
        if (!promptResponse.trim()) {
            formErrors.promptResponse = 'Please enter your message.';
            isValid = false;
        }
        setErrors(formErrors);
        if (isValid) {
            regenerateResponse(true);
        }
    };
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
                                    value={promptResponse}
                                    onChange={(e) => setPromptResponse(e.target.value)}
                                />
                                 {errors.promptResponse && (
                                    <small className="text-danger plan-error">{errors.promptResponse}</small>
                                )}
                            </Form.Group>
                            <div className="d-flex">
                                <Button
                                    variant="primary" className="w-50 me-2"
                                    disabled={loading}
                                    onClick={(e) => {
                                        AddNewGoal(e),
                                        setErrors({ promptResponse: '' });
                                     }}
                                >
                                    {loading ? 'Generating...' : 'Add Goal to Development Plan'}
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="w-50 ml-0"
                                    onClick={(e) => { handleSubmited(e) }}
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
