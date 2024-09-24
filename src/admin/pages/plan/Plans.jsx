import React, { useState, useEffect } from 'react'
import AuthLayout from '../../../layout/Auth'
import { Col, Row, Container, Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import GoalCreator from '../plan/GoalCreator';
import SuggestedGoal from '../plan/SuggestedGoal';
import GoalListing from '../plan/GoalListing';
import CompletionManagement from '../plan/CompletionManagement';

const Plans = () => {
    const { id } = useParams();
    const [prompt, setPrompt] = useState('');
    const [selectedOption, setSelectedOption] = useState('');
    const [categories, setCategories] = useState([]);
    const [chatResponse, setChatResponse] = useState('');
    const [competencyFrom, setCompetencyFrom] = useState('');
    const [loading, setLoading] = useState(false);
    const [goals, setGoals] = useState([]);



    //Get get categories for the select box
    async function getCategory() {
        try {
            let url = `/api/categories`;
            let result = await fetch(url, {
                headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
            });
            result = await result.json();
            const activeCategories = result.categories.filter(category => category.status === 'active');
            setCategories(activeCategories);
        } catch (error) {
            console.error(error);
        }
    }

    //Get get goal for the select listing
    async function getGoals() {
        try {
            let url = `/api/plans/get-goal/${id}`;
            let result = await fetch(url, {
                headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
            });
            result = await result.json();
            if (result) {
                setGoals(result);
            }
        } catch (error) {
            console.error(error);

        }
    }

    // gernate plans for the smart goals
    const GernatePlans = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('/api/plans/gerante-plans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': import.meta.env.VITE_X_API_KEY
                },
                body: JSON.stringify({ prompt, option: selectedOption, survey_id: id }) // Send prompt in the body
            });
            const data = await response.json();
            setChatResponse(data.content)
            console.log(data, 'chat respose')
            setCompetencyFrom(data.competency)
            setLoading(false);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        getCategory();
        getGoals();
    }, [])

    // store gernated smart plans to database
    const AddNewGoal = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/plans/save-plans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': import.meta.env.VITE_X_API_KEY
                },
                body: JSON.stringify({ 'chatResponse': chatResponse, 'competency': competencyFrom, 'survey_id': id })
            });
            const data = await response.json();
            if (data) {
                setPrompt('')
                setSelectedOption('')
                setChatResponse('')
                setCompetencyFrom('')
                getGoals();
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }


    return (
        <AuthLayout title={'Welcome LOOP3D Development Plan '} subTitle={'Development Plan'}>
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
            <div className="content-outer">
                <Container>                 
                    <Row>
                        <Col xs={12} md={6}><GoalCreator prompt={prompt} setPrompt={setPrompt} handleSubmit={GernatePlans} selectedOption={selectedOption} setSelectedOption={setSelectedOption} categories={categories} /></Col>
                        <Col xs={12} md={6}><SuggestedGoal chatResponse={chatResponse} loading={loading} regenerateResponse={GernatePlans} AddNewGoal={AddNewGoal} setChatResponse={setChatResponse} /></Col>
                    </Row>
                    <Row>
                        <Col><GoalListing goals={goals} getGoals={getGoals} categories={categories} setChatResponse={setChatResponse} setCompetencyFrom={setCompetencyFrom} /></Col>
                    </Row>
                </Container>
            </div>
        </AuthLayout>
    )
}

export default Plans
