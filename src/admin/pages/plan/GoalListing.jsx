import React from 'react'
import { Table, Button } from 'react-bootstrap';
import Swal from 'sweetalert2'

const GoalListing = ({ goals ,getGoals}) => {

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };   

    const handleDelete = async (e,id) => {
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
                const response = await fetch(`/api/plans/delete/${id}`, {
                    method: 'DELETE',
                    headers: { "x-api-key": import.meta.env.VITE_X_API_KEY }
                });
                if (response.ok) {
                    await Swal.fire({
                        title: "Deleted!",
                        text: "Your file has been deleted.",
                        icon: "success",
                        confirmButtonColor: "#000",
                    });
                    getGoals()
                } else {
                    console.error('Failed to delete user');
                }
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    return (
        <div className="mt-5">
            <Table striped bordered hover className='goal-list-outer goal-list-contant'>
                <thead>
                    <tr>
                        <th colSpan="6" className="text-center">Goals</th>
                    </tr>
                    <tr>
                        <th>Specific Goal</th>
                        <th>Deadline</th>
                        <th>Relevant Competency </th>
                        <th>How have you applied it?</th>
                        <th>What results have you seen from it?</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {goals.length > 0 && goals.map((goal, index) => (
                        <tr key={goal._id || index}>
                            <td style={{ position: 'relative' }}>
                                <div  style={{ position: 'absolute', top: 0, right: 0, width: '50%'  }}>
                                    <Button variant="outline-dark" className="p-0">Edit</Button>
                                    <Button variant="outline-dark" className="p-0" style={{ color: 'red' }}  onClick={(e) => handleDelete(e, goal._id)}>X</Button>
                                </div>
                                <p>{goal.specific_goal}
                                </p>

                            </td>
                            <td>{formatDate(goal.dead_line)}</td>
                            <td>{goal.competency.category_name}</td>
                            <td>{goal.goal_apply}</td>
                            <td>{goal.goal_result_seen}</td>
                            <td>{goal.status}</td>
                        </tr>
                    ))}


                </tbody>
            </Table>
        </div>
    )
}

export default GoalListing
