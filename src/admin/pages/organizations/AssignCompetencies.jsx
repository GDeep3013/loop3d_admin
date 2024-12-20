import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Tab, Tabs,Spinner, Accordion, Button, Modal, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getAssignmentsByUserAndOrg, createAssignCompetency } from "../../../apis/assignCompetencyApi";
import { Edit, Remove } from '../../../components/svg-icons/icons'; // Importing edit and delete icons from React Icons
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import OpenEndedQuestions from "./OpenEndedQuestions";
export default function AssignCompetencies({ data, type }) {
    const [activeTab, setActiveTab] = useState("individualContributor");
    const [competencies, setCompetencies] = useState([]);
    const [selectedCompetencies, setSelectedCompetencies] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = useSelector((state) => state.auth.user);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [editId, setEditId] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [openEndedQuestions, setOpenEndedQuestions] = useState([]);

    const [formData, setFormData] = useState({
        questionText: '',
        questionType: 'Radio', // 'Text' or 'Radio'
        options: [{ text: '', weightage: 1 }, { text: '', weightage: 1 }, { text: '', weightage: 1 }],
        createdBy: user?._id,
        currentCategoryId: null,
        organization_id: data?.ref_id
    });

    const [errors, setErrors] = useState({});
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [newQuestionText, setNewQuestionText] = useState('');
    const [currentCategoryId, setCurrentCategoryId] = useState('');

    useEffect(() => {
        if (data?.ref_id) {
            getAllCategory();
            getCategory();
            fetchQuestions(data?.ref_id)
        }
    }, [data?.ref_id, searchTerm]);

    // Fetch all categories
    async function getAllCategory() {
        setLoading(true);
        try {
            let url = `/api/categories/get-category-orgid/${data?.ref_id}`;
            if (searchTerm) {
                url += `?searchTerm=${encodeURIComponent(searchTerm)}`;
            }
            let result = await fetch(url, {
                headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
            });
            result = await result.json();
            setCategories(result.categories);
            setLoading(false);

        } catch (error) {
            setLoading(false);

            console.error(error);
        }
    }

    // Fetch assignments by user and organization
    async function getCategory() {
        try {
            const result = await getAssignmentsByUserAndOrg(user?._id, data?.ref_id, type);
            setCompetencies(result.assignments || []);
            setSelectedCompetencies(result.assignments?.map(assignment => assignment?.category_id?._id) || []);

        } catch (error) {
            console.error(error);
        }
    }

    // Handle checkbox change for competencies
    const handleCheckboxChange = async (categoryId) => {
        const isAssigned = selectedCompetencies.includes(categoryId);


        const action = isAssigned ? 'unassign' : 'assign';

        if (isAssigned && selectedCompetencies.length <= 3) {
            setError('You must keep at least 3 competencies selected.');
            return;
        } else {
            setError('');
        }

        try {
            const response = await createAssignCompetency({
                action,
                type,
                user_id: user?._id,
                ref_id: data?.ref_id,
                category_id: categoryId,
            });

            if (response) {
                if (!isAssigned) {
                    setSelectedCompetencies([...selectedCompetencies, categoryId]);
                }
                getCategory();
                fetchCategoriesById(categoryId);

            } else {
                console.error(`Error ${isAssigned ? 'unassigning' : 'assigning'} competency`);
            }
        } catch (error) {
            console.error(`Error ${isAssigned ? 'unassigning' : 'assigning'} competency:`, error);
        }
    };


    const fetchQuestions = async (organization_id) => {
        try {
            const response = await fetch(`/api/questions/get-openended-question?organization_id=${organization_id}&type=OpenEnded&activeTab=${activeTab}`, {
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

    // Fetch categories by category ID (to get questions)
    async function fetchCategoriesById(categoryId) {
        try {
            const response = await fetch(`/api/competencies/get-questions?org_id=${data?.ref_id}&cat_id=${categoryId}`, {
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
        } finally {
        }
    }

    // Handle opening the modal for creating a question
    const handleOpenModal = (categoryId) => {
        setFormData({
            questionText: '',
            questionType: 'Radio', // 'Text' or 'Radio'
            options: [{ text: '', weightage: 1 }, { text: '', weightage: 1 }, { text: '', weightage: 1 }], // Added weightage
            createdBy: user?._id,
            currentCategoryId: categoryId,
            organization_id: data?.ref_id

        });
        setShowModal(true); // Show the modal
    };


    // Form validation
    const validateForm = (data) => {
        let validationErrors = {};

        if (!data.questionText.trim()) {
            validationErrors.questionText = 'Question text is required';
        }

        if (!data.questionType) {
            validationErrors.questionType = 'Answer type is required';
        }

        if (data.questionType === 'Radio') {
            // Check if there are at least 3 options
            if (data.options.length < 3) {
                validationErrors.options = 'At least 3 options are required';
            } else {
                // Check that each option has a non-empty text value
                const emptyOption = data.options.find(option => !option.text.trim());
                if (emptyOption) {
                    validationErrors.options = 'At least 3 options are required';
                }
            }
        }
        return validationErrors;
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "questionType" && value === "Text") {
            setFormData({ ...formData, [name]: value, options: [] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
        setErrors({});
    };

    // Handle option change
    const handleOptionChange = (index, e) => {
        const { name, value, checked } = e.target;
        const updatedOptions = [...formData.options];

        updatedOptions[index][name] = name === 'isCorrect' ? checked : value;


        setFormData({ ...formData, options: updatedOptions });
    };

    // Add a new option
    const addOption = () => {
        setFormData({ ...formData, options: [...formData.options, { text: '', isCorrect: false, weightage: 1 }] });
    };

    // Remove an option
    const removeOption = (index) => {
        const updatedOptions = formData.options.filter((_, i) => i !== index);
        setFormData({ ...formData, options: updatedOptions });
    };

    // Handle form submission
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
                    title: `Question Created Successfully!`,
                    showConfirmButton: false,
                    timer: 1500
                });
                setShowModal(false)

                fetchCategoriesById(currentCategoryId ? currentCategoryId : formData.currentCategoryId)
                setFormData({
                    questionText: '',
                    questionType: 'Radio', // 'Text' or 'Radio'
                    options: [{ text: '', weightage: 1 }, { text: '', weightage: 1 }, { text: '', weightage: 1 }], // Added weightage
                    createdBy: user?._id,
                    currentCategoryId: null,
                    organization_id: data?.ref_id

                })
            } else {
                setErrors({ form: data.error });
            }
        } catch (error) {
            setErrors({ form: 'Failed to save question' });
        }
    };
    // const handleQuestionDelete = async (e, id, categoryId) => {
    //     e.preventDefault();
    //     console.log('hello')
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

    const handleDelete = async (id, categoryId) => {
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
                    fetchCategoriesById(categoryId);
                } else {
                    console.error('Failed to delete question');
                }
            }
        } catch (error) {
            console.error('Error deleting question:', error);
        }
    };

    const handleEditQuestion = async (value, cat_id) => {
        // console.log(value)
        setShowModal(true);
        setEditId(value?.question_id)
        setIsEdit(true);
        setCurrentCategoryId(cat_id);
        setFormData({
            questionText: value?.questionText || '', // Assign questionText or fallback to an empty string
            questionType: value?.questionType || '', // Assign questionType or fallback to an empty string
            options: value?.options || [{ text: '', weightage: 1 }, { text: '', weightage: 1 }, { text: '', weightage: 1 }], // Assign options or fallback to default
            createdBy: user?._id,
            organization_id: data?.ref_id
            // Keep the current user ID
            // currentCategoryId: value?.currentCategoryId || null // Assign the category ID or fallback to null
        })
    };
    const handleTabSelect = (key) => {
        setActiveTab(key);

    };
    console.log('data?.ref_id', data?.ref_id)
    // console.log(formData)
    return (
        loading?<div className="loading-spinner">
            <Spinner animation="border" variant="primary" />
        </div>:
            <div className="content-outer pd-2 edit-org tab-design">
                <Tabs onSelect={handleTabSelect} defaultActiveKey="individualContributor" className="mb-3">
                    {/* Individual Contributor Tab */}
                    <Tab eventKey="individualContributor" title="Individual Contributor">
                        <div className="list-scroll">
                            <h3>Individual Contributor</h3>
                            <Accordion defaultActiveKey="0">
                                {categories?.filter(data => data?.category?.competency_type === "individual_contributor" && data?.category?.status !== "inactive")
                                    .reduce((uniqueCategories, data) => {
                                        // Check if the category_name is already in the uniqueCategories array
                                        if (!uniqueCategories.some(c => c.category?.category_name === data?.category?.category_name)) {
                                            uniqueCategories.push(data);
                                        }
                                        return uniqueCategories;
                                    }, [])
                                    .map((data) => (
                                        <Accordion.Item key={data?.category?._id} eventKey={data?.category?._id}>
                                            <Accordion.Header onClick={(e) => {
                                                fetchCategoriesById(data?.category?._id); // Custom logic for header click
                                            }} >
                                                <label onClick={() => { fetchCategoriesById(data?.category?._id); }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCompetencies.includes(data?.category?._id)}
                                                        onChange={() => handleCheckboxChange(data?.category?._id)}
                                                    />
                                                    <span>{data?.category?.category_name.trimStart()}</span>
                                                </label>
                                            </Accordion.Header>
                                            <Accordion.Body>
                                                {selectedCategory && data?.category?._id == selectedCategory.category_id && (
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
                                                                                        handleDelete(value.question_id, selectedCategory.category_id)
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
                                                    onClick={() => handleOpenModal(data?.category?._id)}
                                                    className='default-btn'

                                                // Trigger modal for question creation
                                                >
                                                    + Add New Item
                                                </Button>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    ))}
                            </Accordion>
                        </div>
                        <div>
                            <OpenEndedQuestions activeTab={activeTab} openQuestions={openEndedQuestions} setOpenQuestions={setOpenEndedQuestions} fetchQuestions={fetchQuestions} organization_id={data?.ref_id} createdBy={user?._id} />
                        </div>
                    </Tab>

                    {/* People Manager Tab */}
                    <Tab eventKey="peopleManager" title="People Manager">
                        <div className="list-scroll new-tab-design">
                            <h3>People Manager</h3>
                            <Accordion defaultActiveKey="0">
                                {categories?.filter(data => data?.category?.competency_type === "people_manager" && data?.category?.status !== "inactive")
                                    .reduce((uniqueCategories, data) => {
                                        // Check if the category_name is already in the uniqueCategories array
                                        if (!uniqueCategories.some(c => c.category?.category_name === data?.category?.category_name)) {
                                            uniqueCategories.push(data);
                                        }
                                        return uniqueCategories;
                                    }, [])
                                    ?.map((data) => (
                                        <Accordion.Item key={data?.category?._id} eventKey={data?.category?._id}>
                                            <Accordion.Header onClick={(e) => {
                                                fetchCategoriesById(data?.category?._id); // Custom logic for header click
                                            }} >
                                                <label >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCompetencies.includes(data?.category?._id)}
                                                        onChange={() => handleCheckboxChange(data?.category?._id)}
                                                    />
                                                    <span>{data?.category?.category_name.trimStart()}</span>
                                                </label>
                                            </Accordion.Header>
                                            <Accordion.Body>
                                                {selectedCategory && data?.category?._id == selectedCategory.category_id && (
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
                                                                                        handleDelete(value.question_id, selectedCategory.category_id)
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
                                                    onClick={() => handleOpenModal(data?.category?._id)}
                                                    className='default-btn'
                                                // Trigger modal for question creation
                                                >
                                                    + Add New Item
                                                </Button>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    ))}
                            </Accordion>
                        </div>
                        <div>
                            <OpenEndedQuestions activeTab={activeTab} openQuestions={openEndedQuestions} setOpenQuestions={setOpenEndedQuestions} fetchQuestions={fetchQuestions} organization_id={data?.ref_id} createdBy={user?._id} />
                        </div>
                    </Tab>
                </Tabs>

                {/* Bootstrap Modal for Creating Question */}
                <Modal show={showModal} onHide={() => {
                    setShowModal(false),
                        setFormData({
                            questionText: '',
                            questionType: 'Radio', // 'Text' or 'Radio'
                            options: [{ text: '', weightage: 1 }, { text: '', weightage: 1 }, { text: '', weightage: 1 }], // Added weightage
                            createdBy: user?._id,
                            currentCategoryId: null,
                            organization_id: data?.ref_id

                        });
                    setIsEdit(''),
                        setEditId('')
                }} className='new-question'>
                    <Modal.Header closeButton>
                        <Modal.Title>{isEdit ? "Edit Question" : "Create New Question"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleSubmit}>
                            <Container className="outer-box">
                                <Row>
                                    <Col md={11}>
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
                                        <div className='question-contant w-100'>
                                            <h3 className="add-title">Answers</h3>
                                            {/* <Button type="button" onClick={addOption} variant="primary" className='default-btn'>
                                                            Add Option
                                                        </Button> */}
                                        </div>
                                        <div className='question-from delete-option'>
                                            {formData.options.map((option, index) => (
                                                <div key={index} className="mb-3 w-100">
                                                    <Row className='row-gap-3'>
                                                        <Col md={8} className='col-12'>
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
                                                        {/* <Col md={2} className='col-3'>
                                                                    <Button type="button" onClick={() => removeOption(index)} variant="danger">
                                                                        <img src='/images/remove.png' alt='Remove' />
                                                                    </Button>
                                                                    </Col> */}
                                                    </Row>

                                                </div>
                                            ))}
                                        </div>
                                        {errors.options && <small className="text-danger">{errors.options}</small>}
                                    </Col>

                                    <Col md={12}>
                                        <div className="profile-btns pt-0">
                                            <Button type="submit" className="default-btn">
                                                {isEdit ? "Update" : "Save"}
                                            </Button>
                                            <Button type="button" className="default-btn cancel-btn" onClick={() => {
                                                setShowModal(false),
                                                    setFormData({
                                                        questionText: '',
                                                        questionType: 'Radio', // 'Text' or 'Radio'
                                                        options: [{ text: '', weightage: 1 }, { text: '', weightage: 1 }, { text: '', weightage: 1 }], // Added weightage
                                                        createdBy: user?._id,
                                                        currentCategoryId: null,
                                                        organization_id: data?.ref_id
                        
                                                    });
                                                setIsEdit(''),
                                                    setEditId('')
                                            }}>
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
}
