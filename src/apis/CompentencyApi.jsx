export const fetchCompetencies = async (type) => {
    try {
        let url = `/api/categories?getType=`+type;
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

export const fetchSubcategories = async (categoryId) => {
    try {
        let url = `/api/categories/${categoryId}/subcategories`; // Update URL to match your API endpoint
        let response = await fetch(url, {
            headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
        });
        let json = await response.json();
        return json;
    } catch (error) {
        console.error('Error fetching subcategories:', error);
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