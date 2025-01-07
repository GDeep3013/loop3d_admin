import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useLocation, useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';

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
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({
        password: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [loading2, setLoading2] = useState(true);
    const [tokenValid, setTokenValid] = useState(true);
    const [errorMessage, setErrorMessage] = useState(''); // State for error message

    // Check token validity on page load
    useEffect(() => {
        const verifyToken = async () => {
            if (token) {
                try {

                    const response = await fetch(`/api/create-password`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            token: token,
                        }),
                    });
                    const data = await response.json();
                    console.log('data', data)
                    if (data.error) {
                        setTokenValid(false);
                    } else {
                        setTokenValid(true);
                    }
                    setLoading2(false)
                } catch (error) {
                    setTokenValid(false);
                }
            }
        };
    
        if (token) {
            verifyToken();
        }
    }, [token]);

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
        if (isValid && tokenValid) {
            setLoading(true);

            try {
                const response = await fetch(`/api/create-password`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        token: token,
                        newPassword: formData.password,
                    })
                });
                const data = await response.json();
                if (data.status) {
                    setTimeout(() => navigate('/login'), 2000);
                } else {
                    setErrorMessage(data.message || "Error occurred");
                }
            } catch (error) {
                setErrorMessage('Error during password reset');
            } finally {
                setLoading(false);
            }
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prevState => !prevState);
    };

    if (!tokenValid && !loading2) {
        return (
            <div className="loginOuter error-outer">
                <Container fluid className="text-center error-inner">
                    <h2 className="errorHeading">Like is invalid or expired</h2>
                    <p className="errorMessage">
                        It seems like the link you used to set your password has expired or is no longer valid.
                    </p>
                </Container>
            </div>
        );
    }

    return (
        <>
            {!loading2 ? (
                <div className="loginOuter">
                    <Container fluid>
                        <Row className="gx-0">
                            <Col className='login-hide-mobile' md={6}>
                                <div className="loginContent">
                                    <img
                                        src={"/images/logoheader.svg"}
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
    
                                        {/* Error message container */}
                                        {errorMessage && (
                                            <div className="errorContainer" style={{ textAlign: 'center', color: 'red', marginBottom: '20px' }}>
                                                <p>{errorMessage}</p>
                                            </div>
                                        )}
    
                                        <Form className="formOuter mt-4">
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
                                                        type={"password"}
                                                        name="confirmPassword"
                                                        placeholder="Confirm Password"
                                                        autoComplete="true"
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                    {errors.confirmPassword && <small className="text-danger">{errors.confirmPassword}</small>}
                                                </div>
                                            </Form.Group>
    
                                            <Form.Group className="mb-3">
                                                <Button
                                                    type="submit"
                                                    onClick={handleSubmit}
                                                    className="default-btn w-100"
                                                    disabled={loading}>
                                                    {loading ? (
                                                        <span>
                                                            <i className="fa fa-spinner fa-spin"></i> Please wait...
                                                        </span>
                                                    ) : (
                                                        "Confirm Password"
                                                    )}
                                                </Button>
                                            </Form.Group>
                                        </Form>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>
            ) : (
                    <div className="loadingContainer">
                        <div className='loader-outer'>
                        <Loading/>
                        </div>
                    
                </div>
            )}
        </>
    );
    
}
