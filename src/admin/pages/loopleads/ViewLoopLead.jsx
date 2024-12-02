import React,{useEffect, useState } from 'react'
import axios from "axios"

export default function ViewLoopLead({ user_id, org_id }) {
   
    const [leadUser, setLeadUser] = useState();

    useEffect(() => {
        if (user_id && org_id) {
            const fetchLoopLeadUserDetails = async () => {
                try {
                    const response = await axios.get(`/api/users/loop-leads-user/${user_id}/${org_id}`, {
                        headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
                    });

                    if (response.data.status) {
                  
                        setLeadUser(response.data.user)
                     }
                } catch (error) {
                    console.error("Error fetching organization details:", error);
                }
            };
            fetchLoopLeadUserDetails();
        }
    }, [user_id, org_id]);

    // console.log('leadUser',leadUser?.organization?.name)
    
  return (
      <div className='looplead-box new-box d-flex align-items-start'>
          <div className='loop-inner'>
              <span className='user-name'>{leadUser?.first_name} {leadUser?.last_name}</span>
              <span className='date-text'>{leadUser?.organization?.name}</span> 
          </div>
          <div className='looplead-box-outer'>
          <div className='loop-contant'>
              <p><span>Email: <a href='mailto:RJones@y.com'>{leadUser?.email}</a></span></p>
              <p><span>Title:</span> Brand Manager</p>
          </div>
          <div className='loop-contant'>
              <p><span>Supervisor: </span>{leadUser?.created_by?.first_name} {leadUser?.created_by?.last_name}</p>
              <p><span>Supervisor Email: </span><a href='mailto:twilks@y.com'>{leadUser?.created_by?.email}</a></p>
          </div>
          </div>
    </div>
  )
}
