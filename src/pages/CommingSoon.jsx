import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { Col, Container, Row, Button } from 'react-bootstrap'
import { Link } from "react-router-dom";


import AuthLayout from '../layout/Auth'


export default function CommingSoon() {

    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1); // Navigates to the previous page
    };

  
    //const itemsPerPage = 10;


    // useEffect(() => {

    // }, []);

    /**
     * Delete The Organization
     * @param {*} id 
    */
    

    return (
        <AuthLayout title={'Surveys'} subTitle={'Surveys'}>

            <div className="coming-soon">
                <Container className="text-center">
                    <Row className="justify-content-center align-items-center min-vh-100">
                        <Col md={8}>
                            <h1 className="display-4">Coming Soon</h1>
                            <p className="lead">This page is under construction. Stay tuned for something amazing!</p>
                            <Button className="btn-primary mt-4" onClick={handleGoBack}>Go Back</Button>
                        </Col>
                    </Row>
                </Container>
            </div>

        
        </AuthLayout>
    )
}