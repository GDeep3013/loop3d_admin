import React, { useState } from 'react'
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'
export default function ForgetPassword() {
    const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });


  const validateForm = () => {
    const { email} = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errors = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Invalid email format';
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value} = e.target;
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
        const response = await fetch(`/api/forget_password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email,
          })
        });
        const data = await response.json();        
          if (data.status) {                 
            Swal.fire({
                position: "center",
                icon: "success",
                title: data.message,
                showConfirmButton: false,
                timer: 1500
            });
            setTimeout(() => navigate('/login'), 4000);
          } else {
            if (data.error.response) {
              Swal.fire({
                position: "center",
                icon: "error", // Change the icon to "error"
                title: "Error", // Customize the title for the error
                text: data.error.response || "Something went wrong!", // Optional text for additional information
                showConfirmButton: true, // Show a confirm button for the user to acknowledge
                confirmButtonText: "OK", // Text for the confirm button
                timer: 3000 // Optional: Adjust timer if you want it to auto-close
            });
            } else {
              
              document.getElementById('emailError').innerText = data.error;
            }
        }
      } catch (error) {
        console.error('Login error:', error);
      }


    }
  };



  return (
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
                <h2 className="h2-style">Forget Password</h2>
                <p className="p-style">
                Enter your email and we'll send you a link to reset your password
                </p>
               <Form className="formOuter mt-4" >
                  <Form.Group className="mb-3">
                    <div className="relativeBox">
                      <img
                        src={"/images/email.svg"}
                        width={"18"}
                        height={"14"}
                        alt="email icon"
                        className="iconImg"
                      />
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    {errors.email && <small className="text-danger">{errors.email}</small>}
                    {!errors.email && <small id="emailError" className="text-danger"></small>}

                  </Form.Group>
          
                  <Form.Group className="mb-3">
                    <Button
                      type="submit"
                      onClick={handleSubmit}
                      className="default-btn w-100">
                     Reset Password
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
