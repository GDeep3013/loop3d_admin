import React, { useState, useEffect } from 'react';
import { Table, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { Edit, Remove } from '../../../components/svg-icons/icons';
import CompletionManagement from '../plan/CompletionManagement';

const GoalListing = ({ goals, getGoals,handleScrollToTop, categories, setCompetencyFrom, setChatResponse, buttonClicked, setButtonClicked, buttonText, setButtonText }) => {
    const [editingGoalId, setEditingGoalId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState({});
    const [selectedGoalIds, setSelectedGoalIds] = useState([]);
    const [formData, setFormData] = useState({
        specific_goal: '',
        dead_line: '',
        competency: '',
        goal_apply: '',
        goal_result_seen: '',
        status: '',
    });
    const [errors, setErrors] = useState({});

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.specific_goal?.trim()) {
            newErrors.specific_goal = "Specific goal is required.";
        }

        if (!formData.dead_line?.trim()) {
            newErrors.dead_line = "Deadline is required.";
        } else if (isNaN(Date.parse(formData.dead_line))) {
            newErrors.dead_line = "Please provide a valid date.";
        }
        if (formData.status == 'Complete') {
            if (!formData.goal_apply?.trim()) {
                newErrors.goal_apply = "Goal application information is required.";
            }
            if (!formData.goal_result_seen?.trim()) {
                newErrors.goal_result_seen = "Goal result expectation is required.";
            }
        }


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Returns true if no errors
    };



    const handleDelete = async (e, id) => {
        try {
            const confirmResult = await Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#000",
                cancelButtonColor: "#d26c6c",
                confirmButtonText: "Yes, delete it!",
            });
            if (confirmResult.isConfirmed) {
                const response = await fetch(`/api/plans/delete/${id}`, {
                    method: 'DELETE',
                    headers: { "x-api-key": import.meta.env.VITE_X_API_KEY },
                });
                if (response.ok) {
                    await Swal.fire({
                        title: "Deleted!",
                        text: "Your goal has been deleted.",
                        icon: "success",
                        confirmButtonColor: "#000",
                    });
                    getGoals();
                } else {
                    console.error('Failed to delete goal');
                }
            }
        } catch (error) {
            console.error('Error deleting goal:', error);
        }
    };

    const getBackgroundColor = (status) => {
        switch (status) {
            case 'Complete':
                return '#d9ead3';
            case 'Not Started':
                return '#f4cccc';
            case 'Started':
                return '#fff2cc';
            default:
                return 'transparent';
        }
    };

    const handleEditClick = (goal) => {
        setEditingGoalId(goal._id);
        setFormData({
            specific_goal: goal.specific_goal,
            dead_line: new Date(goal.dead_line).toISOString().split("T")[0], // Format to YYYY-MM-DD
            competency: goal.competency._id, // Store the competency ID
            goal_apply: goal.goal_apply,
            goal_result_seen: goal.goal_result_seen,
            status: goal.status,
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };


    const handleSubmit = async (id) => {
        try {
            if (validateForm()) {
                const response = await fetch(`/api/plans/update/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        "x-api-key": import.meta.env.VITE_X_API_KEY,
                    },
                    body: JSON.stringify(formData),
                });

                // Check if the update was successful
                if (response.ok) {
                    getGoals(); // Refetch goals after updating

                    const updatedGoal = await response.json(); // Parse the updated goal data

                    // Show modal if status is "Complete"
                    if (formData.status === 'Complete') {
                        setSelectedGoal({
                            specific_goal: updatedGoal?.specific_goal || formData.specific_goal, // Use response or fallback to formData
                            competency: updatedGoal?.competency?.category_name || "N/A", // Safely handle competency name
                        });
                        setShowModal(true); // Show modal
                        setEditingGoalId(null);
                    } else {
                        setShowModal(false);
                        setEditingGoalId(null);// Hide modal if not "Complete"
                    }
                } else {
                    console.error('Failed to update goal');
                    setShowModal(false); // Ensure modal is hidden on failure
                }
            }
        } catch (error) {
            console.error('Error updating goal:', error);
            setShowModal(false); // Hide modal in case of error
        }
    };
    const handleCheckboxChange = (goalId) => {
        setSelectedGoalIds(prevSelectedGoalIds =>
            prevSelectedGoalIds.includes(goalId)
                ? prevSelectedGoalIds.filter(id => id !== goalId)
                : [...prevSelectedGoalIds, goalId]
        );
        setButtonText("Confirm")

    };

    const formatGoalsWithStatus = (goals) => {
        return goals.map((goal, index) =>
            `${goal.specific_goal}\n\ncompetency:${goal.competency.category_name}\nStatus: ${goal.status}`
        ).join('\n\n');

    };

    useEffect(() => {
        if (goals && goals.length > 0) {
            const allGoalIds = goals.map(goal => goal._id);
            setSelectedGoalIds(allGoalIds);
        }
    }, [goals]);



    return (
        <div className="mt-5 plan_content goal-listing">
            <div className='table-scroll'>
                <Table striped bordered hover className='goal-list-outer goal-list-contant'>
                    <thead>
                        <tr>
                            <th colSpan="8" className="text-center">Goals</th>
                        </tr>
                        <tr>
                            <th>#</th>
                            <th>Specific Goal</th>
                            <th>Deadline</th>
                            <th>Relevant Competency</th>
                            <th>How have you applied it?</th>
                            <th>What results have you seen from it?</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {goals.length > 0 && goals.map((goal, index) => (
                            <tr key={goal._id || index}>
                                <td>
                                    {buttonClicked ? ( // Check if button has been clicked
                                        <Form.Check
                                            type="checkbox"
                                            checked={selectedGoalIds.includes(goal._id)}
                                            onChange={() => handleCheckboxChange(goal._id)}
                                        />
                                    ) : (
                                        index + 1 // Display "No" if the button has not been clicked
                                    )}
                                </td>
                                <td style={{ width: '18%' }}>
                                    {editingGoalId === goal._id ? (<>
                                        <Form.Control
                                            type="text"
                                            name="specific_goal"
                                            value={formData.specific_goal}
                                            onChange={handleInputChange}
                                        />
                                        {errors.specific_goal && <small className="text-danger">{errors.specific_goal}</small>}
                                    </>) : (
                                        <p>{goal.specific_goal}</p>
                                    )}
                                </td>
                                <td>
                                    {editingGoalId === goal._id ? (<>
                                        <Form.Control
                                            type="date"
                                            name="dead_line"
                                            value={formData.dead_line}
                                            onChange={handleInputChange}
                                        />
                                        {errors.dead_line && <small className="text-danger">{errors.dead_line}</small>}
                                    </>
                                    ) : (
                                        formatDate(goal.dead_line)
                                    )}
                                </td>
                                <td>
                                    {/* {editingGoalId === goal._id ? (
                                        <Form.Control
                                            as="select"
                                            name="competency"
                                            value={formData.competency}
                                            onChange={handleInputChange}
                                        >
                                            {categories.map(category => (
                                                <option key={category._id} value={category._id}>{category.category_name}</option>
                                            ))}
                                        </Form.Control>
                                    ) : ( */}
                                    {goal.competency.category_name}
                                    {/* )} */}
                                </td>
                                <td>
                                    {editingGoalId === goal._id ? (
                                        <>

                                            <Form.Control
                                                type="text"
                                                name="goal_apply"
                                                value={formData.goal_apply}
                                                onChange={handleInputChange}
                                                maxLength={100}
                                            />
                                            {errors.goal_apply && <small className="text-danger">{errors.goal_apply}</small>}
                                        </>
                                    ) : (
                                        goal.goal_apply
                                    )}
                                </td>
                                <td>
                                    {editingGoalId === goal._id ? (
                                        <>

                                            <Form.Control
                                                type="text"
                                                name="goal_result_seen"
                                                value={formData.goal_result_seen}
                                                onChange={handleInputChange}
                                                maxLength={100}

                                            />
                                            {errors.goal_result_seen && <small className="text-danger">{errors.goal_result_seen}</small>}
                                        </>
                                    ) : (
                                        goal.goal_result_seen
                                    )}
                                </td>
                                <td style={{ backgroundColor: getBackgroundColor(goal.status) }}>
                                    {editingGoalId === goal._id ? (
                                        <Form.Control
                                            as="select"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                        >
                                            <option value="Not Started">Not Started</option>
                                            <option value="Started">Started</option>
                                            <option value="Complete">Complete</option>
                                        </Form.Control>

                                    ) : (
                                        goal.status
                                    )}
                                </td>
                                <td>
                                    {editingGoalId === goal._id ? (
                                        <Button variant="primary" title='update' onClick={() => handleSubmit(goal._id)}>Update</Button>
                                    ) : (<div className='d-flex'>
                                        <button className='action-btn' title='edit' onClick={() => handleEditClick(goal)}><Edit /></button>
                                        <button className='action-btn' title='delete' onClick={(e) => handleDelete(e, goal._id)}><Remove /></button>
                                    </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
            <div className='completion-management plan_content'>
                <div className="grp-btn d-flex">
                    {/* <Button variant="primary" className="w-50 me-2 " disabled={!showModal} onClick={() => {
                        setCompetencyFrom(selectedGoal?.specific_goal); const formattedGoals = formatGoalsWithStatus(goals); // Format the goals and statuses
                        setChatResponse(formattedGoals);
                    }} > I want to keep working on {selectedGoal?.competency}</Button> */}

                    <Button
                        variant="primary"
                        className="w-50 me-2"
                        onClick={() => {
                            setButtonClicked(true);
                            const formattedGoals = formatGoalsWithStatus(goals.filter(goal => selectedGoalIds.includes(goal._id)));
                            setChatResponse(formattedGoals);
                            setButtonText("I want to keep working on selected goals")
                        }}
                        disabled={selectedGoalIds.length === 0}
                    >
                     I want to keep working on selected goals
                    </Button>

                   <Button variant="secondary" className="w-50 ml-0 "><a href='#plan-main' style={{ color: 'white' }}> I want to work on other competencies. </a></Button>
                </div>
            </div>
        </div>
    );
};

export default GoalListing;
