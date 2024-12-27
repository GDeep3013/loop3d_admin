import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { StatusIcon, MoreIcon,View ,Edit } from "../../../components/svg-icons/icons";
import { Container, Dropdown, Row, Col } from 'react-bootstrap'
import { Link } from "react-router-dom";
import { fetchLoopLeads } from '../../../apis/UserApi';

export default function LoopLeads({ organization }) {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    useEffect(() => {

        if (organization.orgniation_id) {
            (async () => {
                try {
                    let data = await fetchLoopLeads(organization.orgniation_id, searchTerm, "looped_lead");
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
                        <th>Last Name</th>
                        <th>First Name</th>
                        <th>Email address</th>
                        <th>Supervisor</th>
                        <th>Supervisor Email</th>
                        <th>Total 360s</th>
                        {/* <th>Role</th> */}
                        {/* <th>Status <StatusIcon /> </th>
                        <th>Action</th> */}
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
                                <tr key={user._id} className='table-list-hover'>
                                      <td  onClick={() => navigate(`/view-loop_lead/${user._id}/${organization.orgniation_id}`)}>
                                    <div className="user-profile d-flex align-items-center">
                                        <div className='user-name'>{user?.last_name}</div>
                                    </div>
                                </td>
                                <td  onClick={() => navigate(`/view-loop_lead/${user._id}/${organization.orgniation_id}`)}>
                                    <div className="user-profile d-flex align-items-center">
                                        <div className='user-name'>{user?.first_name}</div>
                                    </div>
                                </td>
                             
                                    <td className='text-lowercase'  onClick={() => navigate(`/view-loop_lead/${user._id}/${organization.orgniation_id}`)}>{user.email}</td>
                                    <td  onClick={() => navigate(`/view-loop_lead/${user._id}/${organization.orgniation_id}`)}>{user.created_by?.first_name} {user.created_by?.last_name}</td>
                                    <td className='text-lowercase'  onClick={() => navigate(`/view-loop_lead/${user._id}/${organization.orgniation_id}`)}>{user.created_by?.email} </td>
                                    <td  onClick={() => navigate(`/view-loop_lead/${user._id}/${organization.orgniation_id}`)}>{user?.surveyCount} </td>

                                    {/* <td>{user?.role?.type =="looped_lead"?"loop lead":user?.role?.type}</td> */}
                                    {/* <td><span className='span-badge active-tag'>Active</span></td> */}
                                 
                                    {/* <button className='action-btn' onClick={() => navigate(`/view-loop_lead/${user._id}/${organization.orgniation_id}`)}><View /></button>
                                    <button className='action-btn' onClick={() => navigate(`/add-user/${user._id}`)}><Edit /></button> */}
                                    {/* <Dropdown className='custom-dropdown'>
                                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                                            <MoreIcon />
                                        </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => navigate(`/view-loop_lead/${user._id}/${organization.orgniation_id}`)}>View</Dropdown.Item>

                                            <Dropdown.Item onClick={() => navigate(`/add-user/${user._id}`)}>Edit</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown> */}
                                
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