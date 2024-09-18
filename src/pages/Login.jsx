import React,{useState} from 'react'
import { Link ,useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, InputGroup, } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { setTokenValidity, userType, createUser } from "../../store/slices/UserSlice";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });


  const validateForm = () => {
    const { email, password } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errors = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Invalid email format';
    }

    if (!password.trim()) {
      errors.password = 'Password is required';
      } else if (password.length < 8) {
        errors.password = 'Password must be at least 8 characters long';
      }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };


  const handleSubmit =async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid) {
      try {
        const response = await fetch(`/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: formData.email,
                password: formData.password
            })
        });
        const data = await response.json();
        //
          if (data.status === 'success') {
    
            const { token, user: { email, role ,image,name} } = data;

            localStorage.setItem('_token', token);

            dispatch(userType({ userType: role }));

            dispatch(createUser({ user: data.user }));
          
            // role === 'admin' ? navigate("/organizations") : navigate("/users");
            
            // if (role === "admin") {
            //   navigate('/organizations');
            // } else if (role === "manager") {
            //   navigate('/manager/dashboard');
      
            // }
            // else if (role === "looped_lead") {
            //   navigate('/loop-lead/dashboard');
      
            // }
            window.location.reload();

          } else {
            document.getElementById('passwordError').innerText = data.error;
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
              src={"/images/logoheader.svg"}
              alt="Logo"
              className="logoImg"
            />
            <div className="logincircle verticalCenter"></div>
            <div className="verticalCenter">
              <h2 className="h2-style">
                  Revolutionize Your <br />
                  360 Feedback Process with AI.
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
              <h2 className="h2-style">Sign In to your Account</h2>
              <p className="p-style">
                Welcome back! please enter your detail
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
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      autoComplete="true"
                      onChange={handleInputChange}
                      required
                      />
                     
                    <img
                      src={showPassword ?"/images/eye-open.svg":"/images/eye.svg"}
                      width={"20"}
                      height={"18"}
                      alt="email icon"
                      className="iconEye"
                      onClick={togglePasswordVisibility}
                     style={{ cursor: 'pointer' }}
                    />
                  </div>
                    {errors.password && <small className="text-danger">{errors.password}</small>}
                    {!errors.password && <small id="passwordError" className="text-danger"></small>}
                </Form.Group>
                <Form.Group className="mb-4">
                  <label className="checkbox">
                    <InputGroup.Checkbox
                        name="rememberMe"
                        onChange={handleInputChange}

                    />
                    Remember me
                  </label>
                  <Link
                    to="/forget-password"
                    className="fw-bold text-decoration-none float-right fs-7 text-dark">
                    Forgot Password?
                  </Link>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Button
                       type="submit"
                       onClick={handleSubmit}
                      className="default-btn w-100">
                    Sign In
                  </Button>
                </Form.Group>
                {/* <Form.Group className="mt-4 createAccount">
                  <p className="text-center p-style">
                    Don’t have an account?{" "}
                    <Link
                      to={"/signUp"}
                      className="fw-bold text-decoration-none text-dark">
                      Sign Up{" "}
                    </Link>
                  </p>
                </Form.Group> */}
              </Form>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
    </div>
  )
}
