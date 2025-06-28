import { useParams } from 'react-router-dom';
import './templateCoursePage.css';
import Header from '../header/header';
import { useState, useEffect } from 'react';
import axios from 'axios';
import deleteIcon from '../assets/trash.svg'

function TemplateCoursePage() {
    // this is just for now... implement the logic later
    const studId="lkajnsglknaoi";

    const courseId = useParams().courseId;
    const [course, setCourse] = useState({});
    const [tutor, setTutor] = useState({});
    const [contentDisplayed, setContentDisplayed] = useState('description');
    const [showRequestWindow, setShowRequestWindow] = useState(false);
    const [rejectedChapters, setRejectedChapters] = useState([]);

    useEffect(() => {

        async function fetchCourseDetails() {
            const response = await axios.get(`http://localhost:4000/tutor/template-information/${courseId}`);
            setCourse(response.data.course);
            setTutor(response.data.tutor);
            console.log("Course: ", response.data.course);
            console.log("Tutor: ", response.data.tutor);
        }

        fetchCourseDetails();

    }, []);

    const handleSendClassRequest=async ()=>{
        const chaptersToSend=course.chapters?.filter((chap)=>!rejectedChapters.includes(chap));
        if(chaptersToSend.length==0) {
            alert("You must have atleast one chapter to send request");
            return ;
        }
        // console.log("clicked");
        const response=await axios.post("http://localhost:4000/request/class",{
            studId,
            templateId:courseId,
            chapters:chaptersToSend
        });
        if(response.status==200) {
            alert("Request to the tutor is sent");
            setShowRequestWindow(false);
        } 
        else {
            alert("Couldn't send request to the respective tutor...try someother time");
        }
    };

    return (
        <div className="template-course-page">
            <Header />
            <div className="body">

                {
                    showRequestWindow &&
                    <>
                        <div className="background-blur"></div>
                        <div className="request-window">
                            <div className="top">
                                <button className="cancel" onClick={() => setShowRequestWindow(false)}>X</button>
                            </div>
                            <div className="chapters-and-request">
                                <h2>Customise chapters</h2>
                                <ul className="chapters" type="none">
                                    {
                                        course.chapters?.filter((chap) => !rejectedChapters.includes(chap)).map((chap, ind) => (
                                            <li key={ind}>
                                                <span>{chap}</span>
                                                <button><img src={deleteIcon} width={"30px"} height={"30px"} onClick={() => setRejectedChapters(pre => [...pre, chap])} /></button>
                                            </li>
                                        ))
                                    }
                                </ul>
                                <div >
                                    <button className="reset" onClick={() => setRejectedChapters([])}>Reset to default</button>
                                    <button className="send-request" onClick={handleSendClassRequest}>Send Request</button>
                                </div>
                            </div>
                        </div>
                    </>
                }

                
                <div className="course-information-container">
                    <h1>{course.name}</h1>
                    <p>{course.subject}</p>
                    <img src={`http://localhost:4000/tutor/template-image/${courseId}`} height={"300px"} width={"95%"} />
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
                    <div className="drop-down-container" style={{ marginTop: "20px" }} >
                        <h3>Chapters</h3>
                        <p>
                            {
                                course?.chapters?.map((chap, ind) => (<p key={ind} style={{ marginLeft: "20px" }}>{chap}</p>))
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
                    <h1>Max Price : ₹ {course.maxPrice}</h1>
                    <h1>Max Classes : {course.maxClasses}</h1>
                </div>
                <div className="tutor-information-container">
                    <img src={tutor.image} alt='No Profile Picture' height={"300px"} width={"90%"} />
                    <h3 style={{ marginTop: "20px" }}>{tutor.yearsOfExperience} of Experience</h3>
                    <h2 style={{ textAlign: "center", marginTop: "20px" }}>{tutor.name}</h2>
                    <button className="request-course" onClick={() => setShowRequestWindow(true)}>Request Course</button>

                </div>
            </div>
        </div>
    )
}

export default TemplateCoursePage;