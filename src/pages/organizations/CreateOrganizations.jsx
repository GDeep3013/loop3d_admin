import React, { useState, useEffect } from "react";
import AuthLayout from "../../layout/Auth";
import { Col, Row, Container, Form, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import axios from "axios";

import AssignCompetencies from "./AssignCompetencies";

export default function AddOrganization() {
    const { id } = useParams();  // Retrieve the organization ID from the URL parameters
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: ''
    });
    const [errors, setErrors] = useState({});

    // Form validation
    const validateForm = (formData) => {
        let errors = {};
        if (!formData.name.trim()) {
            errors.name = 'Organization name is required';
        }
        return errors;
    };

    // Fetch organization details if editing
    useEffect(() => {
        if (id) {
            const fetchOrganizationDetails = async () => {
                try {
                    const response = await axios.get(`/api/organizations/${id}`, {
                        headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
                    });
                    const { name } = response.data;
                    setFormData({ name });
                } catch (error) {
                    console.error("Error fetching organization details:", error);
                }
            };
            fetchOrganizationDetails();
        }
    }, [id]);

    // Handle form submission for both Create and Edit
    const handleSubmit = async (event) => {
        event.preventDefault();
        const validationErrors = validateForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const url = id ? `/api/update-organization/${id}` : "/api/create-organization";
        const method = id ? "PUT" : "POST"; // Use PUT for editing and POST for creating

        await axios({
            method,
            url,
            data: formData,
        })
            .then(response => {
                const { name } = response.data;
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: `Organization ${name} ${id ? "updated" : "created"} successfully!`,
                    showConfirmButton: false,
                    timer: 1500
                });
                setTimeout(() => navigate('/organizations'), 1500);
            })
            .catch(error => {
                if (error.response) {
                    const { error: errorMessage } = error.response.data;
                    setErrors({ name: errorMessage });
                }
            });
    };

    // Handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, name: e.target.value });
        setErrors({});
    };

    return (
        <AuthLayout title={id ? "Edit Organization" : "Add Organization"}>
            <div className="content-outer">
                <Form className="organization-form">
                    <Container>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-4">
                                    <Form.Label>Organization Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Organization Name"
                                    />
                                    {errors.name && <small className="text-danger">{errors.name}</small>}
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <div className="profile-btns">
                                    <Button className="default-btn" onClick={handleSubmit}>
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

            {id && <AssignCompetencies orgniation={{ orgniation_id: id, name: formData.name}} type="organization" />}
        </AuthLayout>
    );
}