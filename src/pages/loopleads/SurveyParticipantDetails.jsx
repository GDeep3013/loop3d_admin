import React, { useState, useEffect } from 'react';
import { MoreIcon } from "../../components/svg-icons/icons";
import { Container, Dropdown, Row, Col } from 'react-bootstrap';
import { getSurveyParticipantsById } from '../../apis/SurveyApi';
import { useParams, useNavigate } from "react-router-dom";

import AuthLayout from "../../layout/Auth";

export default function SurveyParticipantDetails() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [surveyParticipant, setSurveyParticipant] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (id) {
            (async () => {
                try {
                    let data = await getSurveyParticipantsById(id, searchTerm);
                    console.log('data', data);
                    if (Array.isArray(data) && data.length > 0) {
                        setSurveyParticipant(data);
                    }
                } catch (error) {
                    console.error("Error fetching surveys:", error);
                }
            })();
        }
    }, [id, searchTerm]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <AuthLayout title={"Survey participant details"}>
            <div className='table-inner'>
                <div className='content-outer'>
                    <div className='tabe-outer'>
                        <div className='table-heading'>
                            <Container>
                                <Row>
                                    <Col md={6} className='text-end'>
                                    </Col>
                                    <Col md={6} className='text-end'>
                                        <form className='d-flex justify-content-end'>
                                            <input
                                                type='search'
                                                placeholder='Search...'
                                                value={searchTerm}
                                                onChange={handleSearch}
                                                className='form-control'
                                            />
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
                                    <td>{participant?.p_mag_id?.first_name} {participant?.p_mag_id?.last_name}</td>
                                    <td>{participant.survey_status === 'completed' ? <span className='span-badge active-tag'>Completed</span> : <span className='span-badge inactive-tag'>Pending</span>}</td>                                    
                                    <td>
                                        <Dropdown className='custom-dropdown'>
                                            <Dropdown.Toggle variant="success" id="dropdown-basic">
                                                <MoreIcon />
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item>Delete</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </AuthLayout>
    );
}
