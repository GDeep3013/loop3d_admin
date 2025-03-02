import React, { useState, useEffect } from 'react'
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import AssignCompetencies from './AssignCompetencies';
import LoopLeads from '../loopleads/LoopLeads';
import CreateOrganization from "./CreateOrganizations"
import AuthLayout from "../../../layout/Auth";
import { Button } from 'react-bootstrap';

import axios from "axios";


import { useParams, useNavigate } from "react-router-dom";
import ManagerList from "./ManagerList"


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
            </div>
             <div className="content-outer pd-2 edit-org ">
            <Tabs
                defaultActiveKey="home"
                id="uncontrolled-tab-example"
                className="custom-tabs"
            >
                <Tab eventKey="home" title="Overview">
                    <CreateOrganization id={id} savedData={formData} />

                </Tab>
                <Tab eventKey="profile" title="Competencies">
                    <AssignCompetencies data={{ ref_id: id, name: formData.name }} type="organization" />

                </Tab>
                <Tab eventKey="contact" title="LOOP3D  Leads">
                    <LoopLeads organization={{ orgniation_id: id, name: formData.name }} />
                </Tab>
                <Tab eventKey="managerList" title="Supervisors">
                    <ManagerList  organization={{ orgniation_id: id, name: formData.name }}/>
                </Tab>
            </Tabs>
                </div>
        </AuthLayout>

    )
}
