import React, { useState, useEffect } from "react";
import AuthLayout from "../../layout/Auth";
import { Col, Row, Container, Form, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import axios from "axios";

export default function ViewOrganization() {
    const { id } = useParams();  // Retrieve the organization ID from the URL parameters
    const navigate = useNavigate();

    const [organization, setOrganization] = useState("");

   

    // Fetch organization details if editing
    useEffect(() => {
        if (id) {
            const fetchOrganizationDetails = async () => {
                try {
                    const response = await axios.get(`/api/organizations/${id}`, {
                        headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
                    });
                    //const { name } = response.data;
                    setOrganization(response.data);
                } catch (error) {
                    console.error("Error fetching organization details:", error);
                    navigate(-1);
                }
            };
            fetchOrganizationDetails();
        }else{
            navigate(-1);
        }
    }, [id]);


    return (
        <AuthLayout title={id ? "Edit Organization" : "Add Organization"}>
            <div className="content-outer">
                <Form className="organization-form">
                    <Container>
                        <Row>
                            <Col md={6}>
                                <h2>{organization.name}</h2>
                            </Col>
                            <Col md={12}>
                                <div className="profile-btns">
                                    <Button className="default-btn cancel-btn" onClick={() => navigate('/organizations')}>
                                        Back
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </Form>
            </div>
        </AuthLayout>
    );
}