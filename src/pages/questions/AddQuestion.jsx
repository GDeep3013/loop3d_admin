import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuthLayout from '../../layout/Auth';
import { Col, Row, Container, Form, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';

export default function AddQuestion() {
    const user = useSelector((state) => state.auth.user);
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        questionText: '',
        questionType: '', // 'Text' or 'Radio'
        options: [{ text: '', isCorrect: false }],
        createdBy: user?.id
    });
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/categories', {
                    headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
                });
                const data = await response.json();
                setCategories(data.categories);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (id) {
            const fetchQuestionDetails = async () => {
                try {
                    const response = await fetch(`/api/questions/${id}`, {
                        headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
                    });
                    const data = await response.json();
                    setFormData({
                        ...data,
                        createdBy: user?.id // Ensure createdBy is set
                    });
                } catch (error) {
                    console.error('Error fetching question details:', error);
                }
            };
            fetchQuestionDetails();
        }
    }, [id, user?.id]);

    // Form validation
    const validateForm = (data) => {
        let validationErrors = {};

        if (!data.questionText.trim()) {
            validationErrors.questionText = 'Question text is required';
        }

        if (!data.questionType) {
            validationErrors.questionType = 'Question type is required';
        }

        if (data.questionType === 'Radio') {
            if (data.options.length === 0 || data.options.every(option => !option.text.trim())) {
                validationErrors.options = 'At least one option is required';
            }

            if (!data.options.some(option => option.isCorrect)) {
                validationErrors.options = 'At least one correct option is required for radio questions';
            }
        }

        return validationErrors;
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({});
    };

    // Handle option change
    const handleOptionChange = (index, e) => {
        const { name, value, checked } = e.target;
        const updatedOptions = [...formData.options];
        
        if (name === 'isCorrect' && formData.questionType === 'Radio') {
            updatedOptions.forEach((option, i) => {
                option.isCorrect = i === index ? checked : false;
            });
        } else {
            updatedOptions[index][name] = name === 'isCorrect' ? checked : value;
        }

        setFormData({ ...formData, options: updatedOptions });
    };

    // Add a new option
    const addOption = () => {
        setFormData({ ...formData, options: [...formData.options, { text: '', isCorrect: false }] });
    };

    // Remove an option
    const removeOption = (index) => {
        const updatedOptions = formData.options.filter((_, i) => i !== index);
        setFormData({ ...formData, options: updatedOptions });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const url = id ? `/api/questions/${id}` : '/api/questions/create';
        const method = id ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': import.meta.env.VITE_X_API_KEY
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();

            if (response.ok) {
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: `Question ${id ? 'updated' : 'created'} successfully!`,
                    showConfirmButton: false,
                    timer: 1500
                });
                setTimeout(() => navigate('/questions'), 1500);
            } else {
                setErrors({ form: data.error });
            }
        } catch (error) {
            setErrors({ form: 'Failed to save question' });
        }
    };

    return (
        <AuthLayout title={id ? 'Edit Question' : 'Add Question'}>
            <div className="content-outer">
                <Form onSubmit={handleSubmit}>
                    <Container className='outer-box'>
                        <Row>
                        <Col md={6}>
                                <Form.Group className="mb-4">
                                    <Form.Label>Question Text</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="questionText"
                                        value={formData.questionText}
                                        onChange={handleChange}
                                        placeholder="Enter question text"
                                    />
                                    {errors.questionText && <small className="text-danger">{errors.questionText}</small>}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-4">
                                    <Form.Label>Answer Type</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="questionType"
                                        value={formData.questionType}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Type</option>
                                        <option value="Text">Text</option>
                                        <option value="Radio">Radio</option>
                                    </Form.Control>
                                    {errors.questionType && <small className="text-danger">{errors.questionType}</small>}
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            {formData.questionType === 'Radio' && (
                                <Col md={12}>
                                    <div className='question-contant'>
                                    <h3>Answers</h3>
                                    <Button type="button" onClick={addOption} variant="primary">
                                        Add Option
                                    </Button>
                                    </div>
                                    <div className='question-from'>
                                    {formData.options.map((option, index) => (
                                        <div key={index} className="mb-3">
                                            <Form.Control
                                                type="text"
                                                name="text" 
                                                placeholder={`Option ${index + 1}`}
                                                value={option.text}
                                                onChange={(e) => handleOptionChange(index, e)}
                                            />
                                            <div className='question-inner'>
                                            <Form.Check
                                                type="checkbox"
                                                name="isCorrect"
                                                label="Correct"
                                                checked={option.isCorrect}
                                                onChange={(e) => handleOptionChange(index, e)}
                                            />
                                            
                                            <Button type="button" onClick={() => removeOption(index)} variant="danger">
                                                <img src='/images/remove.png'/>
                                            </Button>
                                            </div>
                                        </div>
                                    ))}
                                        </div>
                                    {errors.options && <small className="text-danger">{errors.options}</small>}
                                </Col>
                            )}
                            <Col md={12}>
                                <div className="profile-btns">
                                    <Button type="submit" className="default-btn">
                                        {id ? 'Update' : 'Save'}
                                    </Button>
                                    <Button type="button" className="default-btn cancel-btn" onClick={() => navigate('/questions')}>
                                        Cancel
                                    </Button>
                                </div>
                                {errors.form && <p className="text-danger">{errors.form}</p>}
                            </Col>
                        </Row>
                    </Container>
                </Form>
            </div>
        </AuthLayout>
    );
}