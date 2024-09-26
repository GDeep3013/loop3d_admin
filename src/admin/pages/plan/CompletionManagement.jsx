import React from 'react'
import { Modal, Button } from 'react-bootstrap'

export default function CompletionManagement({ show, onHide, specificGoal, competency, setChatResponse, setCompetencyFrom }) {
    // console.log(specificGoal, 'specificGoal');
    return (
        <Modal show={show} onHide={onHide} className='completion-modal' dialogClassName="modal-dialog-centered">
            <Modal.Header closeButton>
                <Modal.Title>Goal Completed</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='completion-management plan_content'>

                    <div className="grp-btn d-flex">
                        <Button variant="primary" className="w-50 me-2 " onClick={() => { setCompetencyFrom(competency); setChatResponse(specificGoal); onHide() }} > I want to keep working on {competency}</Button>
                        <Button variant="secondary" className="w-50 ml-0" onClick={onHide}>  I want to work on other competencies. </Button>
                    </div>

                </div>
            </Modal.Body>
        </Modal >
    )
}
