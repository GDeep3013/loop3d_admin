import React, { useState, useEffect } from 'react';
import AuthLayout from '../../../layout/Auth';
import { useNavigate } from "react-router-dom";
import { StatusIcon, PLusIcon } from "../../../components/svg-icons/icons";
import { Container, Pagination, Row, Col, Button, Modal, Form } from 'react-bootstrap';

import { Link } from "react-router-dom";
import { useSelector } from 'react-redux';

import Swal from 'sweetalert2';
import { View, Edit, Remove } from '../../../components/svg-icons/icons';
import Loading from '../../../components/Loading';

export default function CompetencyQuestionsListing({ cat_id }) {
  
  const option = [{ text: 'Always', weightage: 3 }, { text: 'Usually', weightage: 2 }, { text: 'Never', weightage: 1 }];
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [editId, setEditId] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    questionText: '',
    questionType: 'Radio', // 'Text' or 'Radio'
    options: option, // Added weightage
    createdBy: user?._id,
    currentCategoryId: cat_id,
  });
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getQuestions();
  }, [searchTerm, currentPage]);

  async function getQuestions() {
    setLoading(true);
    try {
      let url = `/api/questions/get-questions-by-Competency/${cat_id}?page=${currentPage}`;
      if (searchTerm) {
        url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
      }
      let result = await fetch(url, {
        headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
      });
      result = await result.json();
      setQuestions(result.questions);
      setTotalPages(result.meta.totalPages);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  const handlePaginationClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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
          getQuestions();
        } else {
          console.error('Failed to delete question');
        }
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };


  const handleOpenModal = (categoryId) => {
    setFormData({ ...formData, currentCategoryId: categoryId });
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

  // // Add a new option
  // const addOption = () => {
  //     setFormData({ ...formData, options: [...formData.options, { text: '', isCorrect: false, weightage: 1 }] });
  // };

  // // Remove an option
  // const removeOption = (index) => {
  //     const updatedOptions = formData.options.filter((_, i) => i !== index);
  //     setFormData({ ...formData, options: updatedOptions });
  // };

  // Handle form submission


  const handleEditQuestion = async (value, cat_id) => {

    setShowModal(true);
    setEditId(value?._id)
    setIsEdit(true);
    setFormData({
      questionText: value?.questionText || '', // Assign questionText or fallback to an empty string
      questionType: value?.questionType || '', // Assign questionType or fallback to an empty string
      options: value?.options || [{ text: 'Always', weightage: 3 }, { text: 'Usually', weightage: 2 }, { text: 'Never', weightage: 1 }], // Assign options or fallback to default
      createdBy: user?._id,
      currentCategoryId: cat_id,
      // Keep the current user ID
      // currentCategoryId: value?.currentCategoryId || null // Assign the category ID or fallback to null
    })

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
          title: editId ? `Question Updated Successfully!` : `Question Created Successfully!`,
          showConfirmButton: false,
          timer: 1500
        });
        setShowModal(false)

        getQuestions()
        setFormData({
          questionText: '',
          questionType: 'Radio', // 'Text' or 'Radio'
          options:option, 
          createdBy: user?._id,
          currentCategoryId: cat_id,
        })
        setErrors({});

      } else {
        setErrors({ form: data.error });
      }
    } catch (error) {
      setErrors({ form: 'Failed to save question' });
    }
  };
  return (
    <div>
      <div className='table-inner main-wrapper questions-page'>
        <div className='content-outer'>
          <div className='tabe-outer'>
            <div className='table-heading mt-3'>
              <Container>
                <Row>
                  <Col md={6}>
                  </Col>
                  <Col md={6} className='text-end p-0'>
                    <form className='d-flex justify-content-end'>
                      <input type='search' placeholder='Search...' value={searchTerm} onChange={handleSearch} className='form-control' />
                      <Button className="default-btn" onClick={() => { setShowModal(true); }}>Add Question <PLusIcon /> </Button>
                    </form>
                  </Col>
                </Row>
              </Container>
            </div>
          </div>
        </div>
        <div className='table-scroll  shadow-border-wrapper'>
          <table className='table'>
            <thead>
              <tr>
                <th>Serial No.</th>
                <th>Question</th>
                <th>Type</th>
                <th>Status <StatusIcon /> </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>

              {loading && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>
                    <Loading />
                  </td>
                </tr>)
              }

              {!loading && questions.length === 0 &&
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>
                    <h4>No Questions Found</h4>
                  </td>
                </tr>
              }

              {!loading && questions.length > 0 && questions?.map((question, ind) => (

                <tr key={question?.question_id?._id}>
                  <td>{(currentPage - 1) * 10 + (ind + 1)}</td>
                  <td>
                    {question?.question_id?.questionText}
                  </td>
                  <td>
                    {question?.question_id?.questionType}
                  </td>
                  <td><span className='span-badge active-tag'>Active</span></td>
                  <td>
                    <button className='action-btn' onClick={() => { handleEditQuestion(question?.question_id, cat_id) }}><Edit /></button>
                    <button className='action-btn' onClick={() => handleDelete(question?.question_id?._id)}><Remove /></button>
                    {/* <Dropdown className='custom-dropdown'>
                            <Dropdown.Toggle variant="success" id="dropdown-basic">
                              <MoreIcon />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => navigate(`/questions/detail/${question._id}`)}>View</Dropdown.Item>
                             <Dropdown.Item onClick={() => navigate(`/questions/${question._id}`)}>Edit</Dropdown.Item>
                              <Dropdown.Item onClick={() => handleDelete(question._id)}>Delete</Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown> */}
                  </td>
                </tr>
              ))
              }
            </tbody>
          </table>

        </div>
      </div>
      {totalPages > 1 && (
        <Pagination className='justify-content-center pagination-outer'>
          <Pagination.First onClick={() => handlePaginationClick(1)} disabled={currentPage === 1} />
          <Pagination.Prev onClick={() => handlePaginationClick(currentPage - 1)} disabled={currentPage === 1} />
          {[...Array(totalPages).keys()].map(page => (
            <Pagination.Item
              key={page + 1}
              className='link-page'
              active={page + 1 === currentPage}
              onClick={() => handlePaginationClick(page + 1)}
            >
              {page + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next onClick={() => handlePaginationClick(currentPage + 1)} disabled={currentPage === totalPages} />
          <Pagination.Last onClick={() => handlePaginationClick(totalPages)} disabled={currentPage === totalPages} />
        </Pagination>
      )}

      <Modal show={showModal} onHide={() => {
        setShowModal(false),
          setFormData({
            questionText: '',
            questionType: 'Radio', // 'Text' or 'Radio'
            options: [{ text: '', weightage: 1 }, { text: '', weightage: 1 }, { text: '', weightage: 1 }], // Added weightage
            createdBy: user?._id,
            currentCategoryId: null,
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