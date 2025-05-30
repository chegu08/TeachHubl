import "./tutorSidebar.css";
import logo from '../../assets/WhatsApp Image 2025-02-19 at 20.32.04_9336c379.svg';
import searchlogo from '../../assets/search.svg';

function TutorSidebar({setMainSection}){
    return (
        <div className='sidebar'>
                    <div className="name_and_logo">
                        <img src={logo} width={'30px'} height={'30px'} />
                        <strong>TeachHubl</strong>
                    </div>
                    <div className="search_bar">
                        <img src={searchlogo} />
                        <input type="text" className="text" placeholder='Search' />
                    </div>
                    <hr></hr>
                    <button className="dashboard" onClick={()=>setMainSection("dashboard")}>Dashboard</button>
                    <button className="my_courses" onClick={()=>setMainSection("my_courses")}> My Classes</button>
                    <button className="tests" onClick={()=>setMainSection("tests")}>Tests</button>
                    <button className="resources" onClick={()=>setMainSection("resources")}>Resources</button>
                    <button className="create_course" onClick={()=>setMainSection("create_course")}>Create Courses</button>
                </div>
    )
}

export default TutorSidebar;