import React, { useState, useCallback, useEffect } from 'react'
import AuthLayout from '../../../layout/Auth'
import { Col, Row, Container, Form, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Swal from 'sweetalert2';
import GoalCreator from '../plan/GoalCreator';
import SuggestedGoal from '../plan/SuggestedGoal';
import GoalListing from '../plan/GoalListing';

const Plans = () => {
    return (
        <AuthLayout title={'Welcome to Plans'} subTitle={'Development Plan'}>
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
            <div className="content-outer shadow-border-wrapper">
                <Container>
                    <Row>
                        <Col xs={12} md={6}><GoalCreator /></Col>
                        <Col xs={12} md={6}><SuggestedGoal /></Col>
                    </Row>
                    <Row>
                        <Col><GoalListing /></Col>
                    </Row>
                </Container>

            </div>
        </AuthLayout>
    )
}

export default Plans
