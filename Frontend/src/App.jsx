import "@fontsource/poppins";
import './App.css'

// Pages for students
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
import { StudentPrivateRoutes } from "./components/protectedRoutes.jsx";

// pages for tutors
import TutorHomePage from "./tutor/pages/tutorHomePage.jsx";
import TutorTestFeedbackPage from "./tutor/pages/tutorTestFeedbackPage.jsx";
import TutorResponsePage from "./tutor/pages/tutorResponsePage.jsx";
import TutorAboutClassPage from "./tutor/pages/tutorAboutClassPage.jsx";
import CreateTestPage from "./tutor/pages/createTestpage.jsx";
import RevenueDashBoardPage from "./tutor/pages/revenueDashboardPage.jsx";
import { TutorPrivateRoutes } from "./components/protectedRoutes.jsx";
import TutorReviewsPage from "./tutor/pages/tutorReviewsPage.jsx";

// pages common for both
import ResourceContentPage from "./commonPages/resourceContentpage.jsx";
import ChatPage from "./commonPages/chatPage.jsx";
import SignInPage from "./commonPages/signInPage.jsx";
import SignUpPage from "./commonPages/signUpPage.jsx";


import { useState } from 'react';
import { Route, Routes } from "react-router-dom";

import { mainSectionContext } from "./pages/mainPage.jsx";
import { mainSectionContext as tutormainSectionContext } from "./tutor/pages/mainpage.jsx";

function App() {
  const [studentmainSection, setStudentMainSection] = useState("dashboard");
  const [tutormainSection, setTutorMainSection] = useState("dashboard");
  return (

    <div className='app' >
      <tutormainSectionContext.Provider value={[tutormainSection, setTutorMainSection]} >
        <mainSectionContext.Provider value={[studentmainSection, setStudentMainSection]} >
          <Routes >

            {/* these routes are for students */}
            <Route element={<StudentPrivateRoutes />}>
              <Route path="/" element={<MainPage />} />
              <Route path="/tests/:id" element={<TestPage />} />
              <Route path="/analysis/:id" element={<TestAnalysis />} />
              <Route path="/home" element={<HomePage />} />
              <Route path='/template-course/:courseId' element={<TemplateCoursePage />} />
              <Route path="/course-response/:responseId" element={<ResponsePage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/aboutClassPage" element={<AboutClassPage />} />
            </Route>

            {/* theses routes are for tutors */}
            <Route element={<TutorPrivateRoutes />}>
              <Route path="/tutor" element={<TutorMainPage />} />
              <Route path='/tutor/home' element={<TutorHomePage />} />
              <Route path="/tutor/feedback/:testId" element={<TutorTestFeedbackPage />} />
              <Route path="/tutor/response" element={<TutorResponsePage />} />
              <Route path="/tutorAboutClassPage" element={<TutorAboutClassPage />} />
              <Route path="/tutor/create-test/:classId" element={<CreateTestPage />} />
              <Route path="/tutor/revenue/:tutorId" element={<RevenueDashBoardPage />} />
              <Route path="/tutor/reviews" element={<TutorReviewsPage />} />
            </Route>

            {/* route common to both tutor and student */}
            <Route path="/liveClass" element={<VideoCallPage />} />
            <Route path="/resource-content" element={<ResourceContentPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/signIn" element={<SignInPage />} />
            <Route path="/signUp" element={<SignUpPage />} />
          </Routes>
        </mainSectionContext.Provider>
      </tutormainSectionContext.Provider>
    </div>

  )
}

export default App
