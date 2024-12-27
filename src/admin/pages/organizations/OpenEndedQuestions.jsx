import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Container, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const OpenEndedQuestions = ({ activeTab, organization_id, createdBy, fetchQuestions, openQuestions, setOpenQuestions }) => {
    const [formData, setFormData] = useState({
        questionText: '',
        questionType: 'OpenEnded',
        parentType: activeTab,
        createdBy: createdBy,
        currentCategoryId: null,
        organization_id: organization_id
    });

    useEffect(() => {
        setFormData(prevData => ({
            ...prevData,
            parentType: activeTab,
        }));
    }, [activeTab]);


    const [errors, setErrors] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const validateForm = (data) => {
        let validationErrors = {};

        if (!data.questionText.trim()) {
            validationErrors.questionText = 'Question text is required';
        }

        return validationErrors;
    };


    useEffect(() => {
        if (activeTab && organization_id) {
            fetchQuestions(organization_id); // Make sure the ref_id exists
        }
    }, [activeTab, organization_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        const url = editId ? `/api/questions/${editId}` : '/api/questions/create';
        const method = editId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': import.meta.env.VITE_X_API_KEY
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();

            if (response.ok) {
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: `Question ${editId ? 'Updated' : 'Created'} Successfully!`,
                    showConfirmButton: false,
                    timer: 1500
                });
                setShowModal(false);
                setFormData({
                    questionText: '',
                    questionType: 'OpenEnded',
                    parentType: activeTab,
                    createdBy: createdBy,
                    currentCategoryId: null,
                    organization_id: organization_id
                });
                fetchQuestions(organization_id); // Make sure the ref_id exists
                setIsEdit(false)
                setEditId(null)
                setErrors('')
            } else {
                setErrors({ form: data.error });
            }
        } catch (error) {
            setErrors({ form: 'Failed to save question' });
        }
    };

    const handleDelete = async (id) => {
        try {
            const confirmResult = await Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#000",
                cancelButtonColor: "#d26c6c",
                confirmButtonText: "Yes, delete it!"
            });

            if (confirmResult.isConfirmed) {
                const response = await fetch(`/api/questions/${id}`, {
                    method: 'DELETE',
                    headers: { "x-api-key": import.meta.env.VITE_X_API_KEY }
                });

                if (response.ok) {
                    await Swal.fire({
                        title: "Deleted!",
                        text: "The question has been deleted.",
                        icon: "success",
                        confirmButtonColor: "#000",
                    });
                    // Fetch the updated questions after deletion
                    fetchQuestions(organization_id);
                } else {
                    console.error('Failed to delete question');
                }
            }
        } catch (error) {
            console.error('Error deleting question:', error);
        }
    };
    const handleEditQuestion = async (question) => {
        setShowModal(true);
        setEditId(question._id)
        setIsEdit(true);
        setFormData({
            questionText: question?.questionText,
            questionType: 'OpenEnded',
            parentType: activeTab,
            createdBy: createdBy,
            currentCategoryId: null,
            organization_id: organization_id
        });
    };
    return (
        <div className="ended-questions p-4">
            <h2 className="fs-5 mb-3 font-semibold">Open Ended Questions</h2>

            <div className="question-section">
                {openQuestions && openQuestions.map((question, index) => (
                    <p>
                        <div key={question._id} className="question-item">
                            <span className='fw-bold'>Q{index + 1}:</span> {question.questionText}
                            <div className="question-actions ms-2">
                                <Link onClick={() => { handleEditQuestion(question) }} style={{ cursor: 'pointer', color: 'red' }}> ✏️ </Link>
                                <Link onClick={() => { handleDelete(question._id) }} style={{ cursor: 'pointer', color: 'red' }}> ❌ </Link>
                            </div>
                        </div>
                    </p>

                ))}

            </div>
            <Button variant="primary" onClick={() => setShowModal(true)} className="default-btn">
                + Add New Question
            </Button>

            <Modal show={showModal} onHide={() => { setShowModal(false), setEditId(''), setIsEdit(false), setFormData(''), setErrors('') }} className="new-question">
                <Modal.Header closeButton>
                    <Modal.Title>{isEdit ? "Edit Question" : "Create New Question"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Container className="outer-box">
                            <Row>
                                <Col md={12}>
                                    <Form.Group className="mb-4">
                                        <Form.Label>Question Text</Form.Label><sup style={{ color: 'red' }}>*</sup>
                                        <Form.Control
                                            type="text"
                                            name="questionText"
                                            value={formData.questionText}
                                            onChange={handleChange}
                                            placeholder="Enter question text"
                                        />
                                        {errors.questionText && <small className="text-danger">{errors.questionText}</small>}
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={12}>
                                    <div className="profile-btns pt-0">
                                        <Button type="submit" className="default-btn">
                                            {isEdit ? "Update" : "Save"}
                                        </Button>
                                        <Button
                                            type="button"
                                            className="default-btn cancel-btn"
                                            onClick={() => { setShowModal(false), setEditId(''), setIsEdit(false), setFormData(''), setErrors('') }
                                            }
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                    {errors.form && <p className="text-danger">{errors.form}</p>}
                                </Col>
                            </Row>
                        </Container>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default OpenEndedQuestions;
