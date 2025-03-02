import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Tab, Tabs, Accordion, Button, Modal, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2'

export default function StartSurveyForm() {
    const user = useSelector((state) => state.auth.user);
    const router = useNavigate();

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
    const [userDetails, setUserDetails] = useState(null);
    const [existsEmailError,setExistsEmailError] = useState('');
    const [openEndedQuestions, setOpenEndedQuestions] = useState([]);

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
    const checkUser = async (email) => {
        try {
            const response = await fetch(`/api/users/check-user?email=${email}&org_id=${user?.organization?._id}`, {
                headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.exists) {
                    setUserDetails(data.userDetails);
                    setExistsEmailError('Email already exists. Please use a different email.');
               
                } else {
                    setExistsEmailError('')

                }
            } else {
                setExistsEmailError('')
            }
        } catch (error) {
            console.error("Error checking user:", error);
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
        setErrors({ ...errors, [name]: "" });
        if (name=="loop_lead_email") {
            checkUser(value)
        }
    };

    const validateForm = () => {
        let formIsValid = true;
        const newErrors = {};

        // Validate Loop Lead Name
        if (!formData.loop_lead_first_name.trim()) {
            newErrors.loop_lead_first_name = "LOOP3D first name is required.";
            formIsValid = false;
        }
        else if (!/^[a-zA-Z\s-]+$/.test(formData.loop_lead_first_name)) {
            newErrors.loop_lead_first_name = "LOOP3D lead name can only contain letters, spaces, and dashes.";
            formIsValid = false;
        }

        if (!formData.loop_lead_last_name.trim()) {
            newErrors.loop_lead_last_name = "LOOP3D Last name is required.";
            formIsValid = false;
        }
        else if (!/^[a-zA-Z\s-]+$/.test(formData.loop_lead_last_name)) {
            newErrors.loop_lead_last_name = "LOOP3D lead name can only contain letters, spaces, and dashes.";
            formIsValid = false;
          }

        // Validate Loop Lead Email
        if (!formData.loop_lead_email.trim()) {
            newErrors.loop_lead_email = "LOOP3D lead email is required.";
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
        if (existsEmailError) {
            return;
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
                                placeholder="LOOP3D Lead First Name"
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
                                placeholder="LOOP3D Lead Last Name"
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
                                placeholder="LOOP3D Lead Email"
                                isInvalid={!!errors.loop_lead_email} // Shows error state for input
                            />
                            {existsEmailError && <div className="text-danger" style={{ marginTop: "5px;" }}>{existsEmailError}</div>}

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


        </>
    );
}
