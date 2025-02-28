import "@fontsource/poppins";
import './App.css'
import Dashboard from './dashboard/dashboard.jsx'
import Sidebar from './sidebar/sidebar.jsx'
import Header from './header/header.jsx'
import Courses from './courses/courses.jsx'

import { useState } from 'react';

function App() {
  const [mainSection,setMainSection]=useState("dashboard");

  return (
    <div className='app' >
      <Sidebar setMainSection={setMainSection}/>
      <div className="main_block">
        <Header />
        {mainSection=="dashboard"&&<Dashboard setMainSection={setMainSection}/>} 
        {mainSection=="courses"&&<Courses />}
      </div> 
    
      
    </div>
  )
}

export default App
