import './courseList.css'
import courseimg from '../assets/istockphoto-1919863292-2048x2048.jpg'

function CourseList() {

    const allLists=[];
    for(let i=0;i<5;i++)
    {
        allLists.push(<div className='list' key={i}>
            <img src={courseimg} />
            <div className="details">
                <div className="date_and_subject">
                    <span className="date">13th september</span> • <span className="subject">Computer</span>
                    <h3 className="course_name">
                        Cryptographic principles
                    </h3>
                </div>
                <p className="tutor_name">
                    Kunwar Singh
                </p>
            </div>
        </div>)
    }
    return (
        <>{allLists}</>
    )
}

export default CourseList