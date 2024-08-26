export const getUser = async (id,token=false) => {
    if (id) {
        try {
            const response = await fetch(`/api/users/${id}?token=${token}`,{
                headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user details');
            }
            const userData = await response.json();

            return userData;
           
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    }
};