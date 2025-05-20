import Dashboard from '../dashboard/dashboard';
import Sidebar from '../sidebar/sidebar';
import Header from '../header/header';
import Courses from '../courses/courses';
import Tests from '../tests/tests';

import { useContext ,createContext} from 'react';

export const mainSectionContext=createContext();


function MainPage () {
  const [mainSection,setMainSection]=useContext(mainSectionContext);
//   useEffect(()=>{
//    console.log(mainSection)
// },[mainSection])
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

export default MainPage;