import './response.css';
import { useState, useEffect, useRef } from "react";
import axios from "axios";

function Response() {
    // this is just for now... implement the whole logic later
    const studId = "lkajnsglknaoi";
    const [responses, setResponses] = useState([]);

    useEffect(() => {
        async function fetchResponses() {
            try {   
                const response=await axios.get(`http://localhost:4000/tutor/response/student/${studId}`);
                setResponses(response.data);
                console.log(response.data);
            } catch(err) {
                console.log(err);
                alert(err);
            }
        }

        fetchResponses();
    }, []);


    const handleCancelRequest=async (requestId)=>{
        try{
            const response=await axios.delete("http://localhost:4000/request/class",{data:{requestId}});
            alert(response.status);
            location.reload();

        } catch(err) {
            alert(err);
        }
        
    };


    return (
        <div className="requests_container">
            <div className="request_list_container">
                {
                    responses
                        .map((res, ind) => (
                            <div className="request" key={ind}>
                                <img src={res.templateThumbnail} width={"25%"} />
                                <div className="details">
                                    {/* {req.requestId} */}
                                    <span className="template_name"><strong>{res.templateName}</strong></span>
                                    <span className="tutor_name"><strong>{res.tutorName}</strong></span>
                                    <div className="chapters">
                                        {
                                            res.chaptersRequested?.map((chap, ind) => (
                                                <p key={ind}>{chap}</p>
                                            ))
                                        }
                                    </div>
                                </div>    
                                <button className="cancel_request" onClick={()=>handleCancelRequest(res.requestId)}>Cancel request</button>    
                                <button className="cancel_request" style={{backgroundColor:"rgb(13, 110, 253)"}}>Check Out</button>
                            </div>
                        ))
                }
            </div>
        </div>
    )
}

export default Response;