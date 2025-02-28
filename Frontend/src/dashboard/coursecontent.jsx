function CourseContent({ num }) {

    //const backgroundColor=(num==1)?"yellow":"red";

    const courseDetails = (num == 1) ? {
        courseName: "Crap",
        totalClasses: 20,
        completed: 18
    } : {
        courseName: "Pee",
        totalClasses: 30,
        completed: 21
    };

    const percentageCourseCompleted = (courseDetails.completed / courseDetails.totalClasses) * 100;


    const fullLengthProgressBarStyle = {
        height: "5px",
        width: "100%",
        backgroundColor: "rgb(145, 161, 214)",
        borderRadius: "2px",
        margin: "10px 0px",
        position: "relative",
        "z-index": "1",
        top: "0",
        left: "0"
    };

    const completedProgressBarStyle = {
        height: "5px",
        width: String(percentageCourseCompleted).concat("%"),
        backgroundColor: "#0d6efd",
        borderRadius: "2px",
        position: "absolute",
        "z-index": "2",
        top: "0",
        left: "0"
    };

    const style = {
        flexGrow: "1",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "40px 20px",
    }

    const progressStaticContainerStyle={
        display:"flex",
        flexDirection:"row",
        justifyContent:"space-between",
        color:"rgb(145, 161, 214)"
    }

    return (
        <div style={style} className="course">
            <h3>{courseDetails.courseName}</h3>
            <div className="progress_bar_container">
                <div className="full_length" style={fullLengthProgressBarStyle}>
                    <div className="completed_length" style={completedProgressBarStyle}>

                    </div>
                </div>
            </div>
            <div className="progress_statistics_container" style={progressStaticContainerStyle}>
                <span>{courseDetails.totalClasses} Lessons</span>
                <span>{percentageCourseCompleted} %</span>
            </div>
        </div>
    )
}

export default CourseContent