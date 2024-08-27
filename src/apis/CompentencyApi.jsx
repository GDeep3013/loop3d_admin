export const fetchCompetencies = async () => {
    try {
        let url = `/api/categories`;
        let result = await fetch(url, {
            headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
        });
        let json = await result.json();
        return json;
    } catch (error) {
        return false;
    }
    
}