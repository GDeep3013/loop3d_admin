import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { StatusIcon, MoreIcon,View ,Edit } from "../../../components/svg-icons/icons";
import { Container, Dropdown, Row, Col } from 'react-bootstrap'
import { Link } from "react-router-dom";
import { fetchLoopLeads } from '../../../apis/UserApi';
import { useSelector } from 'react-redux';
import AuthLayout from '../../../layout/Auth';
export default function LoopLeads({  }) {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    let mgr_id = user?._id
    useEffect(() => {
 
        if (mgr_id) {
            (async () => {
                try {
                    let data = await fetchLoopLeads(mgr_id, searchTerm,"looped_lead");
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
    }, [mgr_id,searchTerm]);


    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };
   
    return (<>
        <AuthLayout title={"Loop Leads"} >
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
            <div className='table-scroll shadow-border-wrapper'>
            <table className='table'>
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email address</th>
                        <th>Supervisor</th>
                        <th>Role</th>
                        <th>Status <StatusIcon /> </th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan="12" style={{ textAlign: 'center' }}>
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
                                    <td className='text-lowercase'>{user.email}</td>
                                    <td>{user.created_by?.first_name} {user.created_by?.last_name}</td>

                                    <td>{user?.role?.type =="looped_lead"?"loop lead":user?.role?.type}</td>
                                    <td><span className='span-badge active-tag'>Active</span></td>
                                    <td>
                                    <button className='action-btn' onClick={() => navigate(`/manager/view-loop_lead/${user._id}/${mgr_id}`)}><View /></button>
              
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            </div>
            </div>
            </AuthLayout>
    </>
    )
}