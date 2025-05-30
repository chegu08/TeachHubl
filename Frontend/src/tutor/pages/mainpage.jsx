import "./mainpage.css";

import TutorSidebar from "../TutorSidebar/tutorSidebar";
import TutorHeader from "../TutorHeader/tutorHeader";
import TutorDashboard from "../dashboard/tutorDashboard";
import TutorCourses from "../courses/tutorCourses";
import TutorTests from "../tests/tutorTests";
import TutorCreateCourse from "../create_course/tutorCreateCourse";
import { useContext, createContext } from 'react';

export const mainSectionContext = createContext();

function TutorMainPage() {
  const [mainSection, setMainSection] = useContext(mainSectionContext);

  return (<>
    <TutorSidebar setMainSection={setMainSection} />
    <div className="main_block">
      <TutorHeader />
      {mainSection == "dashboard" && <TutorDashboard setMainSection={setMainSection} />}
      {mainSection == 'my_courses' && <TutorCourses setMainSection={setMainSection} />}
      {mainSection == 'tests' && <TutorTests />}
      {mainSection=='create_course'&&<TutorCreateCourse setMainSection={setMainSection}/>}
    </div>
  </>)
}

export default TutorMainPage;