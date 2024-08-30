import React from 'react'
import AuthLayout from "../../layout/Auth";
import  CreateOrgnizations  from './CreateOrganizations';
export default function CreateFrom() {
    return (
        <AuthLayout title={"Add Organization"}>
            <CreateOrgnizations/>
      </AuthLayout>

  )
}

