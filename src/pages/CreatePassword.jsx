import React, { useState } from 'react'
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useLocation,useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'
const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

export default function CreatePassword() {
    const navigate = useNavigate();
    const query = useQuery();
    const token = query.get('token');

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword:''
    });

    const [errors, setErrors] = useState({
        password: '',
      confirmPassword:''
    });


    const validateForm = () => {
    
        const errors = {};

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

        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const isValid = validateForm();
        if (isValid) {
            try {
                const response = await fetch(`/api/create-password`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        token:token,
                        newPassword: formData.password,
                    })
                });
                const data = await response.json();
                //
                if (data.status) {
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: data.message,
                        showConfirmButton: false,
                        timer: 1500
                    });
                    setTimeout(() => navigate('/login'), 4000);
                }
            } catch (error) {
                console.error('Login error:', error);
            }


        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prevState => !prevState);
      };

    return (
        <div className="loginOuter">
            <Container fluid>
                <Row className="gx-0">
                    <Col className='login-hide-mobile' md={6}>
                        <div className="loginContent">
                            <img
                                src={"/images/logo.png"}
                                alt="Logo"
                                className="logoImg"
                            />
                            <div className="logincircle verticalCenter"></div>
                            <div className="verticalCenter">
                                <h2 className="h2-style">
                                    Discover our portfolio – a showcase of creativity, functionality, and successful collaborations.
                                </h2>
                                <p className="p-style">
                                    See how we bring visions to digital life.
                                </p>
                            </div>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="loginForm">
                            <div className="verticalCenter">
                                <div className='mobile-logo-login'>
                                    <img
                                        src={"/images/logoheader.svg"}
                                        alt="Logo"
                                        className="logoImg"
                                    />
                                </div>
                                <h2 className="h2-style">Set Password</h2>
                                <Form className="formOuter mt-4" >
                                    <Form.Group className="mb-3">
                                        <div className="relativeBox">
                                            <img
                                                src={"/images/lock.svg"}
                                                width={"14"}
                                                height={"18"}
                                                alt="email icon"
                                                className="iconImg"
                                            />
                                            <Form.Control
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                placeholder="Password"
                                                autoComplete="true"
                                                onChange={handleInputChange}
                                                required
                                            />
                                            {errors.password && <small className="text-danger">{errors.password}</small>}
                                            {!errors.password && <small id="passwordError" className="text-danger"></small>}
                                            <img
                                                src={showPassword ? "/images/eye-open.svg" : "/images/eye.svg"}
                                                width={"20"}
                                                height={"18"}
                                                alt="email icon"
                                                className="iconEye"
                                                onClick={togglePasswordVisibility}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </div>

                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <div className="relativeBox">
                                            <img
                                                src={"/images/lock.svg"}
                                                width={"14"}
                                                height={"18"}
                                                alt="email icon"
                                                className="iconImg"
                                            />
                                            <Form.Control
                                                type={ "password"}
                                                name="confirmPassword"
                                                placeholder="Confirm Password"
                                                autoComplete="true"
                                                onChange={handleInputChange}
                                                required
                                            />
                                            {errors.confirmPassword && <small className="text-danger">{errors.confirmPassword}</small>}
                                            {!errors.confirmPassword && <small id="passwordError" className="text-danger"></small>}
                                         
                                        </div>

                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Button
                                            type="submit"
                                            onClick={handleSubmit}
                                            className="default-btn w-100">
                                            Confirm Password
                                        </Button>
                                    </Form.Group>

                                </Form>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}
