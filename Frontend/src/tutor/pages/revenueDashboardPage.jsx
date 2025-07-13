import "./revenueDashboardPage.css";
import { useParams } from 'react-router-dom';
import { useState, useEffect } from "react";
import axios from "axios";
import {Toaster,toast} from "sonner";

import TutorHeader from "../TutorHeader/tutorHeader";

function RevenueDashBoardPage() {
    const tutorId = useParams().tutorId;

    const [totalRevenue, setTotalRevenue] = useState(0);
    const [revenueDetails, setRevenueDetails] = useState([]);

    useEffect(()=>{
        async function fetchRevenueDetails() {
            try {
                const response=await axios.get(`http://localhost:4000/tutor/revenue/${tutorId}`);
                setRevenueDetails(response.data.revenueDetails);
                setTotalRevenue(response.data.totalRevenue);
            } catch(err) {
                console.log(err);
                toast.error("Failed to get revenue details");
            }
        }
        fetchRevenueDetails();
    },[]);

    return (
        <div className="revenue_dashboard_page">
            <TutorHeader />
            <Toaster richColors/>
            <div className="body">
                <h1>Revenue Dashboard</h1>
                <h2>Earning's so far: { totalRevenue>0?totalRevenue:""}</h2>
                <div className="revenue_info">
                    {
                        revenueDetails.map((course, ind) => (
                            <div className='list' key={ind} >
                                <img src={course.image} />
                                <div className="details">
                                    <div className="date_and_subject">
                                        <span className="date">{course.startDate}</span> • <span className="subject">{course.subject}</span>
                                        <h3 className="course_name">
                                            {course.coursename}
                                        </h3>
                                    </div>
                                    <p className="tutor_name">
                                        Amount : {course.amount}
                                    </p>
                                    <p className="tutor_name">
                                        Payment Date : {course.paymentDate}
                                    </p>
                                    <p className="tutor_name">
                                        Payment Id : {course.paymentId}
                                    </p>
                                    <p className="tutor_name">
                                        {course.studentName}
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

export default RevenueDashBoardPage;