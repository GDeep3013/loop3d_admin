import React, { useState, useEffect } from "react";
import AuthLayout from "../../layout/Auth";
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
    parent_id: '',
    created_by: user?.id,
  });
  const [categories, setCategories] = useState([]);  // For parent categories select box
  const [errors, setErrors] = useState({});

  // Form validation
  const validateForm = (formData) => {
    let errors = {};
    if (!formData.category_name.trim()) {
      errors.category_name = 'Competency name is required';
    }
    return errors;
  };

  // Fetch existing categories for the parent_id select box
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories',{
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
          const response = await axios.get(`/api/categories/${id}`,{
            headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
          });
          const { category_name, parent_id } = response.data;
          setFormData({ category_name, parent_id , created_by : user?.id });
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
        setTimeout(() => navigate('/competencies'), 1500);
      })
      .catch(error => {
        if (error.response) {
          const { error: errorMessage } = error.response.data;
          setErrors({ category_name: errorMessage });
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
      <div className="content-outer">
        <Form className="category-form">
          <Container>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Competency Name</Form.Label>
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
                  <Form.Label>Parent Competency</Form.Label>
                  <Form.Select
                    name="parent_id"
                    value={formData.parent_id}
                    onChange={handleChange}
                  >
                    <option value="">Select Parent Competency (optional)</option>
                    {categories.length > 0 && categories.map((category) => (
                      category.parent_id == null && <option key={category._id} value={category._id}>
                        {category.category_name}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.parent_id && <small className="text-danger">{errors.parent_id}</small>}
                </Form.Group>
              </Col>
              <Col md={12}>
                <div className="profile-btns">
                  <Button className="default-btn" onClick={handleSubmit}>
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