export const getSurveyById = async (mgr_id,lead_id, org_id, searchTerm) => {

    let url = `/api/surveys?mgr_id=${mgr_id}&loop_lead_id=${lead_id}&org_id=${org_id}`;

    if (searchTerm) {
        url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }
    let result = await fetch(url, {
        headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
    });

    let json = await result.json();

    return json.data;

};

export const getSurveyParticipantsById = async (id, searchTerm) => {

    let url = `/api/surveys/participants?survey_id=${id}`;

    if (searchTerm) {
        url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }
    let result = await fetch(url, {
        headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
    });

    let json = await result.json();

    return json.data;

};


export const getSurveys = async (searchTerm,currentPage) => {

    let url = `/api/surveys/all-survey`;

    if (searchTerm ||currentPage) {
        url += `?page=${currentPage}&searchTerm=${encodeURIComponent(searchTerm)}`;
    }
    let result = await fetch(url, {
        headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
    });

    let json = await result.json();

    return json;

};