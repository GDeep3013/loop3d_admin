import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Edit } from '../../../components/svg-icons/icons';

export default function ViewLoopLead({ user_id, org_id }) {
    const [leadUser, setLeadUser] = useState();
    const [loader, setLoader] = useState(false);
    const [editing, setEditing] = useState(false);
    const [updatedFields, setUpdatedFields] = useState({});
    const [supervisor, setSupervisor] = useState({});
    const [selectedSupervisor, setSelectedSupervisor] = useState(null);
    const [error, setError] = useState({})

    const validateFields = () => {
        let isValid = true;
        let errors = {};

        if (!updatedFields.email || updatedFields.email.trim() === '') {
            errors.email = 'Email is required.';
            isValid = false;
        } else {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(updatedFields.email)) {
                errors.email = 'Please enter a valid email address.';
                isValid = false;
            }
        }

        if (!updatedFields.first_name || updatedFields.first_name.trim() === '') {
            errors.first_name = 'First name is required.';
            isValid = false;
        }

        if (!updatedFields.last_name || updatedFields.last_name.trim() === '') {
            errors.last_name = 'Last name is required.';
            isValid = false;
        }

        setError(errors);
        return isValid;
    };

    async function getEmployee() {
        try {
            const response = await fetch('/api/surveys/fetch-manager', {
                method: 'GET',
                headers: {
                    'x-api-key': import.meta.env.VITE_X_API_KEY,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            if (data.status) {
                setSupervisor(data.users)
            }
        } catch (error) {
            console.error('Error fetching employee details:', error);
        }
    }

    useEffect(() => {
        if (user_id && org_id) {
            const fetchLoopLeadUserDetails = async () => {
                try {
                    setLoader(true);
                    const response = await axios.get(`/api/users/loop-leads-user/${user_id}/${org_id}`, {
                        headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY },
                    });

                    if (response.data.status) {
                        setLeadUser(response.data.user);
                        setUpdatedFields(response.data.user);
                    }
                    setLoader(false);
                } catch (error) {
                    console.error('Error fetching organization details:', error);
                    setLoader(false);
                }
            };
            fetchLoopLeadUserDetails();
        }
    }, [user_id, org_id]);

    // Set the initial selected supervisor when leadUser changes
    useEffect(() => {
        if (leadUser && supervisor.length > 0) {
            const initialSupervisor = supervisor.find(
                (s) => s.email === leadUser.created_by?.email
            );
            if (initialSupervisor) {
                setSelectedSupervisor(initialSupervisor);
            }
        }
    }, [leadUser, supervisor]);

    const handleEditClick = () => {
        setEditing(true);
    };

    const handleFieldChange = (field, value) => {
        setUpdatedFields((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!validateFields()) {
            return;
        }

        try {
            const response = await axios.put(`/api/users/update-details/${user_id}`, updatedFields, {
                headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY },
            });

            if (response.data.status) {
                setLeadUser(updatedFields);
                setEditing(false);
                // setEmailError(''); // Clear any previous errors when update is successful
            } else {
                alert('Failed to update details. Please try again.');
            }


        } catch (error) {
            if (error.response && error.response.status === 400) {
                // Handle the case where the server returns an email uniqueness error
                setEmailError(error.response.data.message);
            } else {
                console.error('Error updating details:', error);

            }
        }
    };

    const handleCancel = () => {
        setUpdatedFields(leadUser);
        setEditing(false);
    };

    useEffect(() => { getEmployee() }, [])

    if (loader) {
        return <div className='loader ms-4 '>Loading...</div>;
    }

    return (
        <div className='looplead-box new-box d-flex align-items-start'>
            <div className='loop-inner'>
                <>

                    {editing ? (
                        <>
                            <p><label>First Name: </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    value={updatedFields.first_name || ''}
                                    onChange={(e) => handleFieldChange('first_name', e.target.value)}
                                />
                                {error.first_name && <div className="error-message" style={{ color: 'red', marginTop: '5px' }}>{error.first_name}</div>}
                            </p>

                            <p>  <label>Last Name: </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    value={updatedFields.last_name || ''}
                                    onChange={(e) => handleFieldChange('last_name', e.target.value)}
                                />
                                {error.last_name && <div className="error-message" style={{ color: 'red', marginTop: '5px' }}>{error.last_name}</div>}
                            </p>

                        </>
                    ) : (
                        <span className='user-name'>{leadUser?.first_name} {leadUser?.last_name}</span>
                    )}
                    {!editing && <span className='date-text'>{leadUser?.organization?.name}</span>}
                </>
            </div>
            <div className='looplead-box-outer'>
                <div className='loop-contant'>
                    <p>
                        <label>Email: </label>
                        {editing ? (
                            <>    <input
                                type='email'
                                className='form-control'
                                value={updatedFields.email || ''}
                                onChange={(e) => handleFieldChange('email', e.target.value)}
                            />
                                {error.email && <div className="error-message" style={{ color: 'red', marginTop: '5px' }}>{error.email}</div>}
                            </>) : (
                            <span >{leadUser?.email}</span>
                        )}
                    </p>
                    <p>
                        <label>Title:</label>
                        {editing ? (
                            <input
                                type='text'
                                className='form-control'
                                value={updatedFields.title || ''}
                                onChange={(e) => handleFieldChange('title', e.target.value)}
                            />
                        ) : (
                            leadUser?.title
                        )}
                    </p>
                </div>
                <div className='loop-contant'>
                    <div>
                        <p>
                            <label>Supervisor: </label>
                            {editing ? (
                                <select
                                    value={selectedSupervisor?._id || ''}
                                    className='form-control'
                                    onChange={(e) => {
                                        const selectedId = e.target.value;

                                        const selectedSupervisorObj = supervisor.find((s) => s._id === selectedId);

                                        if (selectedSupervisorObj) {
                                            setSelectedSupervisor(selectedSupervisorObj);

                                            // Call the function to handle field change with only the _id
                                            handleFieldChange('new_created_by', selectedSupervisorObj._id);
                                        }
                                    }}
                                >
                                    <option value=''>Select Supervisor</option>
                                    {supervisor.map((sup) => (
                                        <option key={sup._id} value={sup._id}>
                                            {sup.first_name} {sup.last_name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <span>
                                    {leadUser?.created_by?.first_name} {leadUser?.created_by?.last_name}
                                </span>
                            )}
                        </p>
                        <p>
                            <label>Supervisor Email: </label>
                            {editing ? (
                                <select
                                    value={selectedSupervisor?._id || ''}
                                    className='form-control'
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        const selectedSupervisorObj = supervisor.find((s) => s._id === selectedId);
                                        if (selectedSupervisorObj) {
                                            setSelectedSupervisor(selectedSupervisorObj);
                                            handleFieldChange('new_created_by', selectedSupervisorObj._id);
                                        }
                                    }}
                                >
                                    <option value=''>Select Email</option>
                                    {supervisor.map((sup) => (
                                        <option key={sup._id} value={sup._id}>
                                            {sup.email}
                                        </option>
                                    ))}

                                </select>
                            ) : (
                                <span>{leadUser?.created_by?.email}</span>
                            )}
                        </p>
                        {leadUser?.created_by?.phone &&
                            <p>
                                <label>Supervisor Phone: : </label>
                                {editing ? (
                                    <>    <input
                                        type='number'
                                        className='form-control'
                                        value={updatedFields.phone || ''}
                                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                                        disabled={true}
                                    />
                                        {/* {error.email && <div className="error-message" style={{ color: 'red', marginTop: '5px' }}>{error.email}</div>} */}
                                    </>) : (
                                    <span >{leadUser?.created_by?.phone}</span>
                                )}
                            </p>
                        }

                    </div>
                    {!editing && (<button className='action-btn absolute' onClick={handleEditClick}><Edit /></button>)}
                </div>
             
            </div>
            {editing && (
                <div className='edit-buttons'>
                    <button className="default-btn btn btn-primary" onClick={handleSave}>Save</button>
                    <button className="default-btn cancel-btn btn btn-primary" onClick={handleCancel}>Cancel</button>
                </div>
            )}
           
        </div>



    );
}
