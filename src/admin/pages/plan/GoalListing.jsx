import React, { useState } from 'react';
import { Table, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { Edit, Remove } from '../../../components/svg-icons/icons';
import CompletionManagement from '../plan/CompletionManagement';

const GoalListing = ({ goals, getGoals, categories, setCompetencyFrom, setChatResponse }) => {
    const [editingGoalId, setEditingGoalId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState({});


    const [formData, setFormData] = useState({
        specific_goal: '',
        dead_line: '',
        competency: '',
        goal_apply: '',
        goal_result_seen: '',
        status: '',
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
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
            // Send the update request
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
        } catch (error) {
            console.error('Error updating goal:', error);
            setShowModal(false); // Hide modal in case of error
        }
    };



    const handleCloseModal = () => setShowModal(false);

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
                            <td>{ index+1}</td>
                            <td style={{ width: '18%' }}>
                                {editingGoalId === goal._id ? (
                                    <Form.Control
                                        type="text"
                                        name="specific_goal"
                                        value={formData.specific_goal}
                                        onChange={handleInputChange}
                                    />
                                ) : (
                                    <p>{goal.specific_goal}</p>
                                )}
                            </td>
                            <td>
                                {editingGoalId === goal._id ? (
                                    <Form.Control
                                        type="date"
                                        name="dead_line"
                                        value={formData.dead_line}
                                        onChange={handleInputChange}
                                    />
                                ) : (
                                    formatDate(goal.dead_line)
                                )}
                            </td>
                            <td>
                                {editingGoalId === goal._id ? (
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
                                ) : (
                                    goal.competency.category_name
                                )}
                            </td>
                            <td>
                                {editingGoalId === goal._id ? (
                                    <Form.Control
                                        type="text"
                                        name="goal_apply"
                                        value={formData.goal_apply}
                                        onChange={handleInputChange}
                                        maxLength={100}
                                    />
                                ) : (
                                    goal.goal_apply
                                )}
                            </td>
                            <td>
                                {editingGoalId === goal._id ? (
                                    <Form.Control
                                        type="text"
                                        name="goal_result_seen"
                                        value={formData.goal_result_seen}
                                        onChange={handleInputChange}
                                        maxLength={100}

                                    />
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
                    <Button variant="primary" className="w-50 me-2 " disabled={!showModal}  onClick={() => { setCompetencyFrom(selectedGoal?.specific_goal); setChatResponse(selectedGoal?.specific_goal);}} > I want to keep working on {selectedGoal?.competency}</Button>
                    <Button variant="secondary" className="w-50 ml-0" disabled={!showModal}>  I want to work on other competencies. </Button>
                </div>
            </div>
            {/* {showModal && (
                <CompletionManagement
                    show={showModal}
                    onHide={handleCloseModal}
                    specificGoal={selectedGoal.specific_goal}
                    competency={selectedGoal.competency}
                    setChatResponse={setChatResponse}
                    setCompetencyFrom={setCompetencyFrom}
                />
            )} */}

        </div>
    );
};

export default GoalListing;
