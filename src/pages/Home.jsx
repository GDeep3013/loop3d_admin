import React from 'react'
import Header from '../components/Header'
import LeftNav from '../components/LeftNav'
import MainContent from '../components/MainContent'

export default function Home() {
  return (
      <div className='wrapper-outer d-flex'>
        <div className='side-nav'>
       <LeftNav />
       </div>
      <div className='main-content'>
        <Header />
        <MainContent />
      </div>
      </div>
  )
}
