import React, { useState, useEffect } from "react";
import AuthLayout from "../../layout/Auth";
import { Col, Row, Container, Form, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Swal from 'sweetalert2';
import { getEmailById, createEmail, updateEmail } from '../../apis/emailApi';
import { useSelector } from 'react-redux';

export default function CreateEmail() {
  const user = useSelector((state) => state.auth.user); // Assuming the slice is named "auth"
  const { id } = useParams();  // Retrieve email ID from the URL parameters
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [email, setEmail]= useState(false);

  useEffect(() => {
    if (id) {
      const fetchEmailDetails = async () => {
        try {
          const data = await getEmailById(id);
          setEmail(data)
          console.log(data)

        } catch (error) {
          console.error("Error fetching email details:", error);
        }
      };
      fetchEmailDetails();
    }
  }, [id]);


  return (
    <AuthLayout title={id ? "Edit Email" : "Add Email"}>
      <div className="content-outer main-wrapper pd-2 bg-white">
        <div class="tabe-outer">
          <div class="main-back-heading">
            <div class="container">
              <div class="row">
                <div class="col-md-6 p-0">
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
        <Form className="email-form">
          <Container>
            <Row>
              <Col md={12}>
                <h4>{email?.subject_line}</h4>
              </Col>
              <Col md={12}>{email?.email_content}</Col>
            </Row>
          </Container>
        </Form>
      </div>
    </AuthLayout>
  );
}
