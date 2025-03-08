import './dashboard.css'
import { useEffect, useState } from 'react'
import bookIcon from '../assets/book.svg'
import ProgressChart from './progressChart';
import CourseContent from './coursecontent';
import Calendar from './calendar';
import TestInformation from './testinformation';
import axios from 'axios'



function Dashboard({setMainSection}) {

    const [userName, setUserName] = useState("");
    const [currentCourseCount, setCurrentCourseCount] = useState(2); //this is just for ui... logic has to be setup later

    // useEffect(() => {
    //     const LocalStorage = localStorage.getItem("current_storage");
    //     const LocalStorageUserName = JSON.parse(LocalStorage)['username'];
    //     setUserName(LocalStorageUserName);
    //     console.log(LocalStorageUserName);
    // }, []);
    const [upcomingtests,setUpcomingTests]=useState([{}]);

    

    useEffect(()=>{
        const fetchupcomingtestdetails=async (studId)=>{
            const details= await axios.get(`http://localhost:4000/test/${studId}/upcoming`);
            setUpcomingTests(details.data.detailofUpcomingTests);
        };
        // const testdetails=await fetchupcomingtestdetails("cheguevera"); //this is just for testing purposes
        // console.log(testdetails.data.detailofUpcomingTests);
        //setUpcomingTests(testdetails.data.detailofUpcomingTests);
        fetchupcomingtestdetails();
    },[]);

    return (
        <div className='dashboard'>
            <div className="background">
                <div className="bluebackground" ></div>
            </div>
            <div className="personal_detail">
                <h2>Welcome back, Cheguevera!</h2>
                <div className="completed_courses" >
                    <img src={bookIcon} className='icon' style={{ height: "50%", width: "50%" }} />
                    <div className="course_stat">
                        <p style={{ fontSize: 'xx-small', color: 'rgb(151, 171, 190)', fontFamily: "sans-serif" }}>Completed courses</p>
                        <p style={{ fontSize: "large" }}>{40}</p> {/* this is a dummy number just for the ui... logic has to implemented */}
                    </div>
                </div>
            </div>
            <div className="progress_and_courses">
                <div className="progress_container">
                    <div className="title_and_dropdown_container">
                        <h3 style={{ opacity: '0.9' }} >Progress</h3>
                        <select name="timeline" >
                            <option value="This week">This week</option>
                            <option value="Last week">Last week</option>
                            <option value="This month">This month</option>
                        </select>
                    </div>
                    <ProgressChart />
                </div>
                <div className="courses_container">
                    <div className="heading_and_view_all_container">
                        <h3 style={{ opacity: '0.9' }} role='button' onClick={()=>setMainSection('courses')} >My Courses <span>({currentCourseCount})</span></h3>
                        <a href='#' style={{ color: "#0d6efd" }}>view all</a>
                    </div>
                    <div className="content_container" >
                        {(currentCourseCount <= 2 && <button className="shift_left" style={{ flexGrow: "0.5", height: "100%" }} disabled><h2>{"<"}</h2></button>)
                            ||
                            (currentCourseCount > 2 && <button className="shift_left" style={{ flexGrow: "0.5", height: "100%" }} ><h2>{"<"}</h2></button>)}
                        <div className="content" style={{ flexGrow: "9", height: "100%" }}>
                            <CourseContent num={1}></CourseContent>
                            <CourseContent num={2}></CourseContent>
                        </div>
                        {(currentCourseCount <= 2 && <button className="shift_left" style={{ flexGrow: "0.5", height: "100%" }} disabled><h2>{">"}</h2></button>)
                            ||
                            (currentCourseCount > 2 && <button className="shift_left" style={{ flexGrow: "0.5", height: "100%" }} ><h2>{">"}</h2></button>)}
                    </div>
                </div>
            </div>
            <div className="upcoming_agenda_and_tests">
                <div className="upcoming_agenda_container">
                    <div className="title_and_dropdown_container">
                        <h3 style={{ opacity: '0.9' }}>Upcoming Agenda</h3>
                        <select name="timeline" >
                            <option value="January">January</option>
                            <option value="Febuary">Febuary</option>
                            <option value="March">March</option>
                            <option value="April" >April</option>
                            <option value="May" >May</option>
                            <option value="June" >June</option>
                            <option value="July" >July</option>
                            <option value="August" >August</option>
                            <option value="September" >September</option>
                            <option value="October" >October</option>
                            <option value="November" >November</option>
                            <option value="December" >December</option>
                        </select>
                    </div>
                    <Calendar />
                </div>
                <div className="tests_container">
                    <div className="heading_and_view_all_container">
                        <h3 style={{ opacity: '0.9' }}>Upcoming Tests <span>({upcomingtests.length})</span></h3>
                        <a href='#' style={{ color: "#0d6efd" }}>view all</a>
                    </div>
                    <div className='tests' >
                        <TestInformation upcomingtests={upcomingtests}/>
                    </div>
                </div>

            </div>
        </div>
    )

}

export default Dashboard