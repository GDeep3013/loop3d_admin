import React from 'react'
import { Row, Col, Form, Dropdown, Container, InputGroup, DropdownButton} from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";


export default function HeaderDashboard({title, subTitle}) {

  const user = useSelector((state) => state.auth.user);

  return (
    <div className='top-header'>
    <Container>
    <Row className='align-items-center dashboard-header'>
      <Col md={6}>
      <h1>{title}</h1>
        <p>Home / {subTitle ? subTitle : title}</p>
      </Col>
      <Col md={6}>
      <div className="headerSearch text-end">
        <Dropdown>
          <Dropdown.Toggle id="dropdown-basic">
            <div className="Profile d-flex">
              <div className="profileImg">
                <img src='/images/profile-img.png' alt="User Image" />
              </div>
              <div className="profileName">
                  <h3>{user.username}</h3>
                  <p>{user.role?.type}</p>
              </div>
            </div>
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {/* <NavLink to="/" className="dropdown-item">Catogery</NavLink>
            <NavLink to="/" className="dropdown-item">Technology</NavLink> */}
                  <NavLink to="#" className="dropdown-item" onClick={() => {
                      localStorage.removeItem("userData"); 
                      localStorage.removeItem("userType"); 
                      localStorage.removeItem("userImage"); 
                      localStorage.removeItem('userName'); 
                    navigate('/login');
                  }}>Logout</NavLink>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      </Col>
    </Row>
  </Container>

  </div>
  )
}
