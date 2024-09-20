import React from 'react'
import { Table, Button } from 'react-bootstrap';

const GoalListing = () => {
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
                    <tr>
                        <td style={{ position: 'relative' }}>
                            {/* <div style={{ position: 'absolute', top: 0, right: 0 }}>
                                <Button variant="outline-dark" className="p-0">Edit</Button>
                                <Button variant="outline-dark outline-cross" className="p-0" style={{ color: 'red' }}>X</Button>
                            </div> */}
                            Goal 1
                        </td>
                        <td>Complete project A</td>
                        <td>In Progress</td>
                        <td>How have you applied it 1</td>
                        <td>What results have you seen from it 1</td>
                        <td>Complete</td>
                    </tr>
                    <tr>
                        <td>Goal 1</td>
                        <td>Complete project 2</td>
                        <td>In Progress 2</td>
                        <td>How have you applied it 2</td>
                        <td>What results have you seen from it 2</td>
                        <td>Not Started</td>
                    </tr>
                    <tr>
                        <td>Goal 3</td>
                        <td>Complete project A 3</td>
                        <td>In Progress 3</td>
                        <td>How have you applied it 3</td>
                        <td>What results have you seen from it 3</td>
                        <td>Started</td>
                    </tr>
                </tbody>
            </Table>
        </div>
    )
}

export default GoalListing
