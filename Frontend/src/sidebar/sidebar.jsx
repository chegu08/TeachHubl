import './sidebar.css'
import logo from '../assets/WhatsApp Image 2025-02-19 at 20.32.04_9336c379.svg'
import searchlogo from '../assets/search.svg'

function Sidebar({setStudentMainSection}) {
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
            <button className="dashboard" onClick={()=>setStudentMainSection("dashboard")}>Dashboard</button>
            <button className="courses" onClick={()=>setStudentMainSection("courses")}>Courses</button>
            <button className="tests" onClick={()=>setStudentMainSection("tests")}>Tests</button>
            <button className="resources" onClick={()=>setStudentMainSection("resources")}>Resources</button>
            <button className="requests" onClick={()=>setStudentMainSection("requests")}>Requests</button>
            <button className="responses" onClick={()=>setStudentMainSection("responses")}>Responses</button>
        </div>
    )
}

export default Sidebar