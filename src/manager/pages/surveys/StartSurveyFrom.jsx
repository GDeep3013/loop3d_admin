import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form } from "react-bootstrap";
import { useSelector } from 'react-redux';

export default function StartSurveyForm() {
    const user = useSelector((state) => state.auth.user);
    const router = useNavigate();
    const searchParams = useParams();
    const token = user?._id;

    const [activeTab, setActiveTab] = useState("individual_contributor");
    const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
    const [formData, setFormData] = useState({
        loop_lead_name: "",
        loop_lead_email: "",
    });
    const [loader, setLoader] = useState(false);
    const [errors, setErrors] = useState({
        loop_lead_name: "",
        loop_lead_email: "",
        competencies: ""
    });

    const [assignments, setAssignments] = useState({
        individual_contributor: [],
        people_manager: []
    });

    const handleCheckboxChange = (label, id) => {
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
        if (!formData.loop_lead_name.trim()) {
            newErrors.loop_lead_name = "Loop lead name is required.";
            formIsValid = false;
        }

        // Validate Loop Lead Email
        if (!formData.loop_lead_email.trim()) {
            newErrors.loop_lead_email = "Loop lead email is required.";
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
                        name: formData.loop_lead_name,
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

    const options = assignments[activeTab] || [];

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div>
                    <Form className='d-flex gap-3'>
                        <div className="w-100">
                            <Form.Control
                                type="text"
                                name="loop_lead_name"
                                value={formData.loop_lead_name}
                                onChange={handleInputChange}
                                placeholder="Loop Lead Name"
                                isInvalid={!!errors.loop_lead_name} // Shows error state for input
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.loop_lead_name}
                            </Form.Control.Feedback>
                        </div>
                        <div className="w-100">
                            <Form.Control
                                type="email"
                                name="loop_lead_email"
                                value={formData.loop_lead_email}
                                onChange={handleInputChange}
                                placeholder="Loop Lead Email"
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
                        <ul className='survey-listings'>
                            {options.map((option) => (
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
                <div className="mt-4">
                    <button
                        type="submit"
                        className="default-btn"
                        disabled={loader}
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
