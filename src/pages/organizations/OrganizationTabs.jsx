import React,{useState ,useEffect} from 'react'
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import AssignCompetencies from './AssignCompetencies';
import LoopLeads from '../loopleads/LoopLeads';
import AddOrganization from "./CreateOrganizations"
import AuthLayout from "../../layout/Auth";
import axios from "axios";


import { useParams, useNavigate } from "react-router-dom";


export default function OrganizationTabs() {
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
                    setFormData({ name });
                } catch (error) {
                    console.error("Error fetching organization details:", error);
                }
            };
            fetchOrganizationDetails();
        }
    }, [id]);
    return (
        <AuthLayout title={id ? "Edit Organization" : "Add Organization"}>

            <Tabs
                defaultActiveKey="home"
                id="uncontrolled-tab-example"
                className="mb-3 mt-5 custom-tabs"
            >
                <Tab eventKey="home" title="Overview">
                    <AddOrganization id={id} formData={formData} setFormData={setFormData} />

                </Tab>
                <Tab eventKey="profile" title="Competencies">
                    <AssignCompetencies orgniation={{ orgniation_id: id ,name:formData.name }} type="organization" />

                </Tab>
                <Tab eventKey="contact" title="Loop Leads">
                    <LoopLeads organization={{ orgniation_id: id  ,name:formData.name}} />
                </Tab>
            </Tabs>
        </AuthLayout>

    )
}
