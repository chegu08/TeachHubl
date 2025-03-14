import "@fontsource/poppins";
import './App.css'
import Dashboard from './dashboard/dashboard.jsx'
import Sidebar from './sidebar/sidebar.jsx'
import Header from './header/header.jsx'
import Courses from './courses/courses.jsx'
import Tests from "./tests/tests.jsx";
import TestPage from "./pages/testpage.jsx";
import TestAnalysis from "./pages/testAnalysis.jsx";

import { useEffect, useState} from 'react';
import { Route, Routes } from "react-router-dom";


const MainPage = () => {
  const [mainSection, setMainSection] = useState("dashboard");
  useEffect(()=>{
   console.log(mainSection)
},[mainSection])
  return (<>
    <Sidebar setMainSection={setMainSection} />
    <div className="main_block">
      <Header />
      {mainSection == "dashboard" && <Dashboard setMainSection={setMainSection}/>}
      {mainSection == "courses" && <Courses />}
      {mainSection =='tests'&&<Tests />}
    </div>
  </>)
};


function App() {

  return (
    <div className='app' >
      <Routes >
        <Route path="/" element={ <MainPage />} />
        <Route path="/tests/:id" element={<TestPage />}/>
        <Route path="/analysis/:id" element={<TestAnalysis />} />
      </Routes>
    </div>
  )
}

export default App
