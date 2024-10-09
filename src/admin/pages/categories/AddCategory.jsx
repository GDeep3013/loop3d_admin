import React, { useState, useEffect } from "react";
import AuthLayout from "../../../layout/Auth";
import { Col, Row, Container, Form, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Swal from 'sweetalert2';
import axios from "axios";
import { useSelector } from 'react-redux';


export default function AddCategory() {

  const user = useSelector((state) => state.auth.user); // Assuming the slice is named "auth"

  const { id } = useParams();  // Retrieve category ID from the URL parameters
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category_name: '',
    competency_type: '',
    status:'active',
    created_by: user?._id,
  });
  const [categories, setCategories] = useState([]);  // For parent categories select box
  const [errors, setErrors] = useState({});
  const [loader, setLoader] = useState(false);


  // Form validation
  const validateForm = (formData) => {
    let errors = {};
    const namePattern = /^[A-Za-z0-9\s]+$/;
    if (!formData.category_name.trim()) {
      errors.category_name = 'Competency name is required';
    }else if (!namePattern.test(formData.category_name.trim())) {
      errors.category_name = 'Competency name can only contain letters and numbers';
  }
    if (!formData.competency_type.trim()) {
      errors.competency_type = 'Competency type is required';
    }
    return errors;
  };

  // Fetch existing categories for the parent_id select box
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories', {
          headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
        });  // API endpoint to fetch categories
        // let json =  await response.json();
        setCategories(response.data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch category details if editing
  useEffect(() => {
    if (id) {
      const fetchCategoryDetails = async () => {
        try {
          const response = await axios.get(`/api/categories/${id}`, {
            headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
          });
          const { category_name, competency_type ,status} = response.data;
          setFormData({ category_name, competency_type, created_by: user?.id ,status:status});
        } catch (error) {
          console.error("Error fetching category details:", error);
        }
      };
      fetchCategoryDetails(id);
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
    setLoader(true)     
    const url = id ? `/api/categories/${id}` : "/api/categories/create";
    const method = id ? "PUT" : "POST"; // Use PUT for editing and POST for creating

    await axios({
      method,
      url,
      data: formData,
      headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
    })
      .then(response => {
        const { category_name } = response.data;
        Swal.fire({
          position: "center",
          icon: "success",
          title: `Competency ${category_name} ${id ? "updated" : "created"} successfully!`,
          showConfirmButton: false,
          timer: 1500
        });
        setLoader(false)     

        setTimeout(() => navigate('/competencies'), 1500);
      })
      .catch(error => {
        if (error.response) {
          const { error: errorMessage } = error.response.data;
          setErrors({ category_name: errorMessage });
          setLoader(false)     

        }
      });
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({});
  };

  return (
    <AuthLayout title={id ? "Edit Competency" : "Add Competency"}>
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
      <div className="content-outer p-4 bg-white p-c-3 ml-8 shadow-border-wrapper">

        <Form className="category-form">
          <Container>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Competency Name</Form.Label> <sup style={{color:'red'}}>*</sup>
                  <Form.Control
                    type="text"
                    name="category_name"
                    value={formData.category_name}
                    onChange={handleChange}
                    placeholder="Competency Name"
                  />
                  {errors.category_name && <small className="text-danger">{errors.category_name}</small>}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Competency Type</Form.Label> <sup style={{color:'red'}}>*</sup>
                  <Form.Select
                    name="competency_type"
                    value={formData.competency_type}
                    onChange={handleChange}
                  >
                    <option value="">Select Competency Type</option>
                    <option value="individual_contributor">Individual Contributor</option>
                    <option value="people_manager">People Manager</option>
                    {/* 


                    {categories.length > 0 && categories.map((category) => (
                      category.parent_id == null && <option key={category._id} value={category._id}>
                        {category.category_name}
                      </option>
                    ))} */}
                  </Form.Select>
                  {errors.competency_type && <small className="text-danger">{errors.competency_type}</small>}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    {/* 


                    {categories.length > 0 && categories.map((category) => (
                      category.parent_id == null && <option key={category._id} value={category._id}>
                        {category.category_name}
                      </option>
                    ))} */}
                  </Form.Select>
                  {errors.status && <small className="text-danger">{errors.competency_type}</small>}
                </Form.Group>
              </Col>
              <Col md={12}>
                <div className="profile-btns pt-0">
                  <Button className="default-btn" onClick={handleSubmit} disabled={loader}>
                    {id ? "Update" : "Save"}
                  </Button>
                  <Button className="default-btn cancel-btn" onClick={() => navigate('/competencies')}>
                    Cancel
                  </Button>
                </div>
              </Col>
            </Row>
          </Container>
        </Form>
      </div>
    </AuthLayout>
  );
}