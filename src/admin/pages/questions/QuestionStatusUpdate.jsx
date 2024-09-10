// src/components/QuestionStatusUpdate.js

import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';

const QuestionStatusUpdate = ({ questionId, currentStatus, onStatusChange }) => {
    const [status, setStatus] = useState(currentStatus);

    useEffect(() => {
        setStatus(currentStatus);
    }, [currentStatus]);

    const handleStatusChange = async (event) => {
        const newStatus = event.target.value;

        setStatus(newStatus); // Update local state

        try {
            const response = await fetch(`/api/questions/${questionId}/update-status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': import.meta.env.VITE_X_API_KEY
                },
                body: JSON.stringify({ active: newStatus === 'active' })
            });

            const data = await response.json();

            if (response.ok) {
                onStatusChange(data.active); // Notify parent about status change
            } else {
                console.error('Failed to update status');
                setStatus(currentStatus); // Revert to previous status if update fails
            }
        } catch (error) {
            console.error('Error updating status:', error);
            setStatus(currentStatus); // Revert to previous status if error occurs
        }
    };

    return (
        <Form.Select value={status} onChange={handleStatusChange}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
        </Form.Select>
    );
};

export default QuestionStatusUpdate;
