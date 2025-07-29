import "./tutorDashboard.css";
import { useEffect, useState } from 'react';
import bookIcon from '../../assets/book.svg';
import TutorProgressChart from "./tutorProgressChart";
import TutorCourseContent from "./tutorCourseContent";
import TutorCalendar from "./tutorCalendar";
import TutorTestInformation from "./tutorTestInformarion";
import { crudInstance as axios } from '../../components/customAxios'

function TutorDashboard ({setMainSection}){

    const currentDate=new Date();
    const currentYear=currentDate.getFullYear();
    const currentMonth=currentDate.getMonth();
    const yearList=new Array(15).fill(currentYear);
    for(let i=0;i<15;i++) {
        yearList[i]=currentYear-i;
    }
    const monthList=["January","Febuary","March","April","May","June","July","August","September","October","November","December"];
    const tutorId="ljsdglkansdogitn";
    // this is just temporary

        const [userName, setUserName] = useState("");
    const [courseDetails,setCourseDetails]=useState([]);
    const [currentCourseCount, setCurrentCourseCount] = useState(0);
    const [currentCourseIndex,setCurrentCourseIndex]=useState(0);

    // useEffect(() => {
    //     const LocalStorage = localStorage.getItem("current_storage");
    //     const LocalStorageUserName = JSON.parse(LocalStorage)['username'];
    //     setUserName(LocalStorageUserName);
    //     console.log(LocalStorageUserName);
    // }, []);
    const [uncorrectedtests,setUncorrectedTests]=useState([]);
    const [selectedYear,setSelectedYear]=useState(currentYear);
    const [selectedMonth,setSelectedMonth]=useState(monthList[currentMonth]);

    
    useEffect(()=>{
        const fetchuncorrectedtestdetails=async (tutorId)=>{
            const details= await axios.get(`http://localhost:4000/test/tutor/${tutorId}`);
            setUncorrectedTests(details.data.detailofUncorrectedTests);
        };
        // const testdetails=await fetchupcomingtestdetails("cheguevera"); //this is just for testing purposes
        // console.log(testdetails.data.detailofUpcomingTests);
        //setUpcomingTests(testdetails.data.detailofUpcomingTests);
        fetchuncorrectedtestdetails(tutorId);
    },[]);

    useEffect(()=>{
        async function fetchCourseDetails(tutorId){
            // the backend logic is not set yet 
            // set it up you bastard
            const response= await axios.get(`http://localhost:4000/class/tutor/${tutorId}`);
            
            setCurrentCourseCount(response.data.classDetails.length);
            setCourseDetails(response.data.classDetails);

        }
        fetchCourseDetails(tutorId);
    },[]);


    return (
        <div className='tutor-dashboard'>
            <div className="background">
                <div className="bluebackground" ></div>
            </div>
            <div className="personal_detail">
                <h2>Welcome back, Jeyaraj!</h2>
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
                    <TutorProgressChart />
                </div>
                <div className="courses_container">
                    <div className="heading_and_view_all_container">
                        <h3 style={{ opacity: '0.9' }} role='button' onClick={()=>setMainSection('my_courses')} >My Courses <span>({currentCourseCount})</span></h3>
                        <a href='#' style={{ color: "#0d6efd" }}>view all</a>
                    </div>
                    <div className="content_container" >
                        {(currentCourseCount <= 2 && <button className="shift_left" style={{ flexGrow: "0.5", height: "100%" }} disabled ><h2>{"<"}</h2></button>)
                            ||
                            (currentCourseCount > 2 && <button className="shift_left" style={{ flexGrow: "0.5", height: "100%" }} onClick={()=>setCurrentCourseIndex(pre=>((pre-1+currentCourseCount)%currentCourseCount))}><h2>{"<"}</h2></button>)}
                        <div className="content" style={{ flexGrow: "9", height: "100%" }}>
                            {currentCourseCount>0&&<TutorCourseContent courseDetails={courseDetails[currentCourseIndex]} />}
                            {currentCourseCount>1&&<TutorCourseContent courseDetails={courseDetails[(currentCourseIndex+1)%currentCourseCount]} />}
                        </div>
                        {(currentCourseCount <= 2 && <button className="shift_right" style={{ flexGrow: "0.5", height: "100%" }} disabled><h2>{">"}</h2></button>)
                            ||
                            (currentCourseCount > 2 && <button className="shift_right" style={{ flexGrow: "0.5", height: "100%" }} onClick={()=>setCurrentCourseIndex(pre=>((pre+1)%currentCourseCount))}><h2>{">"}</h2></button>)}
                    </div>
                </div>
            </div>
            <div className="upcoming_agenda_and_tests">
                <div className="upcoming_agenda_container">
                    <div className="title_and_dropdown_container">
                        <h3 style={{ opacity: '0.9' }}>Upcoming Agenda</h3>
                        <select name="month" value={selectedMonth} onChange={(e)=>setSelectedMonth(e.target.value)}>
                            {
                                monthList.map((val,ind)=>(
                                    <option value={val} key={ind}>{val}</option>
                                ))
                            }
                        </select>
                        <select name="year" value={selectedYear} onChange={(e)=>setSelectedYear(e.target.value)}>
                            {
                                yearList.map((val,ind)=>(
                                    <option value={val} key={ind}>{val}</option>
                                ))
                            }
                        </select>
                    </div>
                    <TutorCalendar year={selectedYear} month={selectedMonth}/>
                </div>
                <div className="tests_container">
                    <div className="heading_and_view_all_container">
                        <h3 style={{ opacity: '0.9' }}>Yet To Give Feedback <span>({uncorrectedtests.length})</span></h3>
                        <a href='#' style={{ color: "#0d6efd" }}>view all</a>
                    </div>
                    <div className='tests' >
                        <TutorTestInformation uncorrectedtests={uncorrectedtests}/>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default TutorDashboard;