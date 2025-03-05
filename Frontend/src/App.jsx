import "@fontsource/poppins";
import './App.css'
import Dashboard from './dashboard/dashboard.jsx'
import Sidebar from './sidebar/sidebar.jsx'
import Header from './header/header.jsx'
import Courses from './courses/courses.jsx'
import TestPage from "./pages/testpage.jsx";

import { useState} from 'react';
import { Route, Routes } from "react-router-dom";

function App() {
  const [mainSection, setMainSection] = useState("dashboard");


  const MainPage = () => {
    return (<>
      <Sidebar setMainSection={setMainSection} />
      <div className="main_block">
        <Header />
        {mainSection == "dashboard" && <Dashboard setMainSection={setMainSection} />}
        {mainSection == "courses" && <Courses />}
      </div>
    </>)
  };

  return (
    <div className='app' >
      <Routes >
        <Route path="/" element={ <MainPage />} />
        <Route path="/tests/:id" element={<TestPage />}/>
      </Routes>
    </div>
  )
}

export default App
