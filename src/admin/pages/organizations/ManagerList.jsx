
import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { StatusIcon, MoreIcon,PLusIcon,View ,Edit } from "../../../components/svg-icons/icons";
import { Container, Dropdown, Row, Col } from 'react-bootstrap'
import { Link } from "react-router-dom";
import { fetchLoopLeads } from '../../../apis/UserApi';

export default function ManagerList({ organization }) {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    useEffect(() => {

        if (organization.orgniation_id) {
            (async () => {
                try {
                    let data = await fetchLoopLeads(organization.orgniation_id, searchTerm, "manager");
                    if (Array.isArray(data.users) && data.users.length > 0) {
                        setUsers(data.users);
                    } else {
                        setUsers([]);

                    }
                } catch (error) {
                    console.error("Error fetching loop leads:", error);
                }
            })();
        }
    }, [organization.orgniation_id,searchTerm]);


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
                                </Col>
                                <Col md={6} className='text-end'>
                                    <form className='d-flex justify-content-end'>
                                        <input type='search' placeholder='Search...' value={searchTerm} onChange={handleSearch} className='form-control' />
                                        <Link to={`/add-user?org_id=${organization.orgniation_id}`} className='default-btn' >Add Supervisor<PLusIcon /> </Link>

                                    </form>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                </div>
            </div>
            <div className='table-scroll table-pd'>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email address</th>
                            {/* <th>Role</th> */}
                            <th>Status <StatusIcon /> </th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center' }}>
                                    <h4>No Supervisors Found</h4>
                                </td>
                            </tr>
                        ) : (
                            users.map(user => (
                                <tr key={user._id} className='table-list-hover'>
                                    <td onClick={() => navigate(`/view-loop_lead/${user._id}/${organization.orgniation_id}`)}>
                                        <div className="user-profile d-flex align-items-center">
                                            <div className='user-name'>{user?.first_name}</div>
                                        </div>
                                    </td>
                                    <td onClick={() => navigate(`/view-loop_lead/${user._id}/${organization.orgniation_id}`)}>
                                        <div className="user-profile d-flex align-items-center">
                                            <div className='user-name'>{user?.last_name}</div>
                                        </div>
                                    </td>
                                    <td className='text-lowercase' onClick={() => navigate(`/view-loop_lead/${user._id}/${organization.orgniation_id}`)}>{user.email}</td>
                                    {/* <td>{user.role.type}</td> */}
                                    <td onClick={() => navigate(`/view-loop_lead/${user._id}/${organization.orgniation_id}`)}><span className='span-badge active-tag'>Active</span></td>
                                    <td>
                                        {/* <button className='action-btn' onClick={() => navigate(`/view-loop_lead/${user._id}/${organization.orgniation_id}`)}><View /></button> */}
                                        <button className='action-btn' onClick={() => navigate(`/add-user/${user._id}`)}><Edit /></button>
                                        {/* <Dropdown className='custom-dropdown'>
                                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                                            <MoreIcon />
                                        </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => navigate(`/view-loop_lead/${user._id}/${organization.orgniation_id}`)}>View</Dropdown.Item>

                                            <Dropdown.Item onClick={() => navigate(`/add-user/${user._id}`)}>Edit</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown> */}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </>
    )
}