import './sidebar.css'
import logo from '../assets/WhatsApp Image 2025-02-19 at 20.32.04_9336c379.svg'
import searchlogo from '../assets/search.svg'

function Sidebar({setMainSection}) {
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
            <button className="courses" onClick={()=>setMainSection("courses")}>Courses</button>
            <button className="tests" onClick={()=>setMainSection("tests")}>Tests</button>
            <button className="calendar" onClick={()=>setMainSection("calendar")}>Calendar</button>
        </div>
    )
}

export default Sidebar