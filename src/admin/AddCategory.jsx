import React, { useState, useEffect }from 'react'
import AuthLayout from '../layout/Auth'
import { Col, Row, Container, Form, Button } from "react-bootstrap";
import {  useParams, useNavigate } from "react-router-dom";
import { EditIcon } from "../components/svg-icons/icons"
import Swal from 'sweetalert2'
import axios from "axios"
export default function AddCategory() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState({
        categoryName : '',
        subCategory: '',
    });

    const [errors, setErrors] = useState({});
 
  
    const validateForm = (formData) => {
      let errors = {};
  
      if (!formData.categoryName.trim()) {
        errors.categoryName = 'Category Name is required';
      }
  
      if (!formData.subCategory.trim()) {
        errors.subCategory = 'Sub Category is required';
      }  
      return errors;
    };
  
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateForm(formData);
    console.log('validationErrors',validationErrors)
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    
      const formDataToSend = {
        category_name: formData.categoryName ? formData.categoryName : '',
        sub_category: formData.subCategory ? formData.subCategory : '',
        category_id: null,
    };
      let url = "/api/create_category";
      if (id) {
        url = `/api/update-user/${id}`;
    }
    
    fetch(url, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json', 
      },
      body: JSON.stringify(formDataToSend),
  })
  .then(response => response.json()) 
  .then(data => {
      Swal.fire({
          position: "center",
          icon: "success",
          title: data.message,
          showConfirmButton: false,
          timer: 1500
      });
      setTimeout(() => navigate('/category'), 1500);
  })
  .catch(error => {
      console.error('Error:', error);
      // Handle errors as needed
  });
  
    //   await axios.post(url, formDataToSend)
    //     .then(response => {
    //       Swal.fire({
    //         position: "center",
    //         icon: "success",
    //         title: response.data.message,
    //         showConfirmButton: false,
    //         timer: 1500
    //       });
    //       setTimeout(() => navigate('/category'), 1500);
    //     })
    //     .catch(error => {
    //       if (error.response) {
    //         console.log('Server responded with non-2xx status:', error.response.status);
    //         console.log('Response data:', error.response.data);
    //         console.log('Response headers:', error.response.headers);
    //         setErrors(error.response.data.errors);
  
    //       } else if (error.request) {
    //         console.log('No response received from the server');
    //       } else {
    //         console.error('Error:', error.message);
    //         // setErrors(error.message);
    //       }
    //     });
    };

   
  
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
      setErrors({ ...errors, [name]: '' });
    };
  
    useEffect(() => {
      const fetchUserDetails = async (id) => {
        if (id) {
          try {
            const response = await fetch(`/api/show-user/${id}`);
            if (!response.ok) {
              throw new Error('Failed to fetch user details');
            }
            const userData = await response.json();
            setFormData({
                categoryName: userData.categoryName ? userData.categoryName : '',
                subCategory: userData.subCategory ? userData.subCategory : '',
            });
        } catch (error) {
            console.error('Error fetching user details:', error);
          }
        }
      };
  
      fetchUserDetails(id);
    }, [id]);
    
  return (
    <AuthLayout title={id ? 'Edit Category' : "Add Category"}>
      <div className="content-outer">
        <Form className="profile-form">
          <div className="employee-outer d-flex">            
            <div className="employee-content">
              <Container>
                <Row>
                  <Col md={6}>
                    <Form.Group
                      className="mb-4">
                      <Form.Label>Category Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="categoryName"
                        placeholder="Category Name"
                        value={formData.categoryName}
                        onChange={(e) => { handleChange(e) }}
                      />
                      {errors.categoryName && <small className="text-danger">{errors.categoryName}</small>}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group
                      className="mb-4">
                      <Form.Label>Sub Category Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="subCategory"
                        value={formData.subCategory}
                        onChange={(e) => { handleChange(e) }}
                        placeholder="Sub Category Name"
                      />
                      {errors.subCategory && <small className="text-danger">{errors.subCategory}</small>}
                    </Form.Group>
                  </Col>      
                  <Col md={12}>
                    <div className="profile-btns">
                      <Button className="default-btn" onClick={handleSubmit}>{id ? "Update" : "Save"}</Button>
                      <Button className="default-btn cancel-btn">Cancel</Button>
                    </div>
                  </Col>
                </Row>
              </Container>

            </div>
          </div>
        </Form>
      </div>
    </AuthLayout>
  )
}
