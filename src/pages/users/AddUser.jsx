import React, { useState, useEffect } from "react";
import AuthLayout from "../../layout/Auth";
import { Col, Row, Container, Form, Button } from "react-bootstrap";
import {  useParams, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2'
import axios from "axios"

import { fetchOrgnizations } from "../../apis/OrgnizationApi";

export default function AddEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: '',
    _method: '',
    organization_id: '',
    created_by: null
  });
  const [errors, setErrors] = useState({});

  const [organizations, setOrganizations] = useState([]);

  const isValidEmail = (email) => {
    // Simple email validation regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  useEffect(() => {
    fetchOrgnizations().then((res) => {
      setOrganizations(res.data);
    });
  },[]);

  const isValidPhoneNumber = (phone) => {
    // Simple phone number validation regex
    return /^\+?[1-9]\d{1,14}$/.test(phone);
  };

  const validateForm = (formData) => {
    let errors = {};

    if (!formData.first_name.trim()) {
      errors.name = 'First name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Invalid email address';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!isValidPhoneNumber(formData.phone)) {
      errors.phone = 'Invalid phone number';
    }

    if (!id) {
      if (!formData.password.trim()) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters long';
      }

      if (!formData.confirmPassword.trim()) {
        errors.confirmPassword = 'Confirm password is required';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }   

    if (!formData.userType.trim()) {
      errors.userType = 'User type is required';
    }
    // if (file === '' && !previewImage) {
    //   errors.image = 'User image is required';
    // }
    console.log(errors)
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    // const formDataToSend = new FormData();
    // formDataToSend.append('first_name', formData.first_name ? formData.first_name : '');
    // formDataToSend.append('last_name', formData.last_name ? formData.last_name : '');
    // formDataToSend.append('email', formData.email ? formData.email : '');
    // formDataToSend.append('phone', formData.phone ? formData.phone : '');
    // formDataToSend.append('password', formData.password ? formData.password : '');
    // formDataToSend.append('confirmPassword', formData.confirmPassword ? formData.confirmPassword : '');
    // formDataToSend.append('userType', formData.userType ? formData.userType : '');
    // formDataToSend.append('organization_id', formData.organization_id ? formData.organization_id : null);

    let url = "/api/register";
    if (id) {
      url = `/api/update-user/${id}`;
    }

    await axios.post(url, formData,{
      headers: { 
        'x-api-key': import.meta.env.VITE_X_API_KEY,
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        Swal.fire({
          position: "center",
          icon: "success",
          title: response.data.message,
          showConfirmButton: false,
          timer: 1500
        });
        setTimeout(() => navigate('/users'), 1500);
      })
      .catch(error => {
        if (error.response) {
          setErrors(error.response.data.errors);
        } else if (error.request) {
          console.log('No response received from the server');
        } else {
          console.error('Error:', error.message);
          // setErrors(error.message);
        }
      });
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/get-role');
      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }
      const data = await response.json();
      const fetchedOptions = data.roles.map(role => ({
        value: role._id,
        label: role.type
      }));
      setRoles(fetchedOptions);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  console.log(formData);

  useEffect(() => {
    if (id) {
      const fetchUserDetails = async (id) => {
          try {
            const response = await fetch(`/api/show-user/${id}`);
            if (!response.ok) {
              throw new Error('Failed to fetch user details');
            }
            const userData = await response.json();
            setFormData({
              first_name: userData.first_name ? userData.first_name : '',
              last_name: userData.last_name ? userData.last_name : '',
              email: userData.email ? userData.email : '',
              phone: userData.phone ? userData.phone : '',
              designation: userData.designation ? userData.designation : '',
              userType: userData.role?._id ? userData.role?._id : '',
              organization_id: userData.organization_id ? userData.organization_id : '',
              _method: 'PUT',
            });
          } catch (error) {
            console.error('Error fetching user details:', error);
          }
      };
      fetchUserDetails(id);
    }

  }, [id]);

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <AuthLayout title={id ? 'Edit User' : "Add User"}>
      <div className="content-outer main-wrapper pd-2 bg-white">
      <div class="tabe-outer">
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
</div>   
        <Form className="profile-form">
          <div className="employee-outer d-flex">

            <div className="employee-content">

              <Container>
                <Row>
                  <Col md={4}>
                    <Form.Group
                      className="mb-4">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="first_name"
                        placeholder="First Name"
                        value={formData.first_name}
                        onChange={(e) => { handleChange(e) }}
                      />
                      {errors.first_name && <small className="text-danger">{errors.first_name}</small>}
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group
                      className="mb-4">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="last_name"
                        placeholder="Last Name"
                        value={formData.last_name}
                        onChange={(e) => { handleChange(e) }}
                      />
                      {errors.last_name && <small className="text-danger">{errors.last_name}</small>}
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group
                      className="mb-4">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={(e) => { handleChange(e) }}
                        placeholder="hello@gmail.com"
                      />
                      {errors.email && <small className="text-danger">{errors.email}</small>}
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group
                      className="mb-4">
                      <Form.Label>Phone number</Form.Label>
                      <Form.Control
                        type="number"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => { handleChange(e) }}
                        placeholder="+1234567890"
                      />
                      {errors.phone && <small className="text-danger">{errors.phone}</small>}
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group
                      className="mb-4">
                      <Form.Label>User Type</Form.Label>
                      <Form.Select aria-label="Default select example" name="userType" value={formData.userType} onChange={handleChange}>
                        <option>Open this select menu</option>
                        {roles.map(option => (
                          <option key={option.value} value={option.value} style={{ textTransform: "capitalize" }}>
                            {option.label.replace(/_/g, " ")}
                          </option>
                        ))}

                      </Form.Select>
                      {errors.userType && <small className="text-danger">{errors.userType}</small>}

                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-4">
                      <Form.Label>Organization</Form.Label>
                      <Form.Select
                        name="organization_id"
                        value={formData.organization_id}
                        onChange={handleChange}
                      >
                        <option value="">Select Organization (optional)</option>
                        {organizations.length > 0 && organizations.map((org) => (
                          <option key={org._id} value={org._id}>
                            {org.name}
                          </option>
                        ))}
                      </Form.Select>
                      {errors.organization_id && <small className="text-danger">{errors.organization_id}</small>}
                    </Form.Group>
                  </Col>
                  {/* <Col md={6}>
                    <Form.Group
                      className="mb-4">
                      <Form.Label>Designation</Form.Label>
                      <Form.Control
                        name="designation"
                        type="text"
                        value={formData.designation}
                        onChange={(e) => { handleChange(e) }}
                        placeholder="Designation"
                      />
                      {errors.designation && <small className="text-danger">{errors.designation}</small>}

                    </Form.Group>
                  </Col> */}
                  {!id && (
                    <>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label>Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={(e) => { handleChange(e) }}
                            placeholder="Password"
                          />
                          {errors.password && <small className="text-danger">{errors.password}</small>}
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label>Confirm Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={(e) => { handleChange(e) }}
                            placeholder="Confirm Password"
                          />
                          {errors.confirmPassword && <small className="text-danger">{errors.confirmPassword}</small>}
                        </Form.Group>
                      </Col>
                    </>
                  )}
                  {/* <Col md={6}>
                    <Form.Group
                      className="mb-4">
                      <Form.Label>Skills</Form.Label>
                      <div className="skills-outer">
                        <Select
                          name="skills"
                          options={options}
                          isMulti
                          value={skills.map(skill => ({ value: skill, label: skill }))}
                          onChange={handleSelectChange}
                          className="basic-multi-select"
                          classNamePrefix="select"
                        />

                        {errors.skills && <small className="text-danger">{errors.skills}</small>}

                      </div>
                    </Form.Group>
                  </Col> */}
                

                  <Col md={12}>
                    <div className="profile-btns pt-0">
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
  );
}
