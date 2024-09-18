import React from 'react'
import AuthLayout from '../../layout/Auth'
import SurveyList from './SurveyList'


export default function LoopLeadDashboard() {
  return (
<AuthLayout title={"Dashboard"} >
       <SurveyList/>
       </AuthLayout>
  )
}
