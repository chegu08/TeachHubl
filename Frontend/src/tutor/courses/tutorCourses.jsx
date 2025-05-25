import './tutorCourses.css';
import TutorCourseList from './tutorCourseList';
import { useState,useEffect } from 'react';
import axios from 'axios';


function TutorCourses({setMainSection}) {
    const [selectedButton, setSelectedButton] = useState("all");
    const [courseInformation, setCourseInformation] = useState(null);
    const tutorId = "ljsdglkansdogitn";
    const [todayStudentSchedule, setTodayStudentSchedule] = useState([]);
    const [popupClassLink, setppopupClassLink] = useState(null);
    // this is just temporary


    useEffect(() => {
        async function fetchCourseInformation(tutorId) {
            const response = await axios.get(`http://localhost:4000/class/tutor/getInfo/${tutorId}`);
            setCourseInformation(response.data.allCourses);
        }
        async function fetchTodayStudentSchedule(tutorId) {
            const response = await axios.get(`http://localhost:4000/schedule/class/tutor/${tutorId}`);
            setTodayStudentSchedule(response.data.todaysSlots);
        }
        fetchCourseInformation(tutorId);
        fetchTodayStudentSchedule(tutorId);
    }, []);

    useEffect(() => {
        let timers = []

        if (todayStudentSchedule.length > 0) {
            timers = todayStudentSchedule.map((schedule) => {
                const [hours, minutes] = schedule.startTime.split(":").map(Number);
                const date = new Date();
                date.setHours(hours, minutes, 0, 0); // set time to 23:00

                const now = Date.now(); // current timestamp in milliseconds
                const diffInMs = date.getTime() - now; // difference in milliseconds
                return setTimeout(() => {
                    if (diffInMs >= 0)
                    {
                        setppopupClassLink({Link:schedule.Link,className:schedule.className});
                    }
                }, diffInMs);
            });
        }

        return () => {
            timers.forEach((timer) => clearTimeout(timer));
        }


    }, [todayStudentSchedule]);


    const Button = () => {
        const selectedstyle = { borderColor: "#0d6efd", color: "#0d6efd", backgroundColor: "rgb(234, 239, 248)" };
        const status = ["all", "current", "completed"];
        const buttons = [];
        status.forEach((statusName) => {
            if (statusName == selectedButton) {
                buttons.push(<button style={selectedstyle} key={statusName} onClick={() => setSelectedButton(statusName)}>{statusName}</button>)
            }
            else {
                buttons.push(<button key={statusName} onClick={() => setSelectedButton(statusName)}>{statusName}</button>)
            }
        })
        return (<>{buttons}</>);
    };

    return (
        <div className='tutor-courses' >

            {popupClassLink!=null&&<div className='overlay' />}
            {/* this is just to test ,the actual case above should be popupClassLink!=null*/}

            <h2 className="heading">My Courses</h2>
            <div className="content_and_timetable">
                <div className="content_of_courses">
                    <div className="course_status">
                        <Button />
                    </div>
                    <div className="courselist">
                        {courseInformation &&
                            <TutorCourseList allCourses={courseInformation} selectedButton={selectedButton} />
                        }
                    </div>
                </div>
                <div className="timetable">
                    <button onClick={()=>setMainSection("create_course")} >Create New Class</button>
                    <h3>Today's Classes</h3>
                    {
                        todayStudentSchedule.length > 0 &&
                        todayStudentSchedule.map((_class, ind) => (
                            <div className="todays_class" key={ind}>
                                <strong className="className">{_class.className}</strong>
                                <span className="timing">{_class.startTime} - {_class.endTime}</span>
                            </div>
                        ))
                    }
                </div>
                {
                        popupClassLink&&(
                            <div className='popup'>
                            <h2>Hurry! {popupClassLink.className} class has started...</h2>
                            <a href={popupClassLink.Link}>{popupClassLink.Link}</a>
                            <button onClick={()=>setppopupClassLink(null)}>close</button>
                        </div>
                        )   
                        

                        // The above code is the actual code 
                        // the code below is just for ui

                        // <div className='popup'>
                        //     <h2>Class Name</h2>
                        //     <a href={'#'}>link</a>
                        //     <button onClick={()=>setppopupClassLink(null)}>close</button>
                        // </div>

                    
                }
            </div>
        </div>
    )
}

export default TutorCourses;