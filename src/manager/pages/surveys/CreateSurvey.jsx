import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getAssignments } from '../../../apis/assignCompetencyApi';
import { useNavigate } from 'react-router-dom';
import { Col, Row, Form, Button, Alert } from 'react-bootstrap';
import AuthLayout from "../../../layout/Auth";
import Select from 'react-select';

export default function CreateSurvey() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [loopLeads, setLoopLeads] = useState([{ first_name: '', last_name: '', email: '', competencies: [] }]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [filteredCompetencies, setFilteredCompetencies] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCompetencies();
  }, []);

  useEffect(() => {
    if (selectedTypes.length > 0) {
      filterCompetencies();
    } else {
      setFilteredCompetencies([]);
    }
  }, [selectedTypes, competencies]);

  const fetchCompetencies = async () => {
    try {
      const result = await getAssignments(user?._id);
      setCompetencies(result?.assignments);
    } catch (error) {
      console.error('Error fetching competencies:', error);
    }
  };

  const filterCompetencies = () => {
    const filtered = competencies.filter((comp) =>
      selectedTypes.includes(comp?.category_id?.competency_type)
    );
    setFilteredCompetencies(filtered);
  };

  const handleTypeChange = (type) => {
    setSelectedTypes([type]);
    // Reset competencies for all loop leads when type changes
    const newLoopLeads = loopLeads.map(lead => ({
      ...lead,
      competencies: []
    }));
    setLoopLeads(newLoopLeads);
  };

  const handleCompetencyChange = (index, selectedOptions) => {
    const newLoopLeads = [...loopLeads];
    newLoopLeads[index].competencies = selectedOptions.map(opt => opt.value);
    setLoopLeads(newLoopLeads);
  };

  const handleLoopLeadChange = (index, field, value) => {
    const newLoopLeads = [...loopLeads];
    newLoopLeads[index][field] = value;
    setLoopLeads(newLoopLeads);
  };

  const addLoopLead = () => {
    setLoopLeads([...loopLeads, { first_name: '', last_name: '', email: '', competencies: [] }]);
  };

  const validateForm = () => {
    let formErrors = {};
    loopLeads.forEach((lead, index) => {
      if (!lead.first_name) formErrors[`first_name${index}`] = 'First Name is required';
      if (!lead.last_name) formErrors[`last_name${index}`] = 'Last Name is required';
      if (!lead.email) formErrors[`email${index}`] = 'Email is required';
      if (lead.competencies.length === 0) formErrors[`competencies${index}`] = 'Please select at least 1 competency';
      if (lead.competencies.length > 3) formErrors[`competencies${index}`] = 'You can select up to 3 competencies only';
    });
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const surveyData = {
      name: 'Employee Satisfaction Survey',
      loop_leads: loopLeads,
      competencies: loopLeads.flatMap(lead => lead.competencies),
      mgr_id: '66cc8933e68627a521352a16'
    };

    console.log('surveyData', surveyData);
    try {
      const response = await fetch('{{Loop3D_BASE_URL}}/survey/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(surveyData)
      });

      if (response.ok) {
        alert('Survey created successfully');
      } else {
        alert('Failed to create survey');
      }
    } catch (error) {
      console.error('Error creating survey:', error);
    }
  };

  return (
    <AuthLayout title={"Add Survey"}>
      <div className="tabe-outer">
        <div className="main-back-heading">
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
        <div className="content-outer bg-white ml-8 p-c-3">
          <Form onSubmit={handleSubmit}>
            {loopLeads.map((lead, index) => (
              <div key={index} className="loop-lead-section">
                <Row>
                  <Col sm={3}>
                    <Form.Group controlId={`formFirstName${index}`}>
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={lead.first_name}
                        onChange={(e) => handleLoopLeadChange(index, 'first_name', e.target.value)}
                        isInvalid={!!errors[`first_name${index}`]}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors[`first_name${index}`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col sm={3}>
                    <Form.Group controlId={`formLastName${index}`}>
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={lead.last_name}
                        onChange={(e) => handleLoopLeadChange(index, 'last_name', e.target.value)}
                        isInvalid={!!errors[`last_name${index}`]}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors[`last_name${index}`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col sm={3}>
                    <Form.Group controlId={`formEmail${index}`}>
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={lead.email}
                        onChange={(e) => handleLoopLeadChange(index, 'email', e.target.value)}
                        isInvalid={!!errors[`email${index}`]}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors[`email${index}`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col sm={3}>
                    <Form.Group controlId={`formCompetency${index}`}>
                      <Form.Label>Competencies</Form.Label>
                      <Select
                        isMulti
                        name={`competencies${index}`}
                        options={filteredCompetencies.map(comp => ({
                          label: comp?.category_id.category_name,
                          value: comp?.category_id._id
                        }))}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        onChange={(selectedOptions) => handleCompetencyChange(index, selectedOptions)}
                        value={lead.competencies.map(compId => ({
                          label: competencies.find(comp => comp?.category_id._id === compId)?.category_id.category_name,
                          value: compId
                        }))}
                        isInvalid={!!errors[`competencies${index}`]}
                      />
                      {errors[`competencies${index}`] && (
                        <Alert variant="danger" className="mt-2">
                          {errors[`competencies${index}`]}
                        </Alert>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            ))}
            <Button variant="secondary" onClick={addLoopLead}>
              Add Another Loop Lead
            </Button>

            <Form.Group as={Row} className="mt-3">
              <Form.Label column sm={2}>Competency Types</Form.Label>
              <Col sm={10}>
                <Form.Check
                  type="radio"
                  name="competency-type"
                  label="Individual Contributor"
                  onChange={() => handleTypeChange('individual_contributor')}
                />
                <Form.Check
                  type="radio"
                  name="competency-type"
                  label="People Manager"
                  onChange={() => handleTypeChange('people_manager')}
                />
              </Col>
            </Form.Group>

            <Button variant="primary" type="submit">
              Create Survey
            </Button>
          </Form>
        </div>
      </div>
    </AuthLayout>
  );
}
