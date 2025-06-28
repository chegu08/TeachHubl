import "./tutorClassRequests.css";
import { useState,useEffect,useRef } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

function TutorClassRequest() {
    // this is just for now... implement the whole logic later
        const tutorId = "ljsdglkansdogitn";
        const navigation=useNavigate();
    
        const [requestStatusToShow, setRequestStatusToShow] = useState("pending");
        const [requests, setRequests] = useState([]);
    
        // this is the cache used to avoid hitting the server
        const cache=useRef({});
    
        const getRequests = async () => {
    
            const response = await axios.get(`http://localhost:4000/request/class/tutor/${tutorId}/${requestStatusToShow}`);
            return response.data;
        };
    
        useEffect(() => {
    
            async function getPendingRequests() {
                if(cache.current[requestStatusToShow]) {
                    setRequests(cache.current[requestStatusToShow]);
                    return ;
                }
                const res=await getRequests();
                cache.current[requestStatusToShow]=res;
                setRequests(res);
            }
    
            getPendingRequests();
    
        }, [requestStatusToShow]);

        const handleRejectRequest=async (requestId)=>{
            try{
                const response=await axios.put("http://localhost:4000/request/class/reject",{requestId});
                alert(response.status);
                location.reload();
            } catch(err) {
                alert(err);
            }
        };

        const handleAcceptRequest = async (requestId,templateId,request) =>{
            navigation(`/tutor/response?requestId=${requestId}&templateId=${templateId}`,{
                state:request
            });
            // console.log(request);
        };
    
    
        const Button = () => {
            const selectedstyle = { borderColor: "#0d6efd", color: "#0d6efd", backgroundColor: "rgb(234, 239, 248)" };
            const status = ["pending", "all", "accepted", "rejected", "cancelled"];
            return status.map((statusName) => (
                <button key={statusName} style={statusName == requestStatusToShow ? selectedstyle : {}} onClick={() => setRequestStatusToShow(statusName)}>{statusName}</button>
            ))
        };
    
        return (
            <div className="tutor_requests_container">
                <h2 className="heading">My reqeusts</h2>
                <div className="button_container">
                    <Button />
                </div>
                <div className="request_list_container">
                    {
                        requests.filter(req => (requestStatusToShow == "all" || req.requestStatus == requestStatusToShow))
                            .map((req, ind) => (
                                <div className="request" key={ind}>
                                    <img src={req.templateThumbnail} width={"25%"} />
                                    <div className="details">
                                        {/* {req.requestId} */}
                                        <span className="template_name"><strong>{req.templateName}</strong></span>
                                        <span className="student_name"><strong>{req.studentName}</strong></span>
                                        <div className="chapters">
                                            {
                                                req.chaptersRequested?.map((chap, ind) => (
                                                    <p key={ind}>{chap}</p>
                                                ))
                                            }
                                        </div>
                                    </div>
                                    {
                                        req.requestStatus=="pending"&&
                                        <>
                                            <button className="request_button" onClick={()=>handleAcceptRequest(req.requestId,req.templateId,req)} style={{backgroundColor:"rgb(13, 110, 253)"}}>Accept</button>
                                            <button className="request_button" onClick={()=>handleRejectRequest(req.requestId)}>Reject</button>                 
                                        </>
                                    }
                                    {
                                        req.requestStatus!="pending"&&
                                        <p className="request_button">{req.requestStatus}</p>
                                    }
                                </div>
                            ))
                    }
                </div>
            </div>
        )
};

export default TutorClassRequest;