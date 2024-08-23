import React from 'react'
import { Row, Col, Form, Dropdown, Container, InputGroup, DropdownButton } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { SearchIcon } from "../components/svg-icons/icons";
import ProfileImage from '../assets/images/user.png';

export default function SideBar() {
  return (
    <div className='top-header'>
      <Container>
        <Row>
          <Col md={4} xl={4}>
            <InputGroup>
              <InputGroup.Text id="searchBox">
                <SearchIcon />
              </InputGroup.Text>
              <Form.Control aria-label="searchBox" aria-describedby="searchBox"
              />
            </InputGroup>
          </Col>
          <Col md={6} xl={6}>
            <div className='filterBox'>
              <div className='d-flex'>
                <span>Filter by:</span>
                <DropdownButton id="dropdown-basic-button" title="Latest Projects">
                  <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                  <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                  <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                </DropdownButton>
                <button type='button'> Copy</button>
              </div>
            </div>
          </Col>
          <Col md={2} xl={2} className='text-end'>
            <div className="headerSearch">
              <Dropdown>
                <Dropdown.Toggle id="dropdown-basic">
                  <div className="Profile d-flex">
                    <div className="profileImg">
                      <img src={ProfileImage} alt="User Image" />
                    </div>
                    <div className="profileName">
                      <h3>Lorem ipsum</h3>
                      <p>Super Admin</p>
                    </div>
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <NavLink to="#" className="dropdown-item" onClick={() => {
                    localStorage.removeItem("userData");
                    localStorage.removeItem("userType");
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
