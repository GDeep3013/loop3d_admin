import React from 'react'
import AuthLayout from '../layout/Auth'
import Survey from './surveys/SurveyList'

export default function managerDashboard() {
  return (
      <AuthLayout title={"Dashboard"} >
          <Survey/>
    </AuthLayout>
  )
}
