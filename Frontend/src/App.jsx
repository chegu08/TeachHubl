import "@fontsource/poppins";
import './App.css'

import TestAnalysis from "./pages/testAnalysis.jsx";
import VideoCallPage from "./video_call/videoCall.jsx";
import TutorMainPage from "./tutor/mainpage.jsx";
import HomePage from "./pages/homePage.jsx";
import TestPage from "./pages/testpage.jsx";
import MainPage from "./pages/mainPage.jsx";

import { useState } from 'react';
import { Route, Routes } from "react-router-dom";

import { mainSectionContext } from "./pages/mainPage.jsx";

function App() {
  const [mainSection, setMainSection] = useState("dashboard");
  return (
    <mainSectionContext.Provider value={[mainSection,setMainSection]} >
    <div className='app' >
      <Routes >
        <Route path="/" element={ <MainPage />} />
        <Route path="/tests/:id" element={<TestPage />}/>
        <Route path="/analysis/:id" element={<TestAnalysis />} />
        <Route path="/liveClass" element={<VideoCallPage />} />
        <Route path="/tutor" element={<TutorMainPage />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </div>
    </mainSectionContext.Provider>
  )
}

export default App
