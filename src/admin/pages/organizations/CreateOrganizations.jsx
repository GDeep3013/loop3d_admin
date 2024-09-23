import React, { useState, useEffect } from "react";
import AuthLayout from "../../../layout/Auth";
import { Col, Row, Container, Form, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import Select from 'react-select';
import { useSelector } from 'react-redux';

import { fetchCompetencies, fetchSubcategories } from "../../../apis/CompentencyApi";
import { createOrgnizations } from "../../../apis/OrgnizationApi"

export default function CreateOrganization({ id, savedData }) {
    const user = useSelector((state) => state.auth.user);

    // const { id } = useParams();  // Retrieve the organization ID from the URL parameters
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [loader, setLoader] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState(null); // Selected category
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({selectedCompetency:[], user_id:user?._id});
    useEffect(() => {
        getCategories(); // Fetch categories when modal is opened
    }, []);



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
            setCategories(categoryOptions);
        } catch (error) {
            console.error(error);
        }
    }
    const handleCategoryChange = (selected) => {
        setSelectedCategory(selected);
        setFormData({selectedCompetency:selectedCategory, user_id:user?._id });
    };

    useEffect(() => {
        if (savedData?.name) {
            setFormData({ ...savedData });
        }
    }, [savedData]);


    // Form validation
    const validateForm = (formData) => {
        let errors = {};
        if (!formData?.name?.trim()) {
            errors.name = 'Organization name is required';
        }
        if (!selectedCategory) {
            errors.competency = 'Competency is required';
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

        setLoader(true)         
        const url = id ? `/api/organizations/${id}` : "/api/organizations/create";
        const method = id ? "PUT" : "POST"; // Use PUT for editing and POST for creating

        try {
            if (formData?.selectedCompetency?.length > 0) {
                const response = await createOrgnizations(url, formData, method);
                const { name } = response;

                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: `Organization ${name} ${id ? "updated" : "created"} successfully!`,
                    showConfirmButton: false,
                    timer: 1500
                });
                setLoader(false)         

                setTimeout(() => navigate('/organizations'), 1500);
            }
        } catch (error) {
            if (error.error) {
                setLoader(false)         

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
        <div className="content-outer pd-2 bg-white  bt-0">

            {/* {!id && <div className="tabe-outer">
                <div className="main-back-heading">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-6 p-0">
                                <div className="profile-btns pt-0">
                                    <Button className="default-btn cancel-btn ml-0" onClick={() => navigate(-1)}>
                                        Back
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>}    */}
            <Form className="organization-form">
                <Container>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-4">
                                <Form.Label>Organization Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData?.name}
                                    onChange={handleChange}
                                    placeholder="Organization Name"
                                />
                                {errors.name && <small className="text-danger">{errors.name}</small>}
                            </Form.Group>
                        </Col>
                        {!id && <Col md={6}>
                            <Form.Group className="mb-4">
                                <Form.Label>Select Competency</Form.Label>
                                <Select
                                    options={categories}
                                    value={selectedCategory}
                                    onChange={handleCategoryChange}
                                    placeholder="Select Competency..."
                                    isSearchable
                                    isMulti
                                    filterOption={(option, inputValue) =>
                                        option.label.toLowerCase().includes(inputValue.toLowerCase())
                                    }
                                />
                                {errors?.competency && <small className="text-danger">{errors?.competency}</small>}

                            </Form.Group>
                        </Col>}
                        <Col md={12}>
                            <div className="profile-btns pt-0">
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