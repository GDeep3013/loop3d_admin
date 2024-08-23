import React, {useState,useEffect } from 'react'
import AuthLayout from '../layout/Auth'
import { Link } from 'react-router-dom'
import ProjectsTable from '../components/SurveyTable'
import { Container, Row, Col } from 'react-bootstrap'
import { PLusIcon } from '../components/svg-icons/icons'

export default function Projects() {  
  return (
    <AuthLayout title={'Welcome to Survey'} subTitle={'Survey'}>
      <ProjectsTable  />
    </AuthLayout>
  )
}
