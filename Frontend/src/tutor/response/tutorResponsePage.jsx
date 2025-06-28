import "./tutorResponsePage.css";
import { useSearchParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

import TutorHeader from "../TutorHeader/tutorHeader";
import TutorCalendar from "../dashboard/tutorCalendar";

const monthList = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const dayMapping={
    Sun:0,
    Mon:1,
    Tue:2,
    Wed:3,
    Thu:4,
    Fri:5,
    Sat:6
};

function sortArraySlots(array) {
    return array.sort((a,b)=>Math.abs(a)<Math.abs(b));
}


function TutorResponsePage() {
    const location = useLocation();
    // console.log(JSON.stringify(location.state));
    const [urlSearchParams, setUrlSeachParams] = useSearchParams();
    const requestId = urlSearchParams.get("requestId");
    const templateId = urlSearchParams.get("templateId");
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const yearList = new Array(15).fill(currentYear);
    for (let i = 0; i < 15; i++) {
        yearList[i] = currentYear - i;
    }
    // this is just temporary
    const tutorId='ljsdglkansdogitn';

    const [maxPrice, setMaxPrice] = useState(0);
    const [maxClasses, setmaxClasses] = useState(0);
    const [actualPrice, setActualPrice] = useState();
    const [actualClasses, setActualClasses] = useState(0);
    const [slotsFilled,setSlotsFilled]=useState(0);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(monthList[currentMonth]);
    const [existingTutorSlots,setExistingTutorSlots]=useState([]);
    const [tutorSlots,setTutorSlots]=useState([]);
    const [startDate,setStartDate]=useState();
    const [endDate,setEndDate]=useState();
    const [calenderInfoForSlots,setCalenderInfoForSlots]=useState([]);

    useEffect(() => {
        async function fetchMaxClassesAndPrice() {
            try {
                const response = await axios.get(`http://localhost:4000/request/class/template-information/max-classes-and-price/${templateId}`);
                setMaxPrice(response.data.maxPrice);
                setmaxClasses(response.data.maxClasses);
            } catch (err) {
                console.log(err);
                alert("Error fetching max classes and prices");
            }
        }

        async function fetchTutorScheduleAndSlot() {
            try {
                const response=await axios.get(`http://localhost:4000/tutor/schedule/${tutorId}?startDate=2025-06-20&endDate=2025-08-20`);
                const response1=await axios.get(`http://localhost:4000/tutor/slots/${tutorId}`);
                setTutorSlots(response1.data.tutorSlots);
                // console.log("tutor slots",response1.data.tutorSlots)
                const existingSlots=response.data?.scheduleWithMatchedDates.map(sch=>({
                    date:sch.date,
                    slots:sch.eventDetail.map(event=>({startTime:event.startTime,endTime:event.endTime}))
                }));
                setExistingTutorSlots(existingSlots);
                // console.log("existing ",existingSlots)
            } catch(err) {
                console.log(err);
                alert("Error fetching tutor schedule and slots ");
            }
        }
        fetchMaxClassesAndPrice();
        fetchTutorScheduleAndSlot();
    }, []);

    useEffect(()=>{
        if(new Date(endDate)<new Date(startDate)) {
            alert("End date must not before start Date");
            return ;
        }

        const d1=new Date(startDate);
        const d2=new Date(endDate);
        const diff=(d2-d1)/(1000*60*60*24);

        const tutorWorkingDays=tutorSlots.map(slots=>dayMapping[slots.day]);
        const calenderInfo=[];

        for(let i=0;i<=diff;i++) {
            const cur_date=new Date(d1);
            cur_date.setDate(cur_date.getDate()+i);
            
            if(tutorWorkingDays.includes(cur_date.getDay())) {
                // coming here indicates that this day is a working day for tutor

                // console.log("date ",cur_date.toISOString());

                const existingSlotsForToday=existingTutorSlots.filter(slot=>{
                    const dstr1=new Date(slot.date).toISOString().split('T')[0];
                    const dstr2=new Date(cur_date).toISOString().split('T')[0];
                    return dstr1===dstr2;
                })[0]?.slots;

                const remaining_slots_for_today=tutorSlots
                    .filter(slot => dayMapping[slot.day]===cur_date.getDay())[0].slots
                    .filter(rslot => {
                        let freeSlot=true;
                        const st=1000*Number(rslot.startTime.substring(0,2))+Number(rslot.startTime.substring(3,5));
                        const et=1000*Number(rslot.endTime.substring(0,2))+Number(rslot.endTime.substring(3,5));

                        existingSlotsForToday?.forEach(eslot => {
                            const st1=1000*Number(eslot.startTime.substring(0,2))+Number(eslot.startTime.substring(3,5));
                            const et1=1000*Number(eslot.endTime.substring(0,2))+Number(eslot.endTime.substring(3,5));
                            if((st1<=st&&et<=et1)||(st<=st1&&et1<=et)||(st<=st1&&st1<=et)||(st<=et1&&et1<=et)) freeSlot=false;
                            // console.log("imp debug ",st, " ",et ," ",st1,' ',et1 ,"date ",cur_date.toISOString());
                        });


                        return freeSlot;
                        
                    })

                calenderInfo.push({
                    date:cur_date.toISOString(),
                    status:(remaining_slots_for_today.length==0) ? "unavailable" : "slots_left",
                    slots:remaining_slots_for_today
                });

            }
            else {
                calenderInfo.push({
                    date:cur_date.toISOString(),
                    status:"not_filled"
                })
            }

        }

        setCalenderInfoForSlots(calenderInfo);
    },[endDate]);

    return (
        <div className="tutor-response-page">
            <TutorHeader />
            <div className="body">
                <div className="course-information-container">
                    <h1>{location.state.templateName}</h1>
                    <img src={`http://localhost:4000/tutor/template-image/${templateId}`} height={"300px"} width={"95%"} />
                    <div className="drop-down-container" style={{ marginTop: "20px" }} >
                        <h3>Chapters</h3>
                        <span>
                            {
                                location.state.chaptersRequested?.map((chap, ind) => (<p key={ind} style={{ marginLeft: "20px" }}>{chap}</p>))
                            }
                        </span>
                    </div>
                    <div className="input-container">
                        <label htmlFor="classes">Number of classes: </label>
                        <input type="number" id="classes" value={actualClasses} onChange={(e) => setActualClasses(e.target.value)} />
                    </div>
                    <div className="input-container">
                        <label htmlFor="price" >Price: </label>
                        <input type="number" id="price" value={actualPrice} onChange={(e) => setActualPrice(e.target.value)} />
                    </div>
                    <div className="input-container">
                        <label htmlFor="startDate" >Start Date: </label>
                        <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div className="input-container">
                        <label htmlFor="EndDate" >End Date: </label>
                        <input type="date" id="EndDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                    <div className="schedule-container">
                        <div className="title_and_dropdown_container">
                            <h3 style={{ opacity: '0.9' }}>Upcoming Agenda</h3>
                            <select name="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                                {
                                    monthList.map((val, ind) => (
                                        <option value={val} key={ind}>{val}</option>
                                    ))
                                }
                            </select>
                            <select name="year" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                                {
                                    yearList.map((val, ind) => (
                                        <option value={val} key={ind}>{val}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <TutorCalendar year={selectedYear} month={selectedMonth} calenderInfo={calenderInfoForSlots}/>
                        <div className="slot-fill-container">
                            <p>
                                <span>Slots to fill : {actualClasses-slotsFilled}</span>
                                <button>Auto fill slots</button>
                            </p>
                            <span style={{fontSize:"x-small",padding:"0px 2px"}}>Auto fill slots does not fill all the slots ...there might be some slots left after auto fill and it might not be a favourable slot selection all the time .
                                Please verify the slots before giving your response</span>
                        </div>
                        <div className="instructions">
                            <li type="none"><span style={{ borderColor: 'rgb(13, 253, 213)', backgroundColor: "rgb(235, 255, 246)" }}></span><em>Filled</em></li>
                            <li type="none"><span style={{ borderColor: 'rgb(13, 110, 253)', backgroundColor: "rgb(240, 245, 251)" }}></span><em>Slots left</em></li>
                            <li type="none"><span style={{ borderColor: 'rgb(220, 53, 69)', backgroundColor: 'rgb(250, 225, 228)' }}></span><em>Unavailable</em></li>
                            <li type="none"><span style={{ backgroundcolor: "white" }}></span><em>Not Filled</em></li>
                        </div>
                    </div>
                </div>
                <div className="student-information-container">
                    <img src={null} alt='No Profile Picture' height={"300px"} width={"90%"} />
                    <h2 style={{ textAlign: "center", marginTop: "20px" }}>{location.state.studentName}</h2>
                </div>
            </div>
        </div>
    )

}

export default TutorResponsePage;