// src/api/emailApi.js
import axios from 'axios';
// Get all emails
export const getEmails = async () => {
    try {
        const response = await axios.get('/api/emails', {
            headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
        });  // API endpoint to fetch categories
        // let json =  await response.json();
        
        return response.data;

    } catch (error) {
        console.error("Error fetching categories:", error);
    }
};

// Get an email by ID
export const getEmailById = async (id) => {
    try {
        const response = await axios.get('/api/emails/'+id, {
            headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
        });  // API endpoint to fetch categories
        // let json =  await response.json();
        
        return response.data;

    } catch (error) {
        console.error("Error fetching categories:", error);
    }

};

// Create a new email
export const createEmail = async (emailData) => {
    try {
        const response = await axios.post("/api/emails/create",emailData,{
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': import.meta.env.VITE_X_API_KEY
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error creating/updating email:', error);
        throw error.response ? error.response.data : error;
    }
};

// Update an email
export const updateEmail = async (id, emailData) => {
    try {
        const response = await axios.put("/api/emails/"+id,emailData,{
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': import.meta.env.VITE_X_API_KEY
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error creating/updating email:', error);
        throw error.response ? error.response.data : error;
    }
};

// Delete an email
export const deleteEmail = async (id) => {
    const response = await axios.delete(`/api/emails/${id}`);
    return response.data;
};
