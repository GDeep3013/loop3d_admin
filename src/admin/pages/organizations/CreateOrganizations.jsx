import React, { useState, useEffect } from "react";
import { Col, Row, Container, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';

import { fetchCompetencies } from "../../../apis/CompentencyApi";
import { createOrgnizations } from "../../../apis/OrgnizationApi";

export default function CreateOrganization({ id, savedData }) {
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [loader, setLoader] = useState(false);
    const [selectedCompetencies, setSelectedCompetencies] = useState([]); // Stores selected competencies
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({ name: '', user_id: user?._id });

    useEffect(() => {
        getCategories(); // Fetch categories when modal is opened
    }, []);

    // Fetch competencies (categories)
    async function getCategories() {
        try {
            let result = await fetchCompetencies("AssignCompetency");
            const categoryOptions = result.categories
                ? result.categories
                    .filter(category => category.status !== 'inactive') // Filter out inactive categories
                    .map(category => ({
                        value: category._id,
                        label: category.category_name,
                    }))
                : [];
            setCategories(result.categories);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (savedData?.name) {
            setFormData({ ...savedData });
        }
    }, [savedData]);

    // Form validation
    const validateForm = (formData, selectedCompetencies) => {
        let errors = {};
        if (!formData?.name?.trim()) {
            errors.name = 'Organization name is required';
        }
        if (!id && selectedCompetencies.length === 0) {
            errors.competency = 'At least one competency must be selected';
        }
        return errors;
    };

    // Handle checkbox changes for competencies
    const handleCheckboxChange = (categoryId) => {
        const updatedSelectedCompetencies = selectedCompetencies.includes(categoryId)
            ? selectedCompetencies.filter(id => id !== categoryId) // Remove if already selected
            : [...selectedCompetencies, categoryId]; // Add if not selected

        setSelectedCompetencies(updatedSelectedCompetencies);
        setFormData({ ...formData, selectedCompetency: updatedSelectedCompetencies, user_id: user?._id });
    };

    // Handle form submission for both Create and Edit
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validate form
        const validationErrors = validateForm(formData, selectedCompetencies);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoader(true);
        const url = id ? `/api/organizations/${id}` : "/api/organizations/create";
        const method = id ? "PUT" : "POST"; // Use PUT for editing and POST for creating

        try {
            const response = await createOrgnizations(url, formData, method);
            const { name } = response;

            Swal.fire({
                position: "center",
                icon: "success",
                title: `Organization ${name} ${id ? "updated" : "created"} successfully!`,
                showConfirmButton: false,
                timer: 1500
            });
            setLoader(false);
            setTimeout(() => navigate('/organizations'), 1500);

        } catch (error) {
            if (error.error) {
                setLoader(false);
                setErrors({ name: error.error });
            } else {
                console.error('Unexpected error:', error);
            }
        }
    };

    // Handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, name: e.target.value });
        setErrors({});
    };

    return (
        <div className="content-outer pd-2 bg-white bt-0">
            <Form className="organization-form mt-5">
                <Container>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-4">
                                <Form.Label>Organization Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData?.name || ''}
                                    onChange={handleChange}
                                    placeholder="Organization Name"
                                />
                                {errors.name && <small className="text-danger">{errors.name}</small>}
                            </Form.Group>
                        </Col>
                        {!id && <Col md={12}>
                            <Row className='custom_tab_content'>
                                <Col md={4}>
                                    <div className='list-scroll'>
                                        <h3>Individual Contributor</h3>
                                        <ul className='custom-tabs'>
                                            {categories && categories
                                                .filter(cat => cat.competency_type === 'individual_contributor' && cat.status !== "inactive")
                                                .map((cat) => (
                                                    <li key={cat._id} className='list-group-item d-flex align-items-center'>
                                                        <label>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedCompetencies.includes(cat._id)}
                                                                onChange={() => handleCheckboxChange(cat._id)}
                                                            />
                                                            <span> {cat.category_name}</span>
                                                        </label>
                                                    </li>
                                                ))}
                                        </ul>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className='list-scroll'>
                                        <h3>People Manager</h3>
                                        <ul className='custom-tabs'>
                                            {categories && categories
                                                .filter(cat => cat.competency_type === 'people_manager' && cat.status !== "inactive")
                                                .map((cat) => (
                                                    <li key={cat._id} className='list-group-item d-flex align-items-center'>
                                                        <label>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedCompetencies.includes(cat._id)}
                                                                onChange={() => handleCheckboxChange(cat._id)}
                                                            />
                                                            <span>{cat.category_name}</span>
                                                        </label>
                                                    </li>
                                                ))}
                                        </ul>
                                    </div>
                                </Col>
                            </Row>
                        {errors.competency && <Col md={12}><small className="text-danger">{errors.competency}</small></Col>}
                        </Col>}


                        <Col md={12}>
                            <div className="profile-btns pt-0 mt-3">
                                <Button className="default-btn" onClick={handleSubmit} disabled={loader}>
                                    {id ? "Update" : "Save"}
                                </Button>
                                <Button className="default-btn cancel-btn" onClick={() => navigate('/organizations')}>
                                    Cancel
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </Form>
        </div>
    );
}
