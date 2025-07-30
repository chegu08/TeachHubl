import './aboutClassPage.css';
import { useSearchParams } from 'react-router-dom';
import { useState,useEffect } from "react";
import {crudInstance as axios} from "../components/customAxios";
import {Toaster,toast} from "sonner"

import {StarIcon,StarIconFill} from "../components/fileIcon"
import Header from "../header/header";
import { jwtDecode } from 'jwt-decode';
import { Navigate } from 'react-router-dom';
const jwt=localStorage.getItem("jwt");

function Stars({number,setStars}) {
    const comp=new Array(5).fill("starIcon").map((_,ind)=>((ind<=number-1&&number!=0)?"starIconFill":"starIcon"));
    return (
        <>
        {
            comp.map((val,ind)=>(
                <button style={{background:"none",paddingLeft:"10px",paddingRight:"10px"}} key={ind} onClick={()=>setStars(ind+1)}>
                    {
                        val=="starIcon"&&<StarIcon />
                    }
                    {
                        val!="starIcon"&&<StarIconFill />
                    }
                </button>
            ))
        }
        </>
    )
}

function AboutClassPage() {

    if (!jwt) return <Navigate to="/signIn" />;
    
    const decode=jwtDecode(jwt);
    const studId=decode.userId;

    const [searchParams,_]=useSearchParams();
    const classId=searchParams.get("classId");
    const templateId=searchParams.get("templateId");
    const [course, setCourse] = useState({});
    const [tutor, setTutor] = useState({});
    const [contentDisplayed, setContentDisplayed] = useState('description');
    const [stars,setStars]=useState(0);
    const [review,setReview]=useState("");

    useEffect(() => {

        async function fetchCourseDetails() {
            const response1 = await axios.get(`/tutor/template-information/${templateId}`);
            setCourse(response1.data.course);
            setTutor(response1.data.tutor);
            console.log("Course: ", response1.data.course);
            console.log("Tutor: ", response1.data.tutor);
            const response2=await axios.get(`/class/student/aboutPage/${classId}`);
            setCourse(pre=>({...pre,...response2.data}));
            console.log(response2.data);
        }

        fetchCourseDetails();

    }, []);

    const handlePostReview=async (e)=>{

        try{
            await axios.post(`http://localhost:4000/tutor/review`,{
                review,
                tutorId:tutor.tutorId,
                studId,
                stars
            });
            toast.success("Review posted!");
        } catch(err) {
            console.log(err);
            toast.error("Erroo posting this review ...try again later");
        }

        setStars(0);
        setReview("");
    };

    return (
        <div className="about-page">
            <Header />
            <Toaster richColors />
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
                    <h3 style={{ marginTop: "20px" }}>{tutor.yearsOfExperience} of Experience</h3>
                    <h2>Ratings: {tutor.averageRating==0?"No ratings yet!":tutor.averageRating} {tutor.averageRating!=0?"/ 5.0":""}</h2>
                    <h2 style={{ textAlign: "center", marginTop: "20px" }}>{tutor.name}</h2>
                    <p>
                        Ratings : 
                        <Stars number={stars} setStars={setStars}/>
                    </p>
                    <textarea type="text" placeholder='Give your review here...' value={review} onChange={(e)=>setReview(e.target.value)}/>
                    <button onClick={handlePostReview}>Submit Review</button>
                </div>
            </div>
        </div>
    )
}

export default AboutClassPage;