import axios from "axios";
export const createOrgnizations = async (url, data, method = 'POST') => {
    try {
        const response = await axios({
            method,
            url,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': import.meta.env.VITE_X_API_KEY
            },
            data
        });

        return response.data;
    } catch (error) {
        console.error('Error creating/updating organization:', error);
        throw error.response ? error.response.data : error;
    }
};

export const fetchOrgnizations = async () => {
    try {
        const response = await axios.get('/api/organizations', {
            headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
        });  // API endpoint to fetch categories
        // let json =  await response.json();
        
        return response.data;

    } catch (error) {
        console.error("Error fetching categories:", error);
    }
}