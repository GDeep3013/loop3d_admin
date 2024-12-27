import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { MoreIcon, View, ViewReport } from "../../components/svg-icons/icons";
import { Container, Dropdown, Row, Col } from 'react-bootstrap';
import { getSurveyById } from '../../apis/SurveyApi';
import { formatDateGB, formatDateUS } from '../../utils/dateUtils';

import { useSelector } from 'react-redux';

export default function SurveyList() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [surveys, setSurveys] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (user?._id) {
      (async () => {
        try {
          setLoading(true)
          let data = await getSurveyById('', user?._id, '', searchTerm);
          if (Array.isArray(data) && data.length > 0) {
            setSurveys(data);
          }
          setLoading(false)

        } catch (error) {
          console.error("Error fetching surveys:", error);
          setLoading(false)
        }
      })();
    }
  }, [user?._id, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };


  return (
    <div className='table-inner mt-5  main-wrapper pd-2 bg-white shadow-border-wrapper ml-8'>
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
      <div className='table-scroll table-pd'>
        <table className='table'>
          <thead>
            <tr>
              <th>Survey</th>
              <th>Initiation Date</th>
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
                <td colSpan="9" style={{ textAlign: 'center' }}>
                  Loading...
                </td>
              </tr>
            ) : surveys && surveys.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center' }}>
                  <h4>No 360s found</h4>
                </td>
              </tr>
            ) : (
              surveys.map((survey, index) => (
                <tr key={survey._id} className='table-list-hover'>
                  <td onClick={() => navigate(`/loop-lead/view-survey-participant/${survey._id}`)}>{index + 1}</td>
                  <td onClick={() => navigate(`/loop-lead/view-survey-participant/${survey._id}`)}>{formatDateGB(survey.createdAt)}</td>
                  <td onClick={() => navigate(`/loop-lead/view-survey-participant/${survey._id}`)}>{survey.total_invites}</td>
                  <td onClick={() => navigate(`/loop-lead/view-survey-participant/${survey._id}`)}>{survey.completed_survey}</td>
                  <td onClick={() => navigate(`/loop-lead/view-survey-participant/${survey._id}`)}>{survey.ll_survey_status === 'yes' ? <span className='span-badge active-tag'>Yes</span> : <span className='span-badge inactive-tag'> Not completed</span>}</td>
                  <td onClick={() => navigate(`/loop-lead/view-survey-participant/${survey._id}`)}>{survey.mgr_survey_status === 'yes' ? <span className='span-badge active-tag'>Yes</span> : <span className='span-badge inactive-tag'> Not completed</span>}</td>
                  <td onClick={() => navigate(`/loop-lead/view-survey-participant/${survey._id}`)}>{survey.survey_status === 'completed' ? <span className='span-badge active-tag'>Completed</span> : <span className='span-badge inactive-tag'>Pending</span>}</td>
 
                  <td onClick={() => navigate(`/loop-lead/view-survey-participant/${survey._id}`)}>
                    {survey.report_gen_date
                      ? formatDateGB(survey.report_gen_date)
                      : 'Not Available Yet'}
                  </td>
                  <td>
                    {/* <button className='action-btn' onClick={() => navigate(`/loop-lead/view-survey-participant/${survey._id}`)}><View /></button> */}
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
  );
}
