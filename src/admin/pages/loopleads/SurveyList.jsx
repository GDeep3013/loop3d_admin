import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { MoreIcon,View } from "../../../components/svg-icons/icons";
import { Container, Dropdown, Row, Col } from 'react-bootstrap';
import { getSurveyById } from '../../../apis/SurveyApi';
import { formatDateGB, formatDateUS } from '../../../utils/dateUtils';


export default function SurveyList({ loop_lead_id, org_id }) {
  const navigate = useNavigate();

  const [surveys, setSurveys] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (org_id && loop_lead_id) {
      (async () => {
        try {
          let data = await getSurveyById(loop_lead_id, org_id, searchTerm);
          console.log('data', data);
          if (Array.isArray(data) && data.length > 0) {
            setSurveys(data);
          }
        } catch (error) {
          console.error("Error fetching surveys:", error);
        }
      })();
    }
  }, [loop_lead_id, org_id, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
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
      <div className='table-scroll table-pd'>
      <table className='table'>
        <thead>
          <tr>
            <th>Survey #</th>
            <th>Initiation Date</th>
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
              <td colSpan="8" style={{ textAlign: 'center' }}>
                <h4>No surveys found</h4>
              </td>
            </tr>
          ) : (
            surveys.map((survey, index) => (
              <tr key={survey._id}>
                <td>{index + 1}</td>
                <td>{formatDateGB(survey.createdAt)}</td>
                <td>{survey.total_invites}</td>
                <td>{survey.completed_survey}</td>
                <td>{survey.ll_survey_status === 'yes' ? <span className='span-badge active-tag'>Yes</span> :<span className='span-badge inactive-tag'>No</span>}</td>
                <td>{survey.mgr_survey_status === 'yes' ? <span className='span-badge active-tag'>Yes</span> : <span className='span-badge inactive-tag'>No</span>}</td>
                <td>
                  {survey.report_gen_date
                    ? formatDateGB(survey.report_gen_date)
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
    </div>
  );
}
