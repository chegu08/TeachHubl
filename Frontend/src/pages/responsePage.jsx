import './responsePage.css';
import Header from '../header/header';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import deleteIcon from '../assets/trash.svg'

function ResponsePage() {
    // this is just for now... implement the logic later
    const studId = "lkajnsglknaoi";

    const navigation = useNavigate();
    const responseId = useParams().responseId;
    const [course, setCourse] = useState({});
    const [tutor, setTutor] = useState({});
    const [contentDisplayed, setContentDisplayed] = useState('description');
    const [showSchedule, setShowSchedule] = useState(false);

    useEffect(() => {

        async function fetchCourseDetails() {
            const response1 = await axios.get(`http://localhost:4000/tutor/response-details/${responseId}`);
            setCourse(response1.data);
            console.log("response1", response1.data)
            const courseId = response1.data.templateId;
            const response2 = await axios.get(`http://localhost:4000/tutor/template-information/${courseId}`);
            setCourse((pre) => ({ ...pre, ...response2.data.course }));
            setTutor(response2.data.tutor);
            console.log("Course: ", { ...response1.data, ...response2.data.course });
            console.log("Tutor: ", response2.data.tutor);
        }

        fetchCourseDetails();

    }, []);

    return (
        <div className="template-course-page">
            <Header />
            <div className="body">
                <div className="course-information-container">
                    <h1>{course.name}</h1>
                    <p>{course.subject}</p>
                    <img src={`http://localhost:4000/tutor/template-image/${course.templateId}`} height={"300px"} width={"95%"} />
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
                    <h1>Price : ₹ {course.price}</h1>
                    <h1>Classes : {course.classes}</h1>
                    <h1>Starts On: {course.startDate?.split('T')[0]}</h1>
                    <h1>Ends On: {course.endDate?.split('T')[0]}</h1>

                </div>
                <div className="tutor-information-container">
                    <img src={tutor.image} alt='No Profile Picture' height={"300px"} width={"90%"} />
                    <h3 style={{ marginTop: "20px" }}>{tutor.yearsOfExperience} of Experience</h3>
                    <h2 style={{ textAlign: "center", marginTop: "20px" }}>{tutor.name}</h2>
                    <button className="request-course" onClick={() => setShowSchedule(pre => !pre)}>Schedule</button>
                    {
                        showSchedule &&
                        <div className="schedule_container">
                            {
                                course.schedule?.map((sch, ind) => (
                                    <ul key={ind} type="none">
                                        <li>{sch.date?.split('T')[0]}</li>
                                        <ul type="none">
                                            {
                                                sch.slots?.map((slot, j) => (
                                                    <li key={j}>{slot.startTime} - {slot.endTime}</li>
                                                ))
                                            }
                                        </ul>
                                    </ul>
                                ))
                            }
                        </div>
                    }
                    <button className="request-course" onClick={() => navigation("/payment",{
                        state:{
                            courseName:course.name,
                            tutorName:tutor.name,
                            startDate:course.startDate?.split('T')[0],
                            endDate:course.endDate?.split('T')[0],
                            subtotal:course.price,
                            platformFee:course.price*0.18,
                            total:course.price*1.18,
                            studId,
                            tutorId:course.tutorId,
                            templateId:course.templateId,
                            schedule:course.schedule,
                            classCount:course.classes,
                            subject:course.subject
                        }
                    })}>Proceed to payment</button>
                </div>
            </div>
        </div>
    )
}

export default ResponsePage;