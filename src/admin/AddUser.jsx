import React, { useState, useEffect } from "react";

import AuthLayout from "../layout/Auth";
import { Col, Row, Container, Form, Button } from "react-bootstrap";
import {  useParams, useNavigate } from "react-router-dom";
import { EditIcon } from "../components/svg-icons/icons"
import Swal from 'sweetalert2'
import axios from "axios"
export default function AddEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    password: '',
    confirmPassword: '',
    skills: '',
    userType: '',
    _method: '',
    // image: null
  });
  const [skills, setSkills] = useState([]);
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState("");

  const [previewImage, setPreviewImage] = useState(null);
  const isValidEmail = (email) => {
    // Simple email validation regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhoneNumber = (phone) => {
    // Simple phone number validation regex
    return /^\+?[1-9]\d{1,14}$/.test(phone);
  };

  const validateForm = (formData) => {
    let errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
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
    if (file === '' && !previewImage) {
      errors.image = 'User image is required';
    }
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
    const formDataWithSkills = { ...formData, skills, file };
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name ? formData.name : '');
    formDataToSend.append('email', formData.email ? formData.email : '');
    formDataToSend.append('phone', formData.phone ? formData.phone : '');
    formDataToSend.append('designation', formData.designation ? formData.designation : '');
    formDataToSend.append('password', formData.password ? formData.password : '');
    formDataToSend.append('confirmPassword', formData.confirmPassword ? formData.confirmPassword : '');
    formDataToSend.append('skills', skills ? skills : '');
    formDataToSend.append('userType', formData.userType ? formData.userType : '');
    formDataToSend.append('files', file ? file : '');
    let url = "/api/register";
    if (id) {
      url = `/api/update-user/${id}`;
    }

    await axios.post(url, formDataToSend)
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
          console.log('Server responded with non-2xx status:', error.response.status);
          console.log('Response data:', error.response.data);
          console.log('Response headers:', error.response.headers);
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
            name: userData.username ? userData.username : '',
            email: userData.email ? userData.email : '',
            phone: userData.phone ? userData.phone : '',
            designation: userData.designation ? userData.designation : '',
            userType: userData.role ? userData.role : '',
            _method: 'PUT',
          });
          setPreviewImage(userData.image ? '/employee-pics/' + userData.image : '');
          setSkills(userData.skills);
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      }
    };

    fetchUserDetails(id);
  }, [id]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleFileChange = (e) => {
    let errors = {};
    const file = e.target.files[0];
    const allowedExtensions = ['png', 'jpg', 'jpeg'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    if (!file) {
      return; // No file selected
    }

    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      Swal.fire({
        position: 'top-center',
        icon: 'warning',
        title: 'Only PNG, JPG, or JPEG files are allowed.',
        // showConfirmButton: true,
        confirmButtonColor: "#000",
        timer: 1500
      });
      return;
    }

    if (file.size > maxFileSize) {
      Swal.fire({
        position: 'top-center',
        icon: 'warning',
        title: 'File size exceeds the maximum limit of 5MB.',
        confirmButtonColor: "#000",
        timer: 1500
      });
      return;
    }
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
    setFile(file);
  };

  return (
    <AuthLayout title={id ? 'Edit User' : "Add User"}>
      <div className="content-outer">
        <Form className="profile-form">
          <div className="employee-outer d-flex">
            <div className="employee-profile">

              <div className="profile-inner">
                <div className="employee-profile-img">
                  <input
                    id={`file-input`}
                    type="file"
                    name="profile-image"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <label htmlFor={`file-input`}>
                    {previewImage ? (
                      <img src={previewImage} alt="user image" style={{ width: '100%', height: 'auto' }} />
                    ) : (
                      <img src="/images/no-image.png" alt="user image" style={{ width: '100%', height: 'auto' }} />
                    )}
                    <span className="edit-image"><EditIcon /></span>
                  </label>
                </div>
                <div className="employee-profile-name">
                  <h3>{id ? formData.name : "Add Image"}</h3>
                </div>
                {errors.image && <small className="text-danger">{errors.image}</small>}
              </div>

            </div>
            <div className="employee-content">


              <Container>
                <Row>
                  <Col md={6}>
                    <Form.Group
                      className="mb-4">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        placeholder="Danny Gurety"
                        value={formData.name}
                        onChange={(e) => { handleChange(e) }}
                      />
                      {errors.name && <small className="text-danger">{errors.name}</small>}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
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
                  <Col md={6}>
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
                  <Col md={6}>
                    <Form.Group
                      className="mb-4">
                      <Form.Label>User Type</Form.Label>
                      <Form.Select aria-label="Default select example" name="userType" value={formData.userType} onChange={handleChange}>
                        <option>Open this select menu</option>
                        {roles.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}

                      </Form.Select>
                      {errors.userType && <small className="text-danger">{errors.userType}</small>}

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
  );
}
