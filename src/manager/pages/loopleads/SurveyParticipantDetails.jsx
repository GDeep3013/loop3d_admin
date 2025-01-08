import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { getSurveyParticipantsById } from '../../../apis/SurveyApi';
import { useParams, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2'
import { Remove } from '../../../components/svg-icons/icons';
import AuthLayout from "../../../layout/Auth";
import { Link } from "react-router-dom";

export default function SurveyParticipantDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [surveyParticipant, setSurveyParticipant] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const getParticipants = async () => {
        try {
            let data = await getSurveyParticipantsById(id, searchTerm);
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
                if (response.ok) {
                    await Swal.fire({
                        title: "Deleted!",
                        text: "Your participant has been deleted.",
                        icon: "success",
                        confirmButtonColor: "#000",
                    });
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
                                            <input type='search' placeholder='Search...' value={searchTerm} onChange={handleSearch} className='form-control' />
                                        </form>
                                        <Link to={`/survey-summary/${id}`} className='default-btn' >View Summary</Link>

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
                                <th>Participant ID</th>
                                <th>Survey Status</th>
                                <th>Remove Participant</th>
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
                                <><tr key={survey?.loop_lead?._id} className='table-list-design'>
                                    <td>1</td>
                                    <td>{survey?.loop_lead?.first_name}</td>
                                    <td>{survey?.loop_lead?.last_name}</td>
                                    <td className='text-lowercase'>{survey?.loop_lead?.email}</td>
                                    <td>Self</td>
                                    <td >{survey?.loop_lead?._id}</td>
                                    <td>{survey?.ll_survey_status === 'yes' ? <span className='span-badge active-tag'>Completed</span> : <span className='span-badge inactive-tag'>Pending</span>}</td>
                                    <td>
                                        <button className='action-btn' disabled={true} onClick={() => handleDelete(survey?.loop_lead?._id._id)}><Remove /></button>

                                    </td>
                                </tr>
                                    <tr key={survey?.manager?._id} className='table-list-design'>
                                        <td>2</td>
                                        <td>{survey?.manager?.first_name}</td>
                                        <td>{survey?.manager?.last_name}</td>
                                        <td className='text-lowercase'>{survey?.manager?.email}</td>
                                        <td>Supervisor </td>
                                        <td >{survey?.manager?._id}</td>
                                        <td>{survey?.mgr_survey_status === 'yes' ? <span className='span-badge active-tag'>Completed</span> : <span className='span-badge inactive-tag'>Pending</span>}</td>
                                        <td>
                                            <button className='action-btn' disabled={true} onClick={() => handleDelete(survey?.manager?._id._id)}><Remove /></button>

                                        </td>
                                    </tr>

                                    {surveyParticipant.map((participant, index) => (
                                        <tr key={participant._id} className='table-list-design'>
                                            <td>{index + 3}</td>
                                            <td>{participant?.p_first_name}</td>
                                            <td>{participant?.p_last_name}</td>
                                            <td className='text-lowercase'>{participant?.p_email}</td>
                                            <td>{participant?.p_type}</td>
                                            <td >{participant?._id}</td>
                                            <td>{participant.survey_status === 'completed' ? <span className='span-badge active-tag'>Completed</span> : <span className='span-badge inactive-tag'>Pending</span>}</td>
                                            <td>
                                                <button className='action-btn' disabled={participant.survey_status === 'completed'} onClick={() => handleDelete(participant._id)}><Remove /></button>
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
                                    ))}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </AuthLayout>
    );
}
