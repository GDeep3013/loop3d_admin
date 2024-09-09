import React, {useState,useEffect } from 'react'
import AuthLayout from '../../../layout/Auth'
import EmployeeTable from './UsersTable'
import { Col, Container, Row } from 'react-bootstrap'
import { Link } from "react-router-dom";
import { PLusIcon } from '../../../components/svg-icons/icons'

export default function Employees() {

  return (
    <AuthLayout title={'Welcome to User'} subTitle={'User'}>
      <EmployeeTable />
    </AuthLayout>
  )
}
