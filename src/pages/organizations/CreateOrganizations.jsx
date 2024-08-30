import React, { useState, useEffect } from "react";
import AuthLayout from "../../layout/Auth";
import { Col, Row, Container, Form, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import axios from "axios";
 import OrganizationTabs from "./OrganizationTabs";
import AssignCompetencies from "./AssignCompetencies";

import { createOrgnizations } from "../../apis/OrgnizationApi"

export default function AddOrganization({id, formData, setFormData}) {
    // const { id } = useParams();  // Retrieve the organization ID from the URL parameters
    const navigate = useNavigate();
  console.log('formData',formData)
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
  

    // Handle form submission for both Create and Edit
    const handleSubmit = async (event) => {
        event.preventDefault();
        const validationErrors = validateForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

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
    
            setTimeout(() => navigate('/organizations'), 1500);
        } catch (error) {
            if (error.error) {
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
                                        value={formData.name?formData.name:""}
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

    );
}