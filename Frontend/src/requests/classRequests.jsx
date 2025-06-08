import "./classRequests.css";
import { useState, useEffect, useRef } from "react";
import axios from "axios";


function ClassRequests() {

    // this is just for now... implement the whole logic later
    const studId = "lkajnsglknaoi";

    const [requestStatusToShow, setRequestStatusToShow] = useState("pending");
    const [requests, setRequests] = useState([]);

    // this is the cache used to avoid hitting the server
    const cache=useRef({});

    const getRequests = async () => {

        const response = await axios.get(`http://localhost:4000/request/class/student/${studId}/${requestStatusToShow}`);
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
            const response=await axios.delete("http://localhost:4000/request/class",{data:{requestId}});
            alert(response.status);
            location.reload();

        } catch(err) {
            alert(err);
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
                                <button className="cancel_request" onClick={()=>handleCancelRequest(req.requestId)}>Cancel request</button>
                            </div>
                        ))
                }
            </div>
        </div>
    )
}

export default ClassRequests;