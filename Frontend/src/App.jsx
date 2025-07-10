import "@fontsource/poppins";
import './App.css'

import TestAnalysis from "./pages/testAnalysis.jsx";
import VideoCallPage from "./video_call/videoCall.jsx";
import TutorMainPage from "./tutor/pages/mainpage.jsx";
import HomePage from "./pages/homePage.jsx";
import TestPage from "./pages/testpage.jsx";
import MainPage from "./pages/mainPage.jsx";
import ResponsePage from "./pages/responsePage.jsx";
import PaymentPage from "./pages/paymentPage.jsx";
import TemplateCoursePage from "./pages/templateCoursePage.jsx";
import AboutClassPage from "./pages/aboutClassPage.jsx";


import TutorHomePage from "./tutor/pages/tutorHomePage.jsx";
import TutorTestFeedbackPage from "./tutor/pages/tutorTestFeedbackPage.jsx";
import TutorResponsePage from "./tutor/pages/tutorResponsePage.jsx";
import TutorAboutClassPage from "./tutor/pages/tutorAboutClassPage.jsx";

import { useState } from 'react';
import { Route, Routes } from "react-router-dom";

import { mainSectionContext } from "./pages/mainPage.jsx";
import { mainSectionContext as tutormainSectionContext } from "./tutor/pages/mainpage.jsx";

function App() {
  const [studentmainSection, setStudentMainSection] = useState("dashboard");
  const [tutormainSection,setTutorMainSection]=useState("dashboard");
  return (

    <div className='app' >
      <tutormainSectionContext.Provider value={[tutormainSection, setTutorMainSection]} >
      <mainSectionContext.Provider value={[studentmainSection, setStudentMainSection]} >
        <Routes >

          {/* these routes are for students */}
          <Route path="/" element={<MainPage />} />
          <Route path="/tests/:id" element={<TestPage />} />
          <Route path="/analysis/:id" element={<TestAnalysis />} />
          <Route path="/liveClass" element={<VideoCallPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path='/template-course/:courseId' element={<TemplateCoursePage />} />
          <Route path="/course-response/:responseId" element={<ResponsePage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/aboutClassPage" element={<AboutClassPage />}/>


          {/* theses routes are for tutors */}
          <Route path="/tutor" element={<TutorMainPage />} />
          <Route path='/tutor/home' element={<TutorHomePage />} />
          <Route path="/tutor/feedback/:testId" element={<TutorTestFeedbackPage />} />
          <Route path="/tutor/response" element={<TutorResponsePage />} />
          <Route path="/tutorAboutClassPage" element={<TutorAboutClassPage />}/>


        </Routes>
      </mainSectionContext.Provider>
      </tutormainSectionContext.Provider>
    </div>

  )
}

export default App
