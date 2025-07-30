import "./classRequests.css";
import { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import {crudInstance as axios} from "../components/customAxios";
import { jwtDecode } from 'jwt-decode';
import {Toaster,toast} from "sonner"
const jwt=localStorage.getItem("jwt");


function ClassRequests() {

    if (!jwt) return <Navigate to="/signIn" />;

    const decode=jwtDecode(jwt);
    const studId = decode.userId;

    const [requestStatusToShow, setRequestStatusToShow] = useState("pending");
    const [requests, setRequests] = useState([]);

    // this is the cache used to avoid hitting the server
    const cache=useRef({});

    const getRequests = async () => {

        const response = await axios.get(`/request/class/student/${studId}/${requestStatusToShow}`);
        return response.data;
    };


    //const results = useMemo(getRequests, [requestStatusToShow]);

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


    const handleCancelRequest=async (requestId)=>{
        try{
            const response=await axios.delete("/request/class",{data:{requestId}});
            location.reload();

        } catch(err) {
            toast.error(err);
        }
        
    };

    const Button = () => {
        const selectedstyle = { borderColor: "#0d6efd", color: "#0d6efd", backgroundColor: "rgb(234, 239, 248)" };
        const status = ["pending", "all", "accepted", "rejected", "cancelled"];
        return status.map((statusName) => (
            <button key={statusName} style={statusName == requestStatusToShow ? selectedstyle : {}} onClick={() => setRequestStatusToShow(statusName)}>{statusName}</button>
        ))
    };

    return (
        <div className="requests_container">
            <Toaster richColors />
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
                                    <span className="tutor_name"><strong>{req.tutorName}</strong></span>
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
                                    <button className="cancel_request" onClick={()=>handleCancelRequest(req.requestId)}>Cancel request</button>
                                }
                                {
                                    req.requestStatus!="pending"&&
                                    <p className="cancel_request">{req.requestStatus}</p>
                                }
                            </div>
                        ))
                }
            </div>
        </div>
    )
}

export default ClassRequests;