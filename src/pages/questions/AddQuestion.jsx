import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuthLayout from '../../layout/Auth';
import { Col, Row, Container, Form, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';

export default function AddQuestion({ id, savedData }) {
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        questionText: '',
        questionType: '', // 'Text' or 'Radio'
        options: [{ text: '', weightage: 1 }], // Added weightage
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
        if (savedData) {
            setFormData({
                ...savedData,
                createdBy: user?.id // Ensure createdBy is set
            });
        }
    }, [savedData, user?.id]);

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

        }

        return validationErrors;
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "questionType" && value === "Text") {
            setFormData({ ...formData, [name]: value, options: [] });
        } else {
            setFormData({ ...formData, [name]: value, options: [{ text: '', isCorrect: false, weightage: 1 }] });
        }
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
        setFormData({ ...formData, options: [...formData.options, { text: '', isCorrect: false, weightage: 1 }] });
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
        <div>
        {!id && <div class="tabe-outer">
            <div class="main-back-heading">
                <div class="container">
                    <div class="row">
                        <div class="col-md-6 p-0">
                            <div className="profile-btns pt-0">
                                <Button className="default-btn cancel-btn ml-0" onClick={() => navigate(-1)}>
                                    Back
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>} 
        
            <div className="content-outer bg-white ml-8 p-c-3 ">
           
            <Form onSubmit={handleSubmit}>
            <Container className="outer-box">
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
                                    <h3 class="add-title">Answers</h3>
                                    <Button type="button" onClick={addOption} variant="primary">
                                        Add Option
                                    </Button>
                                </div>
                                <div className='question-from'>
                                    {formData.options.map((option, index) => (
                                        <div key={index} className="mb-3 ans-block">
                                            <Row>
                                                <Col md={8}>
                                                    <Form.Control
                                                        type="text"
                                                        name="text"
                                                        placeholder={`Option ${index + 1}`}
                                                        value={option.text}
                                                        onChange={(e) => handleOptionChange(index, e)}
                                                    />
                                                </Col>
                                                <Col md={3}>
                                                    <Form.Control
                                                        as="select"
                                                        name="weightage"
                                                        value={option.weightage}
                                                        onChange={(e) => handleOptionChange(index, e)}
                                                    >
                                                        <option value="">Select weightage</option>
                                                        <option value="1">1</option>
                                                        <option value="2">2</option>
                                                        <option value="3">3</option>
                                                        <option value="4">4</option>
                                                        <option value="5">5</option>
                                                        <option value="6">6</option>
                                                        <option value="7">7</option>
                                                        <option value="8">8</option>
                                                        <option value="9">9</option>
                                                        <option value="10">10</option>
                                                    </Form.Control>
                                                </Col>
                                            </Row>
                                            <div className='question-inner'>
                                                <Button type="button" onClick={() => removeOption(index)} variant="danger">
                                                    <img src='/images/remove.png' alt='Remove' />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {errors.options && <small className="text-danger">{errors.options}</small>}
                            </Col>
                        )}
                        <Col md={12}>
                            <div className="profile-btns pt-0">
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
        </div>
    );
}
