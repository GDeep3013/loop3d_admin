'use client';
import React, { useState } from "react";
import { Container, Dropdown, Row, Col } from 'react-bootstrap';

export default function ParticipantForm({ survey_id }) {
    const initialParticipants = Array.from({ length: 10 }, () => ({
        p_first_name: '',
        p_last_name: '',
        p_email: '',
        p_type: ''
    }));

    const [participants, setParticipants] = useState(initialParticipants);
    const [errors, setErrors] = useState([]);
    const [loader, setLoader] = useState(false);
    const handleInputChange = (index, field, value) => {
        const newParticipants = [...participants];
        newParticipants[index][field] = value;
        setParticipants(newParticipants);
    };

    const addParticipant = () => {
        setParticipants([...participants, { p_first_name: '', p_last_name: '', p_email: '', p_type: '' }]);
    };

    const removeParticipant = (indexToRemove) => {
        setParticipants(participants.filter((_, index) => index !== indexToRemove));
    };

    const validateForm = () => {
        const newErrors = [];
        const emailsSet = new Set();

        participants.forEach((participant, index) => {
            const participantErrors = {};
            if (!participant.p_first_name) participantErrors.p_first_name = 'First name is required';
            if (!participant.p_last_name) participantErrors.p_last_name = 'Last name is required';
            if (!participant.p_email) {
                participantErrors.p_email = 'Email is required';
            } else if (!/\S+@\S+\.\S+/.test(participant.p_email)) {
                participantErrors.p_email = 'Email format is invalid';
            } else if (emailsSet.has(participant.p_email)) {
                participantErrors.p_email = 'Duplicate email found';
            } else {
                emailsSet.add(participant.p_email);
            }
            if (!participant.p_type) participantErrors.p_type = 'Relationship type is required';

            newErrors[index] = participantErrors;
        });

        setErrors(newErrors);
        return newErrors.every(participantErrors => Object.keys(participantErrors).length === 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setLoader(true)         
            try {
                const response = await fetch(`/api/surveys/participants/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key':import.meta.env.VITE_X_API_KEY 

                    },
                    body: JSON.stringify({
                        survey_id,
                        participants
                    })
                });

                if (response.ok) {
                    console.log('Participants submitted successfully');
                    alert('Participants submitted successfully')
                  
                    window.location.reload()
                    // handle success, e.g., redirect to another page or show a success message
                } else {
                    console.error('Error submitting participants');
                    // handle error
                }
                setLoader(false)    
            } catch (error) {
                console.error('Error submitting participants:', error);
            }
         
        }
    };

    return (
        <div className="py-5 py-md-5 mb-5 mb-md-5 mb-lg-4 bg-custom-color2">
    <Container className="pl-4 pr-4">
        <h2 className="text-white fs-3 fs-lg-4 fw-bold">Step 2:</h2>
        <p className="text-white mt-3">Enter a minimum of 10 participants whom you would like to invite to take your 360 survey.</p>
        <form method="post" className="mt-4 position-relative" onSubmit={handleSubmit}>
            <div className="participant bg-custom-color py-3 py-md-4 px-3 px-md-4 rounded-top d-none d-md-flex">
                <div className="form-group w-100 text-center">
                    <label className="text-white fs-3 fs-xl-6 heading-font">Participant :</label>
                </div>
                <div className="form-group w-100 text-center">
                    <label className="text-white fs-3 fs-xl-6 heading-font">First Name</label>
                </div>
                <div className="form-group w-100 text-center">
                    <label className="text-white fs-3 fs-xl-6 heading-font">Last Name</label>
                </div>
                <div className="form-group w-100 text-center">
                    <label className="text-white fs-3 fs-xl-6 heading-font">Email</label>
                </div>
                <div className="form-group w-100 text-center">
                    <label className="text-white fs-3 fs-xl-6 heading-font">Relationship:</label>
                </div>
            </div>

            {participants.map((participant, index) => (
                <div key={index} className="participant bg-light">
                    <div className="inner border-bottom border-custom-color2 bg-light d-flex align-items-center position-relative">
                        <div className="form-group w-100 text-center py-3 py-md-4 px-3 px-md-4">
                            <label className="fs-4 fs-xl-6 text-dark heading-font">
                                Participant {index + 1}:
                            </label>
                        </div>
                        <div className="form-group w-100 bg-white py-3 py-md-4 px-3 px-md-4">
                            <input
                                placeholder="First Name"
                                type="text"
                                className="form-control border border-custom-color2 rounded px-3 py-2 text-base placeholder-gray-500"
                                value={participant.p_first_name}
                                onChange={(e) => handleInputChange(index, 'p_first_name', e.target.value)}
                            />
                            {errors[index]?.p_first_name && <p className="text-danger">{errors[index].p_first_name}</p>}
                        </div>
                        <div className="form-group w-100 py-3 py-md-4 px-3 px-md-4">
                            <input
                                placeholder="Last Name"
                                type="text"
                                className="form-control border border-custom-color2 rounded px-3 py-2 text-base placeholder-gray-500"
                                value={participant.p_last_name}
                                onChange={(e) => handleInputChange(index, 'p_last_name', e.target.value)}
                            />
                            {errors[index]?.p_last_name && <p className="text-danger">{errors[index].p_last_name}</p>}
                        </div>
                        <div className="form-group w-100 bg-white py-3 py-md-4 px-3 px-md-4">
                            <input
                                placeholder="Email"
                                type="email"
                                className="form-control border border-custom-color2 rounded px-3 py-2 text-base placeholder-gray-500"
                                value={participant.p_email}
                                onChange={(e) => handleInputChange(index, 'p_email', e.target.value)}
                            />
                            {errors[index]?.p_email && <p className="text-danger">{errors[index].p_email}</p>}
                        </div>
                        <div className="form-group w-100 py-3 py-md-4 px-3 px-md-4">
                            <select
                                className="form-select border border-custom-color2 rounded px-3 py-2 text-sm bg-light"
                                value={participant.p_type}
                                onChange={(e) => handleInputChange(index, 'p_type', e.target.value)}
                            >
                                <option value="">Select</option>
                                <option value="Direct Report">Direct Report</option>
                                <option value="Teammate">Teammate</option>
                                <option value="Supervisor">Supervisor</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors[index]?.p_type && <p className="text-danger">{errors[index].p_type}</p>}
                        </div>
                        {index >= 10 && (
                            <button type="button" className="text-danger text-sm mt-2 position-relative" onClick={() => removeParticipant(index)}>
                                <img src="/images/remove.png" alt="delete icon" className="position-absolute top-50 end-0 translate-middle" style={{ width: '20px', height: '20px' }}/>
                            </button>
                        )}
                    </div>
                </div>
            ))}
            <button type="button" onClick={addParticipant} className="mt-3 py-2 px-4 btn btn-primary">
                Add Participant
            </button>
                    <button type="submit" className="mt-3 py-2 px-4 btn bg-custom-color ms-2 text-white submit_btn" disabled={loader}>
                    {loader? 'submitting':"Submit"}
            </button>
        </form>
    </Container>
</div>


    );
}
