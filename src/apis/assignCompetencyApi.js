// assignCompetencyApi.js

export const createAssignCompetency = async (data) => {
    try {
        const url = `/api/assign-competency`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': import.meta.env.VITE_X_API_KEY
            },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            return await response.json();
        } else {
            console.error('Failed to create AssignCompetency');
            return false;
        }
    } catch (error) {
        console.error('Error creating AssignCompetency:', error);
        return false;
    }
}

export const getAssignCompetency = async (id) => {
    try {
        const url = `/api/assign-competency/${id}`;
        const response = await fetch(url, {
            headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
        });
        if (response.ok) {
            return await response.json();
        } else {
            console.error('Failed to fetch AssignCompetency');
            return false;
        }
    } catch (error) {
        console.error('Error fetching AssignCompetency:', error);
        return false;
    }
}

export const updateAssignCompetency = async (id, data) => {
    try {
        const url = `/api/assign-competency/${id}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': import.meta.env.VITE_X_API_KEY
            },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            return await response.json();
        } else {
            console.error('Failed to update AssignCompetency');
            return false;
        }
    } catch (error) {
        console.error('Error updating AssignCompetency:', error);
        return false;
    }
}

export const deleteAssignCompetency = async (id) => {
    try {
        const url = `/api/assign-competency/${id}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
        });
        if (response.ok) {
            return await response.json();
        } else {
            console.error('Failed to delete AssignCompetency');
            return false;
        }
    } catch (error) {
        console.error('Error deleting AssignCompetency:', error);
        return false;
    }
}

export const getAssignmentsByUserAndOrg = async (userId, orgId) => {
    try {
        const url = `/api/assign-competency/${userId}/${orgId}`;
        const response = await fetch(url, {
            headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
        });
        if (response.ok) {
            return await response.json();
        } else {
            console.error('Failed to fetch assignments');
            return false;
        }
    } catch (error) {
        console.error('Error fetching assignments:', error);
        return false;
    }
};