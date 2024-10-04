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
      <Col md={6} className='col-7'>
      <h1>{title}</h1>
        <p>Home / {subTitle ? subTitle : title}</p>
      </Col>
      <Col md={6} className='col-5'>
      <div className="headerSearch text-end">
        <Dropdown>
          <Dropdown.Toggle id="dropdown-basic">
            <div className="Profile d-flex">
              <div className="profileImg">
                <img src='/images/profile-img.png' alt="User Image" />
              </div>
              <div className="profileName">
                      <h3>{user.first_name !==null?user.first_name:''}   {user.last_name !==null?user.last_name:''}</h3>
                      <p className='text-capitalize'>{user?.role =="looped_lead"?"loop lead":user?.role}</p>
              </div>
            </div>
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {/* <NavLink to="/" className="dropdown-item">Catogery</NavLink>
            <NavLink to="/" className="dropdown-item">Technology</NavLink> */}
                  <NavLink to="#" className="dropdown-item" onClick={() => {
                      localStorage.removeItem("_token"); 
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
