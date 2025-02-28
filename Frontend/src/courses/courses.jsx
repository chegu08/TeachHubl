import './courses.css'
import CourseList from './courseList';
import { useEffect, useState } from 'react';

function Courses(){
    const [selectedButton,setSelectedButton]=useState("All");
    

    const Button=()=>{
        const selectedstyle={borderColor:"#0d6efd",color:"#0d6efd",backgroundColor:"rgb(234, 239, 248)"};
        const status=["All","Current","Completed"];
        const buttons=[];
        status.forEach((statusName)=>{
            if(statusName==selectedButton){
                buttons.push(<button style={selectedstyle} key={statusName} onClick={()=>setSelectedButton(statusName)}>{statusName}</button>)
            }
            else{
                buttons.push(<button key={statusName} onClick={()=>setSelectedButton(statusName)}>{statusName}</button>)
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
                        <CourseList />
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