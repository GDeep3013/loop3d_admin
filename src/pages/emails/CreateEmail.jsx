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
  const [formData, setFormData] = useState({
    recipient_type: '',
    subject_line: '',
    email_content: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchEmailDetails = async () => {
        try {
          const data = await getEmailById(id);
          setFormData({
            ...data,
            created_by: user?._id,
          });
        } catch (error) {
          console.error("Error fetching email details:", error);
        }
      };
      fetchEmailDetails();
    }
  }, [id]);

  // Form validation
  const validateForm = (formData) => {
    let errors = {};
    if (!formData.recipient_type.trim()) {
      errors.recipient_type = 'Recipient type is required';
    }
    if (!formData.subject_line.trim()) {
      errors.subject_line = 'Subject line is required';
    }
    if (!formData.email_content.trim()) {
      errors.email_content = 'Email content is required';
    }
    return errors;
  };

  const handleSubmit = async (event) => {
      const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      if (id) {
        await updateEmail(id, formData);
        Swal.fire({
          position: "center",
          icon: "success",
          title: `Email updated successfully!`,
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        await createEmail(formData);
        Swal.fire({
          position: "center",
          icon: "success",
          title: `Email created successfully!`,
          showConfirmButton: false,
          timer: 1500
        });
      }
      navigate('/emails');
    } catch (error) {
      console.error("Error saving email:", error);
      setErrors({ global: 'An error occurred while saving the email.' });
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({});
  };

  return (
    <AuthLayout title={id ? "Edit Email" : "Add Email"}>
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
      <div className="content-outer p-c-3 ml-8 shadow-border-wrapper bg-white">
      
        <Form className="email-form">
          <Container>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Recipient Type</Form.Label>
                  <Form.Control
                    type="text"
                    name="recipient_type"
                    value={formData.recipient_type}
                    onChange={handleChange}
                    placeholder="Recipient Type"
                  />
                  {errors.recipient_type && <small className="text-danger">{errors.recipient_type}</small>}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Subject Line</Form.Label>
                  <Form.Control
                    type="text"
                    name="subject_line"
                    value={formData.subject_line}
                    onChange={handleChange}
                    placeholder="Subject Line"
                  />
                  {errors.subject_line && <small className="text-danger">{errors.subject_line}</small>}
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-4">
                  <Form.Label>Email Content</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="email_content"
                    value={formData.email_content}
                    onChange={handleChange}
                    placeholder="Email Content"
                  />
                  {errors.email_content && <small className="text-danger">{errors.email_content}</small>}
                </Form.Group>
              </Col>
              <Col md={12}>
                <div className="profile-btns pt-0">
                    <Button className="default-btn" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Saving..." : (id ? "Update" : "Save")}
                  </Button>
                  <Button className="default-btn cancel-btn" onClick={() => navigate('/emails')}>
                    Cancel
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
