import axios from "axios";

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