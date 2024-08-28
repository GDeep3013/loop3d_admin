import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { StatusIcon, MoreIcon } from "../../components/svg-icons/icons";
import { Container, Dropdown, Row, Col } from 'react-bootstrap'
import { Link } from "react-router-dom";

export default function LoopLeads({ organization }) {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if(organization._id){
            let users = fetchLoopLeads(organization._id);
            if (Array.isArray(users) && users.length > 0) {
                 setUsers(users);
            }
        }
    }, [searchTerm]);


    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };
   
    return (<>
        <div className='table-inner'>
            <div className='content-outer'>
                <div className='tabe-outer'>
                    <div className='table-heading'>
                        <Container>
                            <Row>
                                <Col md={6}>
                                    <h4>{organization?.name}</h4>
                                </Col>
                                <Col md={6} className='text-end'>
                                    <form className='d-flex justify-content-end'>
                                        <input type='search' placeholder='Search...' value={searchTerm} onChange={handleSearch} className='form-control' />
                                    </form>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                </div>
            </div>
            <table className='table'>
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email address</th>
                        <th>Role</th>
                        <th>Status <StatusIcon /> </th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center' }}>
                                <h4>No Loop3D Lead Found</h4>
                            </td>
                        </tr>
                    ) : (
                            users.map(user => (
                            <tr key={user._id}>
                                <td>
                                    <div className="user-profile d-flex align-items-center">
                                        <div className='user-name'>{user.first_name}</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="user-profile d-flex align-items-center">
                                        <div className='user-name'>{user.last_name}</div>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>{user.role.type}</td>
                                <td><span className='span-badge active-tag'>Active</span></td>
                                <td>
                                    <Dropdown className='custom-dropdown'>
                                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                                            <MoreIcon />
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => navigate(`/add-user/${user._id}`)}>Edit</Dropdown.Item>
                                            <Dropdown.Item onClick={() => handleDelete(user._id)}>Delete</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

        </div>
    </>
    )
}
