import React, { useState } from 'react'
import LeftNav from '../components/LeftNav'
import HeaderDashboard from '../components/HeaderDashboard'
import MainContent from '../components/MainContent'
export default function Dashboard() { 
 
  return (
    <div className='wrapper-outer d-flex'>
      <div className='side-nav'>
        <LeftNav  />
      </div>
      <div className='main-content'>
        <HeaderDashboard />
        <MainContent  />
      </div>
    </div>
  )
}
