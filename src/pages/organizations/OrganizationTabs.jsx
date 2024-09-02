import React, { useState, useEffect } from 'react'
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import AssignCompetencies from './AssignCompetencies';
import LoopLeads from '../loopleads/LoopLeads';
import CreateOrganization from "./CreateOrganizations"
import AuthLayout from "../../layout/Auth";
import { Button } from 'react-bootstrap';

import axios from "axios";


import { useParams, useNavigate } from "react-router-dom";


export default function OrganizationTabs() {
    const navigate = useNavigate();

    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: ''
    });
    useEffect(() => {
        if (id) {
            const fetchOrganizationDetails = async () => {
                try {
                    const response = await axios.get(`/api/organizations/${id}`, {
                        headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
                    });
                    const { name } = response.data;
                    setFormData({ name: name });
                } catch (error) {
                    console.error("Error fetching organization details:", error);
                }
            };
            fetchOrganizationDetails();
        }
    }, [id]);

    return (
        <AuthLayout title={id ? "Edit Organization" : "Add Organization"}>
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
                    <CreateOrganization id={id} savedData={formData} />

                </Tab>
                <Tab eventKey="profile" title="Competencies">
                    <AssignCompetencies data={{ ref_id: id, name: formData.name }} type="organization" />

                </Tab>
                <Tab eventKey="contact" title="Loop Leads">
                    <LoopLeads organization={{ orgniation_id: id, name: formData.name }} />
                </Tab>
            </Tabs>
        </AuthLayout>

    )
}
