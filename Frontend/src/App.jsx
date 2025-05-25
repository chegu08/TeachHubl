import "@fontsource/poppins";
import './App.css'

import TestAnalysis from "./pages/testAnalysis.jsx";
import VideoCallPage from "./video_call/videoCall.jsx";
import TutorMainPage from "./tutor/pages/mainpage.jsx";
import HomePage from "./pages/homePage.jsx";
import TestPage from "./pages/testpage.jsx";
import MainPage from "./pages/mainPage.jsx";
import TutorHomePage from "./tutor/pages/tutorHomePage.jsx";

import { useState } from 'react';
import { Route, Routes } from "react-router-dom";

import { mainSectionContext } from "./pages/mainPage.jsx";
import { mainSectionContext as tutormainSectionContext } from "./tutor/pages/mainpage.jsx";

function App() {
  const [mainSection, setMainSection] = useState("dashboard");
  return (

    <div className='app' >
      <mainSectionContext.Provider value={[mainSection, setMainSection]} >
        <Routes >
          <Route path="/" element={<MainPage />} />
          <Route path="/tests/:id" element={<TestPage />} />
          <Route path="/analysis/:id" element={<TestAnalysis />} />
          <Route path="/liveClass" element={<VideoCallPage />} />
          <Route path="/home" element={<HomePage />} />
        </Routes>
      </mainSectionContext.Provider>
      <tutormainSectionContext.Provider value={[mainSection, setMainSection]} >
        <Routes >
          <Route path="/tutor" element={<TutorMainPage />} />
          <Route path='/tutor/home' element={<TutorHomePage />} />
        </Routes>
      </tutormainSectionContext.Provider>
    </div>

  )
}

export default App
