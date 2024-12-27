import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { MoreIcon, View, PLusIcon, ViewReport } from "../../../components/svg-icons/icons";
import { Container, Dropdown, Row, Col, Pagination } from 'react-bootstrap';
import { getSurveys, getSurveyById } from '../../../apis/SurveyApi';
import AuthLayout from '../../../layout/Auth';
import { formatDateGB, formatDateUS } from '../../../utils/dateUtils';
import { Link } from "react-router-dom";
import { useSelector } from 'react-redux';
export default function SurveyList() {
    const navigate = useNavigate();

    const [surveys, setSurveys] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const user = useSelector((state) => state.auth.user);
    useEffect(() => {
        const fetchSurveys = async () => {
            setLoading(true);
            let mgr_id = user?._id
            try {
                const data = await getSurveyById(mgr_id,searchTerm);
                if (Array.isArray(data) && data.length > 0) {
                    setSurveys(data);
                  }
                setLoading(false);
            } catch (error) {
                setLoading(false);
                console.error("Error fetching surveys:", error);
            }
        };

        fetchSurveys();
    }, [searchTerm, currentPage]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);  // Reset to the first page on search
    };

    const handlePaginationClick = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <AuthLayout title={"360"}>
            <div className='table-inner main-wrapper '>
                <div className='content-outer'>
                    <div className='tabe-outer'>
                        <div className='table-heading pt-3'>
                            <Container>
                                <Row>
                                    <Col md={6} className='text-end'>
                                    </Col>
                                    <Col md={6} className='text-end p-0'>
                                        <form className='d-flex justify-content-end'>
                                            <input
                                                type='search'
                                                placeholder='Search...'
                                                value={searchTerm}
                                                onChange={handleSearch}
                                                className='form-control'
                                            />
                                            <Link to="/manager/surveys/create" className='default-btn' >Add Survey <PLusIcon /> </Link>
                                        </form>

                                    </Col>
                                </Row>
                            </Container>
                        </div>
                    </div>
                </div>
                <div className='table-scroll  shadow-border-wrapper ml-8'>
                    <table className='table'>
                        <thead>
                            <tr>
                                <th>Survey</th>
                                <th>Initiation Date</th>
                                <th>Loop3d Lead Name</th>
                                {/* <th>Supervisor Name</th> */}
                                <th>Total Invitees</th>
                                <th>Completed Surveys</th>
                                <th>Loop3d Lead Completed Survey?</th>
                                <th>Supervisor Completed Survey?</th>
                                <th>Survey Status</th>
                                <th>Report Generation Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="11" style={{ textAlign: 'center' }}>
                                        Loading...
                                    </td>
                                </tr>
                            ) : surveys && surveys.length === 0 ? (
                                <tr>
                                    <td colSpan="11" style={{ textAlign: 'center' }}>
                                        <h4>No 360s found</h4>
                                    </td>
                                </tr>
                            ) : (
                                surveys && surveys.map((survey, index) => (
                                    <tr key={survey._id} className='table-list-hover'>
                                        <td onClick={() => navigate(`/view-survey-participant/${survey._id}`)}>{index + 1}</td>
                                        <td onClick={() => navigate(`/view-survey-participant/${survey._id}`)}>{formatDateGB(survey.createdAt)}</td>
                                        <td onClick={() => navigate(`/view-survey-participant/${survey._id}`)}>{survey?.loop_lead?.first_name} {survey?.loop_lead?.last_name}</td>
                                        {/* <td onClick={() => navigate(`/view-survey-participant/${survey._id}`)}>{survey?.mgr_id?.first_name}  {survey?.mgr_id?.last_name}</td> */}
                                        <td onClick={() => navigate(`/view-survey-participant/${survey._id}`)}>{survey.total_invites}</td>
                                        <td onClick={() => navigate(`/view-survey-participant/${survey._id}`)}>{survey.completed_survey}</td>
                                        <td onClick={() => navigate(`/view-survey-participant/${survey._id}`)}>{survey.ll_survey_status === 'yes' ? <span className='span-badge active-tag'>Yes</span> : <span className='span-badge inactive-tag'> Not completed
                                        </span>}</td>
                                        <td onClick={() => navigate(`/view-survey-participant/${survey._id}`)}>{survey.mgr_survey_status === 'yes' ? <span className='span-badge active-tag'>Yes</span> : <span className='span-badge inactive-tag'> Not completed
                                        </span>}</td>
                                        <td onClick={() => navigate(`/view-survey-participant/${survey._id}`)}>{survey.survey_status === 'completed' ? <span className='span-badge active-tag'>Completed</span> : <span className='span-badge inactive-tag'>Pending</span>}</td>

                                        <td onClick={() => navigate(`/view-survey-participant/${survey._id}`)}>
                                            {survey.report_gen_date
                                                ? formatDateGB(survey.report_gen_date)
                                                : 'Not available yet'}
                                        </td>
                                        <td>
                                            {/* <button className='action-btn' onClick={() => navigate(`/view-survey-participant/${survey._id}`)}><View /></button> */}
                                            <button className='action-btn' title='View Report' onClick={() => navigate(`/survey-summary/${survey._id}`)} disabled={survey.report_gen_date == null ? true : false}>
                                                <ViewReport />
                                            </button>

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
            </div>
            {totalPages > 1 && (
                <Pagination className='justify-content-center pagination-outer'>
                    <Pagination.First onClick={() => handlePaginationClick(1)} disabled={currentPage === 1} />
                    <Pagination.Prev onClick={() => handlePaginationClick(currentPage - 1)} disabled={currentPage === 1} />
                    <Pagination.Next onClick={() => handlePaginationClick(currentPage + 1)} disabled={currentPage === totalPages} />
                    <Pagination.Last onClick={() => handlePaginationClick(totalPages)} disabled={currentPage === totalPages} />
                </Pagination>
            )}
        </AuthLayout>
    );
}
