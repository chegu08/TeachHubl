import "./tutorReviewsPage.css";
import {useState,useEffect} from "react";
import {Navigate} from "react-router-dom";
import {crudInstance as axios} from "../../components/customAxios";
import {jwtDecode} from "jwt-decode";
import TutorHeader from "../TutorHeader/tutorHeader";
import { Toaster,toast } from "sonner";
import { StarIcon,StarIconFill } from "../../components/fileIcon";

const jwt=localStorage.getItem("jwt");


function Stars({number}) {
    const comp=new Array(5).fill("starIcon").map((_,ind)=>((ind<=number-1&&number!=0)?"starIconFill":"starIcon"));
    return (
        <>
        {
            comp.map((val,ind)=>(
                <button style={{background:"none",paddingLeft:"10px",paddingRight:"10px",outline:"none",border:"none"}} key={ind} >
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

function TutorReviewsPage() {
    if(!jwt) return <Navigate to="/signIn" />;
    const decode=jwtDecode(jwt);
    const tutorId=decode.userId;

    const [averageRating, setAverageRating] = useState(0);
    const [reviewDetails, setReviewDetails] = useState([]);

    useEffect(()=>{
        async function fetchReviews() {
            try {
                const response=await axios.get(`/tutor/reviews/${tutorId}`);
                setAverageRating(response.data.averageRating);
                setReviewDetails(response.data.reviews);

            } catch(err) {
                console.log(err);
                toast.error("Failed to get reviews");
            }
        }
        fetchReviews();
    },[]);

    return (
        <div className="revenue_dashboard_page">
            <TutorHeader />
            <Toaster richColors/>
            <div className="body">
                <h1>Reviews and Ratings</h1>
                <h2>Average Rating: { reviewDetails.length==0?"No Ratings yet":averageRating}</h2>
                <div className="revenue_info">
                    {
                        reviewDetails.map((course, ind) => (
                            <div className='revenue-list' key={ind} >
                                <div className="details">
                                    <p className="tutor_name">
                                        {course.review}
                                    </p>
                                    <p className="tutor_name">
                                        <Stars number={course.stars} />
                                    </p>
                                    <p className="tutor_name">
                                        Posted At : {new Date(course.postedAt).toLocaleDateString('en-GB',{day:"numeric",month:"long",year:"numeric"})}
                                    </p>
                                    <p className="tutor_name">
                                        {course.studId}
                                    </p>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
};

export default TutorReviewsPage;