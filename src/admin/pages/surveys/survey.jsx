import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { MoreIcon, View, SortAscIcon, SortDescIcon, ViewReport } from "../../../components/svg-icons/icons";
import { Container, Dropdown, Row, Col, Pagination } from 'react-bootstrap';
import { getSurveys } from '../../../apis/SurveyApi';
import AuthLayout from '../../../layout/Auth';
import { formatDateGB, formatDateUS } from '../../../utils/dateUtils';
import Loading from '../../../components/Loading';
import { Link } from "react-router-dom";
export default function Survey() {
    const navigate = useNavigate();

    const [surveys, setSurveys] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('');
    useEffect(() => {
        const fetchSurveys = async () => {
            setLoading(true);
            try {
                const data = await getSurveys(searchTerm, currentPage, sortField, sortOrder);
                setSurveys(data.surveys);
                setTotalPages(data.meta.totalPages);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                console.error("Error fetching surveys:", error);
            }
        };

        fetchSurveys();
    }, [searchTerm, currentPage, sortField, sortOrder]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);  // Reset to the first page on search
    };

    const handlePaginationClick = (pageNumber) => {
        setCurrentPage(pageNumber);
    };


    const handleSort = (field) => {
        const newSortOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(newSortOrder);
    };

    const renderSortIcon = (field) => {
        if (sortField === field) {
            return sortOrder === 'asc' ? <SortAscIcon /> : <SortDescIcon />;
        }
        return null;
    };
    return (
        <AuthLayout title={"Surveys"}>
            <div className='table-inner main-wrapper action-center'>
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
                                <th>Survey</th>
                                <th onClick={() => handleSort('createdAt')}>Initiation Date {renderSortIcon('createdAt')}</th>
                                <th>Loop Lead Name</th>
                                <th>Manager Name</th>
                                <th>Total Invitees</th>
                                <th>Completed Surveys</th>
                                <th>Loop Lead Completed Survey?</th>
                                <th>Manager Completed Survey?</th>
                                <th>Survey Status</th>
                                <th onClick={() => handleSort('report_gen_date')} >Report Generation Date {renderSortIcon('report_gen_date')}</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="10" style={{ textAlign: 'center' }}>
                                        <Loading />
                                    </td>
                                </tr>
                            ) : surveys.length === 0 ? (
                                <tr>
                                    <td colSpan="10" style={{ textAlign: 'center' }}>
                                        <h4>No 360s found</h4>
                                    </td>
                                </tr>
                            ) : (
                                surveys.map((survey, index) => (
                                    <tr key={survey._id}>
                                        <td>{(currentPage - 1) * 10 + (index + 1)}</td>
                                        <td>{formatDateGB(survey.createdAt)}</td>
                                        <td>{survey?.loop_lead?.first_name} {survey?.loop_lead?.last_name}</td>
                                        <td>{survey?.manager?.first_name}  {survey?.manager?.last_name}</td>
                                        <td>{survey.total_invites}</td>
                                        <td>{survey.completed_survey}</td>
                                        <td>{survey.ll_survey_status === 'yes' ? <span className='span-badge active-tag'>Yes</span> : <span className='span-badge inactive-tag'> Not completed
                                        </span>}</td>
                                        <td>{survey.mgr_survey_status === 'yes' ? <span className='span-badge active-tag'>Yes</span> : <span className='span-badge inactive-tag'> Not completed
                                        </span>}</td>
                                        <td>{survey.survey_status === 'completed' ? <span className='span-badge active-tag'>Completed</span> : <span className='span-badge inactive-tag'>Pending</span>}</td>

                                        <td>
                                            {survey.report_gen_date
                                                ? formatDateGB(survey.report_gen_date)
                                                : 'Not available yet'}
                                        </td>
                                        <td>
                                            <button className='action-btn' title='View Detail' onClick={() => navigate(`/view-survey-participant/${survey._id}`)}><View /></button>
                                            <button className='action-btn' title='View Report' onClick={() => navigate(`/survey-summary/${survey._id}`)} disabled={survey.report_gen_date == null ? true : false}>
                                                <ViewReport />
                                            </button>

                                            {/* {survey?.survey_status == "completed" && <Link to={`/survey-summary/${survey._id}`} className='default-btn' >View Summary</Link>} */}

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
                    {[...Array(totalPages).keys()].map(page => (
                        <Pagination.Item
                            key={page + 1}
                            className='link-page'
                            active={page + 1 === currentPage}
                            onClick={() => handlePaginationClick(page + 1)}
                        >
                            {page + 1}
                        </Pagination.Item>
                    ))}
                    <Pagination.Next onClick={() => handlePaginationClick(currentPage + 1)} disabled={currentPage === totalPages} />
                    <Pagination.Last onClick={() => handlePaginationClick(totalPages)} disabled={currentPage === totalPages} />
                </Pagination>
            )}
        </AuthLayout>
    );
}
