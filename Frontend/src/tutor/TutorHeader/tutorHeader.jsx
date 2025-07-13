import "./tutorHeader.css";
import calendarIcon from '../../assets/calendar4-week.svg'
import messagingIcon from '../../assets/chat-dots.svg'
import notificationIcon from '../../assets/bell.svg'
import profileIcon from '../../assets/image.svg' //this is just for testing purposes

import {useNavigate} from 'react-router-dom';
import { useState } from "react";

function TutorHeader() {

    // this is temporary
    const tutorId='ljsdglkansdogitn';

    const navigate=useNavigate();

    const [showProfile,setShowProfile]=useState(false);
        return (
            <div className='header'>
                <div className="nav_elements_container">
                    <button className="home" onClick={()=>navigate("/tutor/home")}>Home</button>
                    <button className="event">Event</button>
                    <button className="teachers">Teachers</button>
                    <button className="about">About</button>
                </div>
                <div className="shortcuts_and_profile_container">
                    <button className="messages" onClick={()=>{
                        window.open(`/chat?user=${tutorId}`,"_blank","noopener noreferrer");
                    }}><img src={messagingIcon} height={"150%"} width={"150%"}/></button>
                    <button className="notifications"><img src={notificationIcon} height={"150%"} width={"150%"}/></button>
                    <button className="calendar"><img src={calendarIcon} height={"150%"} width={"150%"}/></button>
                    <button className="profile" onClick={()=>setShowProfile(pre=>!pre)}><img src={profileIcon} alt="profile" height={"150%"} width={"150%"} style={{borderRadius:"50%"}}/></button>
                </div>
                {
                    showProfile&&
                    <div className="profile_container">
                        <img src={profileIcon} />
                        <hr />
                        <div className="actions">
                            <button>Edit Profile</button>
                            <button onClick={()=>navigate(`/tutor/revenue/${tutorId}`)}>Revenue Dashboard</button>
                            <button>Log Out</button>
                        </div>
                    </div>
                }
            </div>
        )
}

export default TutorHeader;