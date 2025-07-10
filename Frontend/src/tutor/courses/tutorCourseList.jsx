import "./tutorCourseList.css";
// import courseimg from "../../assets/istockphoto-1919863292-2048x2048.jpg";
// this image is just temporary ...after setting all the necessary information 
// every class created must have an image
// Database should be modified for that

function TutorCourseList({allCourses,selectedButton}) {
    return (
            <>
            {
                allCourses.filter((course)=>selectedButton=='all'||selectedButton==course.status).map((course,ind)=>(
                    <div className='list' key={ind}>
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
            </>
        )
}

export default TutorCourseList;