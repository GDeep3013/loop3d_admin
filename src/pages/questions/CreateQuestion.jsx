
import React from 'react'
import AuthLayout from "../../layout/Auth";
import AddQuestion  from './AddQuestion';
export default function CreateQuestion() {
    return (
        <AuthLayout title={"Add Question"}>
            <AddQuestion/>
      </AuthLayout>

  )
}