import "./mainpage.css";
import { useState } from "react";
import Sidebar from "../sidebar/sidebar";
import Header from "../header/header";


function TutorMainPage(){
    
        const [mainSection, setMainSection] = useState("dashboard");

  return (<>
    <Sidebar setMainSection={setMainSection} />
    <div className="main_block">
      <Header />
      {/* {mainSection == "dashboard" && <Dashboard setMainSection={setMainSection}/>}
      {mainSection == "courses" && <Courses />}
      {mainSection =='tests'&&<Tests />} */}
    </div>
  </>)
    
}

export default TutorMainPage