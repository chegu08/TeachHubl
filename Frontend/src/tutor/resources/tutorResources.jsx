import "./tutorResources.css";
import leftArrow from "../../assets/arrow-left.svg";
import FileIcon from "../../components/fileIcon";
import {useState,useEffect} from 'react';
import axios from "axios";

function TutorResources() {

    // this is just temporary
        const tutorId = "ljsdglkansdogitn";
    
        // const navigation=useNavigate();
    
        const [selectedButton, setSelectedButton] = useState("class materials");
        const [courseInformation, setCourseInformation] = useState([]);
        const [selectedClass, setSelectedClass] = useState("");
        const [resources,setResources]=useState([]);
    
        useEffect(() => {
            async function fetchCourseInformation(tutorId) {
                const response = await axios.get(`http://localhost:4000/class/tutor/getInfo/${tutorId}`);
                setCourseInformation(response.data.allCourses);
                console.log(response.data.allCourses);
            }
            fetchCourseInformation(tutorId);
        }, []);
    
        useEffect(()=>{
            
            if(selectedClass!="") {
                async function fetchResources() {
                    const response=await axios.get(`http://localhost:4000/class/class-resources/${selectedClass}`);
                    console.log(response.data);
                    setResources(response.data);
                };
    
                fetchResources();
            }
    
        },[selectedClass])
    
        const Button = () => {
            const selectedstyle = { borderColor: "#0d6efd", color: "#0d6efd", backgroundColor: "rgb(234, 239, 248)" };
            const status = ["class materials", "notes"];
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
            <div className='courses' >
                <h2 className="heading">Resources</h2>
                {
                    selectedClass == "" &&
                    <div className="content_and_timetable">
                        <div className="content_of_courses">
                            <div className="courselist">
                                {
                                    courseInformation.map((course, ind) => (
                                        <div className='list' key={ind} role='button' onClick={() => { setSelectedClass(course.classId) }}>
                                            <img src={course.image} />
                                            <div className="details">
                                                <div className="date_and_subject">
                                                    <span className="date">{course.startDate}</span> • <span className="subject">{course.subject}</span>
                                                    <h3 className="course_name">
                                                        {course.coursename}
                                                    </h3>
                                                </div>
                                                <p className="tutor_name">
                                                    {course.studentName}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                        <div className="timetable">
                            <h3>Storage</h3>
                            This is a section to display total storage used as well as storage used by individual classes
                        </div>
                    </div>
                }
                {
                    selectedClass != "" &&
                    <div className="resource_container">
                        <nav onClick={() => setSelectedClass("")}><img src={leftArrow} width={"20px"} height={"20px"} /> &ensp;Back</nav>
                        <div className="course_status">
                            <Button />
                        </div>
                        <div className="resource_list" >
                            {
                                selectedButton=="class materials"&&
                                resources.map((resource,ind)=>(
                                    <div className="resource_box" key={ind} role='button' onClick={()=>{
                                        window.open(`/resource-content?resourceKey=${encodeURIComponent(resource.key)}&isNotes=false&classId=${selectedClass}`,"_blank")
                                    }}>
                                        <div className="heading">
                                            <FileIcon title={resource.name.slice(-3).toUpperCase()} />
                                            <span>{resource.name.length<=20?resource.name:resource.name.substring(0,18)+"..."}</span>
                                        </div>
                                        <div className="preview_icon_container">
    
                                        </div>
                                    </div>
                                ))
                            }
                            {
                                selectedButton=="notes"&&
                                <div className="resource_box" role='button' onClick={()=>{
                                        window.open(`/resource-content?resourceKey=${""}&isNotes=true&classId=${selectedClass}`,"_blank")
                                    }}>
                                        <div className="heading">
                                            <FileIcon title={"PDF"} />
                                            <span>Notes.pdf</span>
                                        </div>
                                        <div className="preview_icon_container">
    
                                        </div>
                                    </div>
                            }
                        </div>
                    </div>
                }
            </div>
        )

}

export default TutorResources;