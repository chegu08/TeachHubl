import './homePage.css';
import Header from '../header/header';
import TopbackgroundImage from '../assets/background images/backgroundimage.png'
import { useState, useEffect } from 'react';
import courseimg from '../assets/istockphoto-1919863292-2048x2048.jpg'
import axios from 'axios';

function HomePage() {
    const [bestCourses, setBestCourses] = useState([]);
    const [bestTutors, setBestTutors] = useState([]);

    useEffect(() => {
        // this is just for ui ... implement the backend logic and then implement here
        // pagination concept is just implemented in backend
        // implement it in frontend
        async function fetchBestCourses() {
            const bestCourses= await axios.get(`http://localhost:4000/tutor/alltemplate?limit=10&offset=${0}`);
            setBestCourses(bestCourses.data);
        }

        async function fetchBestTutors() {
            const bestTutors = (await axios.get('http://localhost:4000/tutor/best')).data;

            setBestTutors(bestTutors);
        }

        fetchBestTutors();
        fetchBestCourses();

    }, []);


    return (
        <div className="homepage">
            <Header />
            <img src={TopbackgroundImage} width={"100%"} height={"70%"} />
            <div className='best-courselist-container'>
                <h2><strong>we offer the best courses for you</strong></h2>
                <div className='search-box-container'>
                    <input type='text' className='searchbox' placeholder='search courses...' />
                    <button >search </button>
                </div>
                <div className="best-courselist">
                    {
                        bestCourses.map((course, ind) => (
                            <div className="course" key={ind}>
                                <img src={course.image} width={"100%"} height={"50%"} />
                                {/* the image used is just for ui... build the backend and complete it */}
                                <div className="info-container">
                                    <div className="course_and_subject" >
                                        <span style={{ fontSize: "larger" }}><strong>{course.courseName}</strong></span>
                                        <br />
                                        <span style={{ fontSize: "small", color: "rgb(151, 171, 190)" }}>{course.subject}</span>
                                        <br />
                                        <span style={{ fontSize: "medium" }}>Max Price : ₹ {course.maxPrice }</span>
                                        <br />
                                        <span style={{ fontSize: "medium" }}>Max Classes : {course.maxClasses }</span>
                                    </div>
                                    <a href={`/template-course/${course.courseId}`} style={{ color: "rgb(13, 110, 253)" }}>view more</a>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
            <div className='best-courselist-container'>
                <h2><strong>The best active tutors are here</strong></h2>
                <div className='search-box-container'>
                    <input type='text' className='searchbox' placeholder='search tutors...' />
                    <button >search </button>
                </div>
                <div className="best-courselist">
                    {
                        bestTutors.map((tutor, ind) => (
                            <div className="course" key={ind}>
                                <img src={courseimg} width={"100%"} height={"50%"} />
                                {/* the image used is just for ui... build the backend and complete it */}
                                <div className="info-container">
                                    <div className="course_and_subject" >
                                        <span style={{ fontSize: "larger" }}><strong>{tutor.tutorName}</strong></span>
                                        <br />
                                        <span style={{ fontSize: "small", color: "rgb(151, 171, 190)" }}>{tutor.location}</span>
                                    </div>
                                    <a href={"/"} style={{ color: "rgb(13, 110, 253)" }}>view more</a>
                                    {/* the anchor tag points to the home screen for now but it should actually point to a detailed page that shows
                                        the whole information of the tutor 
                                     */}
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>


    )
}

export default HomePage