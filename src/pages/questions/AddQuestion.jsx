import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuthLayout from '../../layout/Auth';
import { Col, Row, Container, Form, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';

export default function AddQuestion() {
    const user = useSelector((state) => state.auth.user); // Assuming user is in auth slice
    const { id } = useParams(); // Retrieve question ID from URL parameters
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        questionText: '',
        options: [{ text: '', isCorrect: false }],
        createdBy: user?.id
    });
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        // Fetch categories for parent options (if needed)
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
        let errors = {};
        if (!data.questionText.trim()) {
            errors.questionText = 'Question text is required';
        }
        if (data.options.length === 0 || data.options.every(option => !option.text.trim())) {
            errors.options = 'At least one option is required';
        }
        return errors;
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
        updatedOptions[index][name] = name === 'isCorrect' ? checked : value;
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
                    <Container>
                        <Row>
                            <Col md={12}>
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
                            <Col md={12}>
                                <h3>Options</h3>
                                {formData.options.map((option, index) => (
                                    <div key={index} className="mb-3">
                                        <Form.Control
                                            type="text"
                                            name="text"
                                            placeholder={`Option ${index + 1}`}
                                            value={option.text}
                                            onChange={(e) => handleOptionChange(index, e)}
                                        />
                                        <Button type="button" onClick={() => removeOption(index)} variant="danger">
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" onClick={addOption} variant="primary">
                                    Add Option
                                </Button>
                            </Col>
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
