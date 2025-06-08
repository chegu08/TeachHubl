import Dashboard from '../dashboard/dashboard';
import Sidebar from '../sidebar/sidebar';
import Header from '../header/header';
import Courses from '../courses/courses';
import Tests from '../tests/tests';
import ClassRequests from "../requests/classRequests";

import { useContext ,createContext} from 'react';

export const mainSectionContext=createContext();


function MainPage () {
  const [studentmainSection,setStudentMainSection]=useContext(mainSectionContext);
//   useEffect(()=>{
//    console.log(mainSection)
// },[mainSection])
  return (<>
    <Sidebar setStudentMainSection={setStudentMainSection} />
    <div className="main_block">
      <Header />
      {studentmainSection == "dashboard" && <Dashboard setMainSection={setStudentMainSection}/>}
      {studentmainSection == "courses" && <Courses />}
      {studentmainSection =='tests'&& <Tests />}
      {studentmainSection== "requests"&&<ClassRequests />}
    </div>
  </>)
};

export default MainPage;