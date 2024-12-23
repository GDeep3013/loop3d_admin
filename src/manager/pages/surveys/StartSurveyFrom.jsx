import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Tab, Tabs, Accordion, Button, Modal, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2'
// import { Link } from 'react-router-dom';
// import OpenEndedQuestions from "./OpenEndedQuestions";


export default function StartSurveyForm() {
    const user = useSelector((state) => state.auth.user);
    const router = useNavigate();
    // const searchParams = useParams();
    // const token = user?._id;
    const [selectedCategory, setSelectedCategory] = useState(null);
    // const [currentCategoryId, setCurrentCategoryId] = useState('');

    const [activeTab, setActiveTab] = useState("individual_contributor");
    const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
    const [formData, setFormData] = useState({
        loop_lead_first_name: "",
        loop_lead_last_name: "",
        loop_lead_email: "",
    });
    const [loader, setLoader] = useState(false);
    const [errors, setErrors] = useState({
        loop_lead_first_name: "",
        loop_lead_last_name: "",
        loop_lead_email: "",
        competencies: ""
    });

    const [assignments, setAssignments] = useState({
        individual_contributor: [],
        people_manager: []
    });

    // const [showModal, setShowModal] = useState(false);
    // const [editId, setEditId] = useState('');
    // const [isEdit, setIsEdit] = useState(false);
    const [openEndedQuestions, setOpenEndedQuestions] = useState([]);

    // const [questionFormData, setQuestionFormData] = useState({
    //     questionText: '',
    //     questionType: '', // 'Text' or 'Radio'
    //     options: [{ text: '', weightage: 1 }], // Added weightage
    //     createdBy: user?._id,
    //     manager_id:user._id,
    //     currentCategoryId: null,
    //     organization_id: user?.organization
    // });
    // const handleOpenModal = (categoryId) => {
    //     setQuestionFormData({ ...questionFormData, currentCategoryId: categoryId });
    //     setShowModal(true); // Show the modal
    // };

    
    // const cloneQuestion = async (categoryId) => {
    //     try {
    //         console.log('categoryId',categoryId)
    //         const response = await fetch('/api/questions/clone-question', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'x-api-key': import.meta.env.VITE_X_API_KEY 
    //             },
    //             body: JSON.stringify({organization_id:user?.organization, manager_id:user._id, categoryId:categoryId}),
    //         });
    
    //         const result = await response.json();
    
    //         if (response.ok) {
    //             // Handle success (e.g., update UI or show a success message)
    //             fetchQuestions()
    //         } else {
    //             // Handle error
    //             console.error('Error cloning question:', result.message);
    //         }
    //     } catch (error) {
    //         console.error('Network error:', error);
    //     }
    // };

    const handleCheckboxChange = (label, id) => {
        // cloneQuestion(id)
        if (selectedCheckboxes.includes(id)) {
            setSelectedCheckboxes(selectedCheckboxes.filter((item) => item !== id));
        } else {
            if (selectedCheckboxes.length < 3) {
                setSelectedCheckboxes([...selectedCheckboxes, id]);
            }
        }
    };

    const getAssignments = async () => {
        try {
            const url = `/api/competencies/assign?user_id=${user?._id}`;
            const response = await fetch(url, {
                headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
            });
            if (response.ok) {
                const data = await response.json();
                const categorizedAssignments = {
                    individual_contributor: [],
                    people_manager: []
                };
                data?.assignments.forEach((assignment) => {
                    if (assignment?.category_id?.status !== "inactive" && assignment?.category_id?.competency_type in categorizedAssignments) {
                        categorizedAssignments[assignment?.category_id?.competency_type].push({
                            name: assignment?.category_id?.category_name,
                            id: assignment?.category_id?._id
                        });
                    }
                });
                return categorizedAssignments;
            } else {
                console.error('Failed to fetch assignments');
                return false;
            }
        } catch (error) {
            console.error('Error fetching assignments:', error);
            return false;
        }
    };

    useEffect(() => {
        const fetchAssignments = async () => {
            const assignments = await getAssignments();
            if (assignments) {
                setAssignments(assignments);
            }
        };
        fetchAssignments();
        fetchQuestions()

    }, []);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
      
        setSelectedCheckboxes([]); // Reset checkboxes when switching tabs
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: "" }); // Clear error when input is changed
    };

    const validateForm = () => {
        let formIsValid = true;
        const newErrors = {};

        // Validate Loop Lead Name
        if (!formData.loop_lead_first_name.trim()) {
            newErrors.loop_lead_first_name = "Loop3d first name is required.";
            formIsValid = false;
        }
        else if (!/^[a-zA-Z\s-]+$/.test(formData.loop_lead_first_name)) {
            newErrors.loop_lead_first_name = "Loop3d lead name can only contain letters, spaces, and dashes.";
            formIsValid = false;
        }

        if (!formData.loop_lead_last_name.trim()) {
            newErrors.loop_lead_last_name = "Loop3d Last name is required.";
            formIsValid = false;
        }
        else if (!/^[a-zA-Z\s-]+$/.test(formData.loop_lead_last_name)) {
            newErrors.loop_lead_last_name = "Loop3d lead name can only contain letters, spaces, and dashes.";
            formIsValid = false;
          }

        // Validate Loop Lead Email
        if (!formData.loop_lead_email.trim()) {
            newErrors.loop_lead_email = "Loop3d lead email is required.";
            formIsValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.loop_lead_email)) {
            newErrors.loop_lead_email = "Please enter a valid email address.";
            formIsValid = false;
        }

        // Validate Competencies (min 3)
        if (selectedCheckboxes.length < 3) {
            newErrors.competencies = "Please select at least 3 competencies.";
            formIsValid = false;
        } else {
            newErrors.competencies = "";

        }

        setErrors(newErrors);
        return formIsValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return; // If form is not valid, exit early
        }

        setLoader(true);

        // Prepare the payload
        const payload = {
            surveyData: {
                name: "Employee Satisfaction Survey", 
                loop_leads: [
                    {
                        firstName: formData.loop_lead_first_name,
                        lastName: formData.loop_lead_last_name,
                        email: formData.loop_lead_email
                    }
                ],
                competencies: selectedCheckboxes,
                mgr_id: user?._id 
            }
        };

        try {
            const response = await fetch(`/api/surveys/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': import.meta.env.VITE_X_API_KEY
                },
                body: JSON.stringify(payload)
            });
            setLoader(false);

            if (response.ok) {
                const data = await response.json();
                await Swal.fire({
                    title: "Success!",
                    text: "Survey Created Successfully.",
                    icon: "success",
                    confirmButtonColor: "#000",
                  });
                const loopLeadId = data?.data?.surveys?.[0]?._id;
                if (loopLeadId) {
                    router('/manager/dashboard');
                }
            } else {
                setErrors({ ...errors, form: "Failed to submit the form. Please try again." });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setErrors({ ...errors, form: "An error occurred while submitting the form. Please try again." });
            setLoader(false);
        }
    };

    // const validateQuestionForm = (data) => {
    //     let validationErrors = {};

    //     if (!data.questionText.trim()) {
    //         validationErrors.questionText = 'Question text is required';
    //     }

    //     if (!data.questionType) {
    //         validationErrors.questionType = 'Answer type is required';
    //     }

    //     if (data.questionType === 'Radio') {
    //         if (data.options.length === 0 || data.options.every(option => !option.text.trim())) {
    //             validationErrors.options = 'At least one option is required';
    //         }

    //     }

    //     return validationErrors;
    // };

    // Handle input changes
    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     if (name === "questionType" && value === "Text") {
    //         setQuestionFormData({ ...questionFormData, [name]: value, options: [] });
    //     } else {
    //         setQuestionFormData({ ...questionFormData, [name]: value, options: [{ text: '', isCorrect: false, weightage: 1 }] });
    //     }
    //     setErrors({});
    // };

    // Handle option change
    // const handleOptionChange = (index, e) => {
    //     const { name, value, checked } = e.target;
    //     const updatedOptions = [...questionFormData.options];

    //     updatedOptions[index][name] = name === 'isCorrect' ? checked : value;


    //     setQuestionFormData({ ...questionFormData, options: updatedOptions });
    // };

    // Add a new option
    // const addOption = () => {
    //     setQuestionFormData({ ...questionFormData, options: [...questionFormData.options, { text: '', isCorrect: false, weightage: 1 }] });
    // };

    // Remove an option
    // const removeOption = (index) => {
    //     const updatedOptions = questionFormData.options.filter((_, i) => i !== index);
    //     setQuestionFormData({ ...questionFormData, options: updatedOptions });
    // };

    // Handle form submission

    // const handleQuestionDelete = async (id, categoryId) => {
    //     try {
    //         const confirmResult = await Swal.fire({
    //             title: "Are you sure?",
    //             text: "You won't be able to revert this!",
    //             icon: "warning",
    //             showCancelButton: true,
    //             confirmButtonColor: "#000",
    //             cancelButtonColor: "#d26c6c",
    //             confirmButtonText: "Yes, delete it!"
    //         });

    //         if (confirmResult.isConfirmed) {
    //             const response = await fetch(`/api/questions/${id}`, {
    //                 method: 'DELETE',
    //                 headers: { "x-api-key": import.meta.env.VITE_X_API_KEY }
    //             });

    //             if (response.ok) {
    //                 await Swal.fire({
    //                     title: "Deleted!",
    //                     text: "The question has been deleted.",
    //                     icon: "success",
    //                     confirmButtonColor: "#000",
    //                 });
    //                 fetchCategoriesById(categoryId);
    //             } else {
    //                 console.error('Failed to delete question');
    //             }
    //         }
    //     } catch (error) {
    //         console.error('Error deleting question:', error);
    //     }
    // };

    // const handleEditQuestion = async (value,cat_id) => {
    //     // console.log(value)
    //     setShowModal(true);     
    //     setEditId(value?.question_id)
    //     setIsEdit(true);
    //     setCurrentCategoryId(cat_id);
    //     setQuestionFormData({
    //         questionText: value?.questionText || '', // Assign questionText or fallback to an empty string
    //         questionType: value?.questionType || '', // Assign questionType or fallback to an empty string
    //         options: value?.options || [{ text: '', weightage: 1 }], 
    //         createdBy: user?._id,
    //         manager_id:user._id,
    //         currentCategoryId: null,
    //         organization_id: user?.organizationa // Assign the category ID or fallback to null
    //     })
    // };

    // const handleQuestionSubmit = async (e) => {
    //     e.preventDefault();
    //     console.log('questionFormData',questionFormData)
    //     const validationErrors = validateQuestionForm(questionFormData);
    //     if (Object.keys(validationErrors).length > 0) {
    //         setErrors(validationErrors);
    //         return;
    //     }
    //     const url = editId ? `/api/questions/${editId}` : '/api/questions/create';
    //     const method = editId ? 'PUT' : 'POST';


    //     try {
    //         const response = await fetch(url, {
    //             method,
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'x-api-key': import.meta.env.VITE_X_API_KEY
    //             },
    //             body: JSON.stringify(questionFormData)
    //         });
    //         const data = await response.json();

    //         if (response.ok || data) {
    //             Swal.fire({
    //                 position: 'center',
    //                 icon: 'success',
    //                 title: `Question Created Successfully!`,
    //                 showConfirmButton: false,
    //                 timer: 1500
    //             });
    //             setShowModal(false)
                
    //             fetchCategoriesById(currentCategoryId ? currentCategoryId : questionFormData.currentCategoryId)
    //             setQuestionFormData({
    //                 questionText: '',
    //                 questionType: '', // 'Text' or 'Radio'
    //                 options: [{ text: '', weightage: 1 }], // Added weightage
    //                 createdBy: user?._id,
    //                 manager_id:user._id,
    //                 currentCategoryId: null,
    //                 organization_id: user?.organization
    //             })
    //         } else {
    //             setErrors({ form: data.error });
    //         }
    //     } catch (error) {
    //         setErrors({ form: 'Failed to save question' });
    //     }
    // };


    async function fetchCategoriesById(categoryId) {
        try {
            const response = await fetch(`/api/competencies/get-questions?org_id=${user?.organization}&cat_id=${categoryId}&manager_id=${user._id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    'x-api-key': import.meta.env.VITE_X_API_KEY
                },
            });
            const result = await response.json();
            if (response.ok && result) {
                // console.log(result, 'result');
                setSelectedCategory(result); // Assuming result is an array of category objects
            } else {
                console.error("Error fetching categories:", result.message);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }

    
    const fetchQuestions = async () => {
        try {
            let new_tab_value = "";
            if (activeTab =="individual_contributor"){
                new_tab_value = "individualContributor"
            } else {
                new_tab_value = "peopleManager"

            }
            const response = await fetch(`/api/questions/get-openended-question?manager_id=${user._id}&organization_id=${user?.organization}&type=OpenEnded&activeTab=${new_tab_value}`, {
                headers: {
                    'x-api-key': import.meta.env.VITE_X_API_KEY,
                }
            });

            const data = await response.json();
            if (response.ok) {
                setOpenEndedQuestions(data); 
            } else {
                console.error('Failed to fetch questions');
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    };

    const options = assignments[activeTab] || [];
    const uniqueOptions = options.filter(
        (option, index, self) => self.findIndex(o => o.name === option.name) === index
    );

    return (
        <>
            <form>
                <div>
                    <Form className='d-flex gap-3'>
                        <div className="w-100">
                            <Form.Control
                                type="text"
                                name="loop_lead_first_name"
                                value={formData.loop_lead_first_name}
                                onChange={handleInputChange}
                                placeholder="Loop3d Lead First Name"
                                isInvalid={!!errors.loop_lead_first_name} // Shows error state for input
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.loop_lead_first_name}
                            </Form.Control.Feedback>
                        </div>
                        <div className="w-100">
                            <Form.Control
                                type="text"
                                name="loop_lead_last_name"
                                value={formData.loop_lead_last_name}
                                onChange={handleInputChange}
                                placeholder="Loop3d Lead Last Name"
                                isInvalid={!!errors.loop_lead_last_name} // Shows error state for input
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.loop_lead_last_name}
                            </Form.Control.Feedback>
                        </div>
                        <div className="w-100">
                            <Form.Control
                                type="email"
                                name="loop_lead_email"
                                value={formData.loop_lead_email}
                                onChange={handleInputChange}
                                placeholder="Loop3d Lead Email"
                                isInvalid={!!errors.loop_lead_email} // Shows error state for input
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.loop_lead_email}
                            </Form.Control.Feedback>
                        </div>
                    </Form>
                </div>

                {/* Competency Selection */}
                <div className="survey-tabs">
                    <div className="d-flex gap-3">
                        <button
                            type="button"
                            className={activeTab === "individual_contributor" ? "tab-active-color text-white" : "tab-no-active-color"}
                            onClick={() => handleTabChange("individual_contributor")}
                        >
                            Individual Contributor
                        </button>
                        <button
                            type="button"
                            className={activeTab === "people_manager" ? "tab-active-color text-white" : "tab-no-active-color"}
                            onClick={() => handleTabChange("people_manager")}
                        >
                            People Manager
                        </button>
                    </div>
                    <div>
                    {/* <Accordion defaultActiveKey="0">
                            <ul>
                                {uniqueOptions.map((option, index) => (
                                    <Accordion.Item key={option.id} eventKey={String(index)}>
                                        <Accordion.Header  onClick={(e) => {
                                                    fetchCategoriesById(option.id); // Custom logic for header click
                                                }}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCheckboxes.includes(option.id)}
                                                    onChange={() => handleCheckboxChange(option.name, option.id)}
                                                    disabled={!selectedCheckboxes.includes(option.id) && selectedCheckboxes.length >= 3}
                                                />
                                                <span className="ml-3">{option.name}</span>
                                            </label>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                        {selectedCategory && option.id == selectedCategory.category_id && (
                                                <div className="question-section">
                                                {(() => {
                                                    let i = 1; // Initialize a counter
                                                    return selectedCategory.questions.map((value) => (
                                                        <div key={value.question_id} className="question-item">
                                                            {value.questionType == "Radio" && (
                                                                <p>
                                                                    <span className="fw-bold">Q{i++}:</span> {value.questionText}
                                                                    <div className="question-actions ms-2">
                                                                        <Link
                                                                            onClick={() => {
                                                                                handleEditQuestion(value, selectedCategory.category_id);
                                                                            }}
                                                                            style={{ cursor: "pointer", color: "red" }}
                                                                        >
                                                                            ✏️
                                                                        </Link>
                                                                        <Link
                                                                            onClick={() =>
                                                                                handleQuestionDelete(value.question_id, option.id)
                                                                            }
                                                                            style={{ cursor: "pointer", color: "red" }}
                                                                        >
                                                                            ❌
                                                                        </Link>
                                                                    </div>
                                                                </p>
                                                            )}
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                            )}
                                            <Button
                                                variant="primary"
                                                onClick={() => handleOpenModal(option.id)}
                                                className='default-btn'

                                            // Trigger modal for question creation
                                            >
                                                + Add New Item
                                            </Button>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                ))}
                            </ul>
                        </Accordion> */}
                    
                    </div>

                    <div>
                        <ul className='survey-listings'>
                            {uniqueOptions.map((option) => (
                                <li key={option.id}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={selectedCheckboxes.includes(option.id)}
                                            onChange={() => handleCheckboxChange(option.name, option.id)}
                                            disabled={!selectedCheckboxes.includes(option.id) && selectedCheckboxes.length >= 3}
                                        />
                                        <span className="ml-3">{option.name}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {errors.competencies && <div className="text-danger">{errors.competencies}</div>}
                </div>

                {/* Submit Button */}
           
                {/* <OpenEndedQuestions activeTab={activeTab} openQuestions={openEndedQuestions} setOpenQuestions={setOpenEndedQuestions} fetchQuestions={fetchQuestions} organization_id={user?.organization} createdBy={user?._id} /> */}
                <div className="mt-4">
                    <button
                        type="button"
                        className="default-btn"
                        disabled={loader}
                        onClick={handleSubmit}
                    >
                        {loader ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
                {/* Display form error messages */}
                {errors.form && <div className="text-danger mt-3">{errors.form}</div>}
            </form>


            {/* <Modal show={showModal} onHide={() => { setShowModal(false), setQuestionFormData(''), setIsEdit(''), setEditId('') }} className='new-question'>
                <Modal.Header closeButton>
                    <Modal.Title>{isEdit ? "Edit Question" : "Create New Question"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleQuestionSubmit}>
                        <Container className="outer-box">
                            <Row>
                                <Col md={7}>
                                    <Form.Group className="mb-4">
                                        <Form.Label>Question Text</Form.Label><sup style={{ color: 'red' }}>*</sup>
                                        <Form.Control
                                            type="text"
                                            name="questionText"
                                            value={questionFormData.questionText}
                                            onChange={handleChange}
                                            placeholder="Enter question text"
                                        />
                                        {errors.questionText && <small className="text-danger">{errors.questionText}</small>}
                                    </Form.Group>
                                </Col>
                                <Col md={5}>
                                    <Form.Group className="mb-4">
                                        <Form.Label>Answer Type</Form.Label><sup style={{ color: 'red' }}>*</sup>
                                        <Form.Control
                                            
                                            as="select"
                                            name="questionType"
                                            value={questionFormData.questionType}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Type</option>
                                            <option value="Radio">Radio</option>
                                        </Form.Control>
                                        {errors.questionType && <small className="text-danger">{errors.questionType}</small>}
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                {questionFormData.questionType === 'Radio' && (
                                    <Col md={12}>
                                        <div className='question-contant w-100'>
                                            <h3 className="add-title">Answers</h3>
                                            <Button type="button" onClick={addOption} variant="primary" className='default-btn'>
                                                Add Option
                                            </Button>
                                        </div>
                                        <div className='question-from delete-option'>
                                            {questionFormData.options.map((option, index) => (
                                                <div key={index} className="mb-3 w-100">
                                                    <Row className='row-gap-3'>
                                                        <Col md={7} className='col-12'>
                                                            <Form.Control
                                                                type="text"
                                                                name="text"
                                                                className='w-100'
                                                                placeholder={`Option ${index + 1}`}
                                                                value={option.text}
                                                                onChange={(e) => handleOptionChange(index, e)}
                                                            />
                                                        </Col>
                                                        <Col md={3} className='col-9'>
                                                            <Form.Control
                                                                as="select"
                                                                name="weightage"
                                                                className='w-100'
                                                                value={option.weightage}
                                                                onChange={(e) => handleOptionChange(index, e)}
                                                            >
                                                                <option value="">Select weightage</option>
                                                                <option value="1">1</option>
                                                                <option value="2">2</option>
                                                                <option value="3">3</option>
                                                                <option value="4">4</option>
                                                                <option value="5">5</option>
                                                                <option value="6">6</option>
                                                                <option value="7">7</option>
                                                                <option value="8">8</option>
                                                                <option value="9">9</option>
                                                                <option value="10">10</option>
                                                            </Form.Control>
                                                            
                                                        </Col>
                                                        <Col md={2} className='col-3'>
                                                        <Button type="button" onClick={() => removeOption(index)} variant="danger">
                                                            <img src='/images/remove.png' alt='Remove' />
                                                        </Button>
                                                        </Col>
                                                    </Row>
                                                    
                                                </div>
                                            ))}
                                        </div>
                                        {errors.options && <small className="text-danger">{errors.options}</small>}
                                    </Col>
                                )}
                                <Col md={12}>
                                    <div className="profile-btns pt-0">
                                        <Button type="submit" className="default-btn">
                                            {isEdit ? "Update" : "Save"}
                                        </Button>
                                        <Button type="button" className="default-btn cancel-btn" onClick={() => { setShowModal(false), setQuestionFormData(''), setIsEdit(''), setEditId('') }}>
                                            Cancel
                                        </Button>
                                    </div>
                                    {errors.form && <p className="text-danger">{errors.form}</p>}
                                </Col>
                            </Row>
                        </Container>
                    </Form>
                </Modal.Body>
            </Modal> */}
        </>
    );
}
