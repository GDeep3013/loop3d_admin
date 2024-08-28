export const fetchCompetencies = async () => {
    try {
        let url = `/api/categories`;
        let response = await fetch(url, {
            headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
        });
        let json = await response.json();
        return json;
    } catch (error) {
        return false;
    }  
}

export const fetchCompetency = async (id) => {
    try {
        let url = `/api/categories/${id}`;
        let response = await fetch(url, {
            headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
        });
        let json = await response.json();
        return json;
    } catch (error) {
        return false;
    }
}


export const deleteCompetency = async (id) => {
    try {
        const response = await fetch(`api/categories/${id}`, {
            method: 'DELETE',
            headers: { "x-api-key": import.meta.env.VITE_X_API_KEY }
        });
        let json = await response.json();
        return json;
    } catch (error) {
        return false;
    }
}