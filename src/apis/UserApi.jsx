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


export const fetchLoopLeads = async (orgniation_id, searchTerm,type) => {

    let url = `/api/users/loop-leads/${orgniation_id}?type=${type}`;

    if (searchTerm) {
        url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }
    let result = await fetch(url, {
        headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
    });

    let json = await result.json();

    return json;

};