// require('dotenv').config();
import React, { useEffect, useState } from 'react';
// import InputField from "../common/InputField";
import { useParams, useNavigate, } from 'react-router-dom';
import { Container, Form } from "react-bootstrap";
import { useSelector } from 'react-redux';
import AuthLayout from '../../../layout/Auth';
// require('dotenv').config();
export default function StartSurveyForm() {
    const user = useSelector((state) => state.auth.user); // Assuming the slice is named "auth"

    const router = useNavigate()
    const searchParams = useParams();
    const token = user?._id
    const [activeTab, setActiveTab] = useState("individual_contributor");
    const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
    const [formData, setFormData] = useState({
        loop_lead_name: "",
        loop_lead_email: "",
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
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

    // console.log(import.meta.env.VITE_PROXY_URL,'url')
    const getAssignments = async () => {
        try {
            const url = `${import.meta.env.VITE_PROXY_URL}/competencies/assign?user_id=${user?._id}`;
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
                    if (assignment?.category_id?.competency_type in categorizedAssignments) {
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: Check if all fields are filled
        if (!formData.loop_lead_name || !formData.loop_lead_email || selectedCheckboxes.length === 0) {
            setErrorMessage("Please fill out all required fields.");
            return;
        }

        // Prepare the payload
        const payload = {
            surveyData: {
                name: "Employee Satisfaction Survey", // Example name, you can update it as needed
                loop_leads: [
                    {
                        name: formData.loop_lead_name,
                        email: formData.loop_lead_email
                    }
                ],
                competencies: selectedCheckboxes, // Use IDs directly
                mgr_id: user?._id // Manager ID
            }
        };

        try {
            const response = await fetch(`${import.meta.env.VITE_PROXY_URL}/surveys/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': import.meta.env.VITE_X_API_KEY
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                const loopLeadId = data?.data?.surveys?.[0]?._id;
                if (loopLeadId) {
                    router('/manager/dashboard');
                }
                // setIsFormSubmitted(true); // Mark the form as submitted to replace the component
            } else {
                setErrorMessage("Failed to submit the form. Please try again.");
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setErrorMessage("An error occurred while submitting the form. Please try again.");
        }
    };

    // Render the thank you message if the form is submitted
    if (isFormSubmitted) {
        return (
            <Container className="my-[10rem]">
                <div className="lg:max-w-[1080px] mx-auto bg-white rounded-[20px] p-[20px] md:p-[40px]" style={{ boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.15)" }}>
                    <h1 className="text-[38px] md:text-[48px] mb-5 text-center font-frank">Thank You!</h1>
                    <p className="text-center text-[16px] font-poppins">Your registration is successful.</p>
                </div>
            </Container>
        );
    }

    const options = assignments[activeTab] || [];

    return (
        <>

            <form onSubmit={handleSubmit}>
                <div className="">
                    <Form className='d-flex gap-3'>
                        <div className="w-100">
                            <Form.Control
                                labelClass=""
                                className=""
                                label=""
                                type="text"
                                name="loop_lead_name"
                                value={formData.loop_lead_name}
                                onChange={handleInputChange}
                                placeholder="Looped Lead Name"
                            />
                        </div>
                        <div className="w-100">
                            <Form.Control
                                labelClass=""
                                className=""
                                label=""
                                type="email"
                                name="loop_lead_email"
                                value={formData.loop_lead_email}
                                onChange={handleInputChange}
                                placeholder="Looped Lead Email"
                            />
                        </div>
                    </Form>
                </div>
                
                {/* button tab */}
                <div className="survey-tabs">
                    <div className="d-flex gap-3">
                        <button
                            type="button"
                            className={`${activeTab === "individual_contributor"
                                ? "tab-active-color text-white"
                                : "tab-no-active-color"
                                }`}
                            onClick={() => handleTabChange("individual_contributor")}
                        >
                            Individual Contributor
                        </button>
                        <button
                            type="button"
                            className={`${activeTab === "people_manager"
                                ? "tab-active-color text-white"
                                : "tab-no-active-color"
                                }`}
                            onClick={() => handleTabChange("people_manager")}
                        >
                            People Manager
                        </button>
                    </div>

                    <div>
                        <ul className='survey-listings'>
                            {options.map((option) => (
                                <li key={option.id} className="">
                                    <label className="">
                                        <input
                                            type="checkbox"
                                            className=""
                                            checked={selectedCheckboxes.includes(option.id)}
                                            onChange={() => handleCheckboxChange(option.name, option.id)}
                                            disabled={
                                                !selectedCheckboxes.includes(option.id) &&
                                                selectedCheckboxes.length >= 3
                                            }
                                        />
                                        <span className="ml-3 text-black font-poppins">{option.name}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="mt-4">
                    <button
                        type="submit"
                        className="default-btn"
                    >
                        Submit
                    </button>
                </div>
                {/* Display the error message */}
                {errorMessage && (
                    <div className="">{errorMessage}</div>
                )}
            </form>

        </>
    );
}
