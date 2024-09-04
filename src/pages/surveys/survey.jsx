import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { MoreIcon } from "../../components/svg-icons/icons";
import { Container, Dropdown, Row, Col } from 'react-bootstrap';
import { getSurveys } from '../../apis/SurveyApi';
import AuthLayout from '../../layout/Auth';
import {View} from '../../components/svg-icons/icons';
export default function Survey() {
    const navigate = useNavigate();

    const [surveys, setSurveys] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {

        (async () => {
            try {
                let data = await getSurveys(searchTerm);
                if (Array.isArray(data) && data.length > 0) {
                    setSurveys(data);
                } else {
                    setSurveys([]);
                }
            } catch (error) {
                console.error("Error fetching surveys:", error);
            }
        })();

    }, [searchTerm]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <AuthLayout title={"surveys"}>
            <div className='table-inner main-wrapper '>
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
                            <th>Survey #</th>
                            <th>Initiation Date</th>
                            <th>LL Name</th>
                            <th>Mgr Name</th>
                            <th>Total Invitees</th>
                            <th>Completed Surveys</th>
                            <th>LL Completed Survey?</th>
                            <th>Mgr Completed Survey?</th>
                            <th>Report Generation Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {surveys.length === 0 ? (
                            <tr>
                                <td colSpan="12" style={{ textAlign: 'center' }}>
                                    <h4>No surveys found</h4>
                                </td>
                            </tr>
                        ) : (
                            surveys.map((survey, index) => (
                                <tr key={survey._id}>
                                    <td>{index + 1}</td>
                                    <td>{new Date(survey.createdAt).toLocaleDateString()}</td>
                                    <td>{survey?.loop_lead_id?.first_name} {survey?.loop_lead_id?.last_name}</td>
                                    <td>{survey?.mgr_id?.first_name}  {survey?.mgr_id?.last_name}</td>
                                    <td>{survey.total_invites}</td>
                                    <td>{survey.completed_survey}</td>
                                    <td>{survey.ll_survey_status === 'yes' ? <span className='span-badge active-tag'>Yes</span> : <span className='span-badge inactive-tag'>No</span>}</td>
                                    <td>{survey.mgr_survey_status === 'yes' ? <span className='span-badge active-tag'>Yes</span> : <span className='span-badge inactive-tag'>No</span>}</td>
                                    <td>
                                        {survey.report_gen_date
                                            ? new Date(survey.report_gen_date).toLocaleDateString()
                                            : 'Never'}
                                    </td>
                                    <td>
                                    <button className='action-btn' onClick={() => navigate(`/view-survey-participant/${survey._id}`)}><View /></button>

                                        {/* <Dropdown className='custom-dropdown'>
                                            <Dropdown.Toggle variant="success" id="dropdown-basic">
                                                <MoreIcon />
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => navigate(`/view-survey-participant/${survey._id}`)}>
                                                    View
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown> */}
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
