import "./tutorAboutClassPage.css";
import { useSearchParams,useLocation,useNavigate } from 'react-router-dom';
import { useState,useEffect } from "react";
import axios from "axios";

import TutorHeader from "../TutorHeader/tutorHeader";

function TutorAboutClassPage() {
    // this is just for now... implement the logic later
    const tutorId="ljsdglkansdogitn";

    const [searchParams,_]=useSearchParams();
    const classId=searchParams.get("classId");
    const templateId=searchParams.get("templateId");
    const studentName=useLocation().state.studName;
    const navigation=useNavigate();

    const [course, setCourse] = useState({});
    const [tutor, setTutor] = useState({});
    const [contentDisplayed, setContentDisplayed] = useState('description');

    useEffect(() => {

        async function fetchCourseDetails() {
            const response1 = await axios.get(`http://localhost:4000/tutor/template-information/${templateId}`);
            setCourse(response1.data.course);
            setTutor(response1.data.tutor);
            console.log("Course: ", response1.data.course);
            console.log("Tutor: ", response1.data.tutor);
            const response2=await axios.get(`http://localhost:4000/class/student/aboutPage/${classId}`);
            setCourse(pre=>({...pre,...response2.data}));
            console.log(response2.data);
        }

        fetchCourseDetails();

    }, []);

    return (
        <div className="tutor-about-page">
            <TutorHeader />
            <div className="body">
                <div className="course-information-container">
                    <h1>{course.name}</h1>
                    <p>{course.subject}</p>
                    <img src={`http://localhost:4000/tutor/template-image/${templateId}`} height={"300px"} width={"95%"} />
                    <div className="content-container">
                        <div className="title">
                            <button style={{ borderBottom: (contentDisplayed == 'description') ? "3px solid rgb(13, 110, 253)" : "" }} onClick={() => setContentDisplayed("description")}>Description</button>
                            <button style={{ borderBottom: (contentDisplayed == 'overview') ? "3px solid rgb(13, 110, 253)" : "" }} onClick={() => setContentDisplayed("overview")}>Overview</button>
                            <button style={{ borderBottom: (contentDisplayed == 'agenda') ? "3px solid rgb(13, 110, 253)" : "" }} onClick={() => setContentDisplayed("agenda")}>Agenda</button>
                        </div>
                        <hr style={{ width: "100%", padding: "0px", margin: "0px" }} />
                        <p>
                            {
                                contentDisplayed == 'description' && course.description
                            }
                            {
                                contentDisplayed == 'overview' && (course.overview || "Course does not contain overview")
                            }
                            {
                                contentDisplayed == 'agenda' && (course.agenda || "Course does not contain agenda")
                            }
                        </p>
                    </div>
                    <h1>{course.startDate?.split('T')[0].split('-').reverse().join('/')} - {course.endDate?.split('T')[0].split('-').reverse().join('/')}</h1>
                    <div className="drop-down-container" style={{ marginTop: "20px" }} >
                        <h3>Chapters</h3>
                        <p>
                            {
                                course?.chaptersRequested?.map((chap, ind) => (<p key={ind} style={{ marginLeft: "20px" }}>{chap}</p>))
                            }
                        </p>
                    </div>
                    <div className="drop-down-container" style={{ marginTop: "20px" }} >
                        <h3>Resources</h3>
                        <p>
                            {
                                course?.resources?.map((res, ind) => (<p key={ind} style={{ marginLeft: "20px" }}>{res}</p>))
                            }
                        </p>
                    </div>
                </div>
                <div className="tutor-information-container">
                    <img src={tutor.image} alt='No Profile Picture' height={"300px"} width={"90%"} />
                    <h2 style={{ textAlign: "center", marginTop: "20px" }}>{studentName}</h2>
                    <button onClick={()=>navigation(`/tutor/create-test/${classId}`)}>Create Test</button>
                </div>
            </div>
        </div>
    )
}

export default TutorAboutClassPage;