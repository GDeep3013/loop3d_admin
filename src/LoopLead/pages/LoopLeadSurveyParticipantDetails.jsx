import React, { useState, useEffect } from 'react';
import { Container, Dropdown, Row, Col, Button } from 'react-bootstrap';
import { getSurveyParticipantsById } from '../../apis/SurveyApi';
import { useParams, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2'
import { Remove } from '../../components/svg-icons/icons';
import { MoreIcon,View ,PLusIcon  } from "../../components/svg-icons/icons";

import AuthLayout from "../../layout/Auth";
import { Link } from "react-router-dom";

export default function LoopLeadSurveyParticipantDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [surveyParticipant, setSurveyParticipant] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const getParticipants = async () => {
        try {
            let data = await getSurveyParticipantsById(id, searchTerm);
            // console.log('data', data);
            if (Array.isArray(data) && data.length > 0) {
                setSurveyParticipant(data);
            } else {
                setSurveyParticipant([]);

            }
        } catch (error) {
            console.error("Error fetching surveys:", error);
        }

    }

    useEffect(() => {
        if (id) {
            getParticipants()
        }
    }, [id, searchTerm]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };
    const handleDelete = async (id) => {
        try {
            const confirmResult = await Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#000",
                cancelButtonColor: "#d26c6c",
                confirmButtonText: "Yes, delete it!"
            });

            if (confirmResult.isConfirmed) {
                const response = await fetch(`/api/surveys/participants/${id}`, {
                    method: 'DELETE',
                    headers: { "x-api-key": import.meta.env.VITE_X_API_KEY }
                });
                console.log(response, 'response');
                if (response.ok) {
                    await Swal.fire({
                        title: "Deleted!",
                        text: "Your file has been deleted.",
                        icon: "success",
                        confirmButtonColor: "#000",
                    });
                    // alert(response.message);
                    getParticipants()
                } else {
                    console.error('Failed to delete user');
                }
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    return (
        <AuthLayout title={"Survey participant details"}>
               <div className="main-back-heading mb-0">
      <div className="container">
         <div className="row">
            <div className="col-md-6 p-0">
            <div className="profile-btns pt-0">
                <Button className="default-btn cancel-btn ml-0" onClick={() => navigate(-1)}>
                    Back
                </Button>
            </div>                  
            </div>
         </div>
      </div>
   </div>
            <div className='table-inner main-wrapper pd-2 bg-white shadow-border-wrapper ml-8'>
         
                <div className='content-outer'>

                    <div className='tabe-outer'>

                        <div className='table-heading'>
                            <Container>
                                <Row>
                                    <Col md={6} className='text-end'>
                                    </Col>
                                    <Col md={6} className='text-end pt-3'>
                                        <form className='d-flex justify-content-end'>
                                            <input
                                                type='search'
                                                placeholder='Search...'
                                                value={searchTerm}
                                                onChange={handleSearch}
                                                className='form-control'
                                            />
                                            <Link to={`/loop-lead/participant/create/${id}`} className='default-btn' >Add Particpant <PLusIcon /> </Link>
                                            <Link to={`/survey-summary/${id}`} className='default-btn' >View Summary</Link>

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
                            <th>#</th>
                            <th>Participant First </th>
                            <th>Participant Last </th>
                            <th>Participant Email</th>
                            <th>Participant Relationship</th>
                            <th>Survey Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {surveyParticipant.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center' }}>
                                    <h4>No survey participant found</h4>
                                </td>
                            </tr>
                        ) : (
                            surveyParticipant.map((participant, index) => (
                                <tr key={participant._id}>
                                    <td>{index + 1}</td>
                                    <td>{participant?.p_first_name}</td>
                                    <td>{participant?.p_last_name}</td>
                                    <td>{participant?.p_email}</td>
                                    <td>{participant?.survey_id?.loop_lead?.first_name} {participant?.survey_id?.loop_lead?.last_name}</td>
                                    <td>{participant.survey_status === 'completed' ? <span className='span-badge active-tag'>Completed</span> : <span className='span-badge inactive-tag'>Pending</span>}</td>
                                    <td>
                                    <button className='action-btn' onClick={() => handleDelete(participant._id)}><Remove /></button>
                                        {/* <Dropdown className='custom-dropdown'>
                                            <Dropdown.Toggle variant="success" id="dropdown-basic">
                                                <MoreIcon />
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => handleDelete(participant._id)}>Delete</Dropdown.Item>
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
        </AuthLayout>
    );
}