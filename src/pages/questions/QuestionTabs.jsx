
import React, { useState, useEffect } from 'react'
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import AuthLayout from "../../layout/Auth";
import { Button } from 'react-bootstrap';
import AddQuestion from './AddQuestion';

import AssignCompetencies from '../organizations/AssignCompetencies';
import axios from "axios";


import { useParams, useNavigate } from "react-router-dom";


export default function QuestionTabs() {
    const navigate = useNavigate();

    const { id } = useParams();
    const [formData, setFormData] = useState({
        questionText: '',
        questionType: '', // 'Text' or 'Radio'
        options: [{ text: '', isCorrect: false }],
    });
    useEffect(() => {
        if (id) {
            const fetchQuestionDetails = async () => {
                try {
                    const response = await fetch(`/api/questions/${id}`, {
                        headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
                    });
                    const data = await response.json();
                    setFormData({
                        ...data
                    });
                } catch (error) {
                    console.error('Error fetching question details:', error);
                }
            };
            fetchQuestionDetails();
        }
    }, [id]);

    return (
        <AuthLayout title={id ? 'Edit Question' : 'Add Question'}>
            <div className="profile-btns">
                <Button className="default-btn cancel-btn" onClick={() => navigate(-1)}>
                    Back
                </Button>
            </div>

            <Tabs
                defaultActiveKey="home"
                id="uncontrolled-tab-example"
                className="mb-3 mt-5 custom-tabs"
            >
                <Tab eventKey="home" title="Overview">
                    <AddQuestion id={id} savedData={formData} />

                </Tab>
                <Tab eventKey="profile" title="Competencies">
                    <AssignCompetencies data={{ ref_id: id}} type="question" />
                </Tab>
            </Tabs>
        </AuthLayout>

    )
}

