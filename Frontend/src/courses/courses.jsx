import './courses.css'
import CourseList from './courseList';
import { useEffect, useState } from 'react';
import axios from 'axios'

function Courses() {
    const [selectedButton, setSelectedButton] = useState("all");
    const [courseInformation, setCourseInformation] = useState(null);
    const studId = "lkajnsglknaoi";
    // this is just temporary


    useEffect(() => {
        async function fetchCourseInformation(studId) {
            const response = await axios.get(`http://localhost:4000/class/student/getInfo/${studId}`);
            setCourseInformation(response.data.allCourses);
        }
        fetchCourseInformation(studId);
    }, []);


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
        <div className='courses'>
            <h2 className="heading">My Courses</h2>
            <div className="content_and_timetable">
                <div className="content_of_courses">
                    <div className="course_status">
                        <Button />
                    </div>
                    <div className="courselist">
                        {courseInformation &&
                            <CourseList allCourses={courseInformation} selectedButton={selectedButton}/>
                        }
                    </div>
                </div>
                <div className="timetable">
                    <h3>Upcoming Today</h3>
                    {/* <div className="background">

                        <div className="foreground">

                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    )
}

export default Courses;