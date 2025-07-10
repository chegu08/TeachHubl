import "./tutorResponsePage.css";
import { useSearchParams, useLocation,useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

import TutorHeader from "../TutorHeader/tutorHeader";
import TutorCalendar from "../dashboard/tutorCalendar";

const monthList = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const dayMapping = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
};
const monthMapping = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11
};

function TutorResponsePage() {
    const location = useLocation();
    const navigation=useNavigate();
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
    const tutorId = 'ljsdglkansdogitn';

    const [maxPrice, setMaxPrice] = useState(0);
    const [maxClasses, setmaxClasses] = useState(0);
    const [actualPrice, setActualPrice] = useState("");
    const [actualClasses, setActualClasses] = useState("");
    const [slotsFilled, setSlotsFilled] = useState(0);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(monthList[currentMonth]);
    const [existingTutorSlots, setExistingTutorSlots] = useState([]);
    const [tutorSlots, setTutorSlots] = useState([]);
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const [calenderInfoForSlots, setCalenderInfoForSlots] = useState([]);
    const [hoverOverDay, setHoverOverDay] = useState(null);
    const [showSlotsForConfirmation,setShowSlotsForConfirmation]=useState(false);

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
                const response = await axios.get(`http://localhost:4000/tutor/schedule/${tutorId}?startDate=2025-06-20&endDate=2025-08-20`);
                const response1 = await axios.get(`http://localhost:4000/tutor/slots/${tutorId}`);
                // console.log("R ",response.data);
                setTutorSlots(response1.data.tutorSlots);
                // console.log("tutor slots",response1.data.tutorSlots)
                // if(response.data.tutorSlots.length==0) {
                //     console.log("Tutor currently has no slots");
                // }
                const existingSlots = response.data?.scheduleWithMatchedDates?.map(sch => ({
                    date: sch.date,
                    slots: sch.eventDetail.map(event => ({ startTime: event.startTime, endTime: event.endTime }))
                }));
                // console.log("Existing tutor slots: ",existingSlots);
                
                setExistingTutorSlots(pre=>(existingSlots?existingSlots:pre));
                // console.log("existing ",existingSlots)
            } catch (err) {
                console.log(err);
                alert("Error fetching tutor schedule and slots ");
            }
        }
        fetchMaxClassesAndPrice();
        fetchTutorScheduleAndSlot();
    }, []);

    const handleEndDate = () => {
        if (new Date(endDate) < new Date(startDate)) {
            alert("End date must not before start Date");
            return;
        }

        const d1 = new Date(startDate);
        const d2 = new Date(endDate);
        const diff = (d2 - d1) / (1000 * 60 * 60 * 24);

        const tutorWorkingDays = tutorSlots.map(slots => dayMapping[slots.day]);
        const calenderInfo = [];

        for (let i = 0; i <= diff; i++) {
            const cur_date = new Date(d1);
            cur_date.setDate(cur_date.getDate() + i);

            if (tutorWorkingDays.includes(cur_date.getDay())) {
                // coming here indicates that this day is a working day for tutor

                // console.log("date ",cur_date.toISOString());

                const existingSlotsForToday = existingTutorSlots.filter(slot => {
                    const dstr1 = new Date(slot.date).toISOString().split('T')[0];
                    const dstr2 = new Date(cur_date).toISOString().split('T')[0];
                    return dstr1 === dstr2;
                })[0]?.slots;

                const remaining_slots_for_today = tutorSlots
                    .filter(slot => dayMapping[slot.day] === cur_date.getDay())[0].slots
                    .filter(rslot => {
                        let freeSlot = true;
                        const st = 1000 * Number(rslot.startTime.substring(0, 2)) + Number(rslot.startTime.substring(3, 5));
                        const et = 1000 * Number(rslot.endTime.substring(0, 2)) + Number(rslot.endTime.substring(3, 5));

                        existingSlotsForToday?.forEach(eslot => {
                            const st1 = 1000 * Number(eslot.startTime.substring(0, 2)) + Number(eslot.startTime.substring(3, 5));
                            const et1 = 1000 * Number(eslot.endTime.substring(0, 2)) + Number(eslot.endTime.substring(3, 5));
                            if ((st1 <= st && et <= et1) || (st <= st1 && et1 <= et) || (st <= st1 && st1 <= et) || (st <= et1 && et1 <= et)) freeSlot = false;
                            // console.log("imp debug ",st, " ",et ," ",st1,' ',et1 ,"date ",cur_date.toISOString());
                        });
                        return freeSlot;
                    })
                    .map((slot) => ({ ...slot, slot_status: "free" }));

                calenderInfo.push({
                    date: cur_date.toISOString(),
                    status: (remaining_slots_for_today.length == 0) ? "unavailable" : "slots_left",
                    slots: remaining_slots_for_today
                });

            }
            else {
                calenderInfo.push({
                    date: cur_date.toISOString(),
                    status: "not_filled"
                })
            }

        }

        setCalenderInfoForSlots(calenderInfo);
        console.log(calenderInfo);

    }

    const handleAutoFillSlots = () => {
        let slots_auto_filled = 0;
        setCalenderInfoForSlots(pre => {
            const daywiseSlotInfo = pre.map((dslot) => {
                if (dslot.status != "slots_left") return dslot;
                let slots_filled_today = 0;
                // here you have hardcoded to auto fill one slot per day
                // to give more control to the user 
                // let the user decide that in future 
                const cur_day_slots = dslot.slots.map((sl) => {
                    if (slots_auto_filled == actualClasses - slotsFilled || slots_filled_today == 1) return sl;
                    if (sl.slot_status == 'free') {
                        slots_auto_filled++;
                        slots_filled_today++;
                        return { ...sl, slot_status: "occupied" }
                    }
                    return sl;
                })
                const status_after_filling = (cur_day_slots.filter(slot => slot.slot_status == "free").length == 0) ? "filled" : "slots_left";
                return { ...dslot, slots: cur_day_slots, status: status_after_filling }
            });
            return daywiseSlotInfo;
        });
        setSlotsFilled(pre => pre + slots_auto_filled);
    };

    const handleManualFillSlot=(date_string,slot_ind)=> {
        if(slotsFilled==actualClasses) {
            alert("You have already filled all the needed slots... to fill this delete some slots");
            return ;
        }
        setCalenderInfoForSlots(pre => {
            const daywiseSlotInfo = pre.map((dslot) => {
                if (dslot.status != "slots_left") return dslot;
                if(date_string.split('T')[0]!=dslot.date.split('T')[0]) return dslot;
                const cur_day_slots = dslot.slots.map((sl,ind) => {
                    if(ind==slot_ind) return { ...sl, slot_status: "occupied" }
                    return sl;
                })
                const status_after_filling = (cur_day_slots.filter(slot => slot.slot_status == "free").length == 0) ? "filled" : "slots_left";
                return { ...dslot, slots: cur_day_slots, status: status_after_filling }
            });
            return daywiseSlotInfo;
        });
        setSlotsFilled(pre => pre + 1);
    };

    const handleAcceptRequest =async () =>{
        const scheduleForResponse=calenderInfoForSlots.filter(slot=>slot.status=="slots_left"||slot.status=="filled")
        .filter(slot=>(slot.slots?.some(s=>s.slot_status=="occupied")||false))
        .map(slot=>({
            date:slot.date.split('T')[0],
            slots:slot.slots.filter(s=>s.slot_status=="occupied").map(s=>({startTime:s.startTime,endTime:s.endTime}))
        }));

        try {
            const response=await axios.post(`http://localhost:4000/tutor/response?requestId=${requestId}&templateId=${templateId}`,
                {
                    price:actualPrice,
                    classes:actualClasses,
                    schedule:scheduleForResponse,
                    startDate,
                    endDate
                }
            );
            console.log(response.data);
            alert("Response successfully sent...Navigating back to requests section");
            navigation(-1);

        } catch (err) {
            console.log(err);
            alert(err);
        }
    };

    useEffect(() => {

        // debouncing the end date input
        const timeout = setTimeout(() => handleEndDate(), 1000);

        return () => {
            clearTimeout(timeout);
        }

    }, [endDate]);

    useEffect(()=>{
        if(maxClasses==0||actualClasses=="") return ;

        const timeout=setTimeout(() => {
            if(actualClasses>maxClasses) {
                alert(`The number of classes can't be more than ${maxClasses}`);
            }
            if(actualClasses<=0) {
                alert("You have to take atleast 1 class");
            }
        },500);

        return ()=>{
            clearTimeout(timeout);
        }

    },[actualClasses,maxClasses]);

    useEffect(()=>{
        if(maxPrice==0||actualPrice=="") return ;

        const timeout=setTimeout(()=>{
            if(actualPrice>maxPrice) {
                alert(`Price can't be more than what than ${maxPrice}`);
            }
            if(actualPrice<0) {
                alert("Price has to be greater than 0");
            }
        },500);

        return () =>clearTimeout(timeout);
    },[actualPrice,maxPrice]);

    useEffect(()=>{
        if(startDate==undefined||startDate==null) return ;

        const timeout=setTimeout(()=>{
            const inputDate=new Date(startDate);
            inputDate.setHours(0,0,0,0);
            const cur_date_ignoring_time=new Date(currentDate);
            cur_date_ignoring_time.setHours(0,0,0,0);

            if(inputDate<=cur_date_ignoring_time) {
                alert("Start date is today or already passed");
            }
        },1000);

        return ()=>clearTimeout(timeout);
    },[startDate]);

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
                            <h3 style={{ opacity: '0.9' }}>Schedule your slots</h3>
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
                        <TutorCalendar year={selectedYear} month={selectedMonth} calenderInfo={calenderInfoForSlots} setHoverOverDay={setHoverOverDay} />
                        <div className="slot-fill-container">
                            <p>
                                <span>Slots to fill : {actualClasses - slotsFilled}</span>
                                <button onClick={() => handleAutoFillSlots()}>Auto fill slots</button>
                            </p>
                            <span style={{ fontSize: "x-small", padding: "0px 2px" }}>Auto fill slots does not fill all the slots ...there might be some slots left after auto fill and it might not be a favourable slot selection all the time .
                                Please verify the slots before giving your response</span>
                        </div>
                        <div className="instructions">
                            <li type="none"><span style={{ borderColor: 'rgb(13, 253, 213)', backgroundColor: "rgb(235, 255, 246)" }}></span><em>Filled</em></li>
                            <li type="none"><span style={{ borderColor: 'rgb(13, 110, 253)', backgroundColor: "rgb(240, 245, 251)" }}></span><em>Slots left</em></li>
                            <li type="none"><span style={{ borderColor: 'rgb(220, 53, 69)', backgroundColor: 'rgb(250, 225, 228)' }}></span><em>Unavailable</em></li>
                            <li type="none"><span style={{ backgroundcolor: "white" }}></span><em>Not Filled</em></li>
                        </div>
                    </div>
                    {actualClasses!=0&&slotsFilled==actualClasses&&<button className="send_response" onClick={()=>setShowSlotsForConfirmation(true)}>Send Response</button>}
                </div>
                <div className="student-information-container">
                    <img src={null} alt='No Profile Picture' height={"300px"} width={"90%"} />
                    <h2 style={{ textAlign: "center", marginTop: "20px" }}>{location.state.studentName}</h2>
                </div>
                {
                    hoverOverDay != null && !hoverOverDay.notaday &&
                    <div className="manual_slot_fill_container" style={{ bottom: (hoverOverDay.bottom / 2) + "px", left: (hoverOverDay.left / 2) + "px", position: "absolute", zIndex: 100 }}>
                        <span>
                            Date : {new Date(selectedYear, monthMapping[selectedMonth], hoverOverDay.date).toISOString().split('T')[0]}
                            <button onClick={() => { setHoverOverDay(null) }}>X</button>
                        </span>
                        <div className="slots">
                            <h2>Slots</h2>
                            <ul type="none">
                                {
                                    calenderInfoForSlots
                                        .filter(slot => slot.status == "slots_left" || slot.status == "filled")
                                        .filter(slot => String(new Date(selectedYear, monthMapping[selectedMonth], hoverOverDay.date).toISOString()).split('T')[0] == String(slot.date).split('T')[0])[0]?.slots
                                        ?.map((slot, ind) => (
                                            <li key={ind}>
                                                <div>
                                                    <div style={{ display: "inline" }} >{slot.startTime} - {slot.endTime} </div >
                                                    {slot.slot_status == "free" && <button onClick={()=>handleManualFillSlot(new Date(selectedYear, monthMapping[selectedMonth], hoverOverDay.date).toISOString(),ind)}>Fill</button>}
                                                    {slot.slot_status == "occupied" && <strong>Slot filled!</strong>}
                                                </div>
                                            </li>
                                        ))
                                }
                                {
                                    calenderInfoForSlots
                                        .filter(slot =>  (new Date(selectedYear, monthMapping[selectedMonth], hoverOverDay.date)).toISOString().split('T')[0] == slot.date.split('T')[0] )
                                        .filter(slot => slot.status == "unavailable")[0] &&
                                    <h2>You dont have a free slot on this day according to your schedule</h2>
                                }
                                {
                                    calenderInfoForSlots
                                        .filter(slot =>  (new Date(selectedYear, monthMapping[selectedMonth], hoverOverDay.date)).toISOString().split('T')[0] == slot.date.split('T')[0] )
                                        .filter(slot => slot.status == "not_filled")[0] &&
                                        <><span>Add slots </span></>
                                }
                            </ul>
                        </div>
                    </div>
                }
                {
                    showSlotsForConfirmation&&(
                        <div className="confirmation_container">
                            <span>
                                {"Confirm Slots!"}
                                <button onClick={() => { setShowSlotsForConfirmation(false) }}>X</button>
                            </span>
                            <ul type="none">
                                {
                                    calenderInfoForSlots
                                        .filter((slot)=>slot.status=="slots_left"||slot.status=="filled")
                                        .filter(slot => {
                                            let anySlotOccupied=false;
                                            const slot_len=slot.slots?.length||0;
                                            for(let i=0;i<slot_len;i++) {
                                                if(slot.slots[i].slot_status=="occupied") {
                                                    anySlotOccupied=true;
                                                    break;
                                                }
                                            }
                                            return anySlotOccupied;
                                        })
                                        .map((dayWiseSlot,i)=>(
                                            <ul key={i} type="none">
                                                Date: {dayWiseSlot.date.split('T')[0]}
                                                {
                                                    dayWiseSlot.slots
                                                        .filter(dslot=>dslot.slot_status=="occupied")
                                                        .map((dslot,ind) =>(
                                                            <li key={ind}>{dslot.startTime} - {dslot.endTime}</li>
                                                        ))
                                                }
                                            </ul>
                                        ))
                                }
                            </ul>
                            <button className="confirm" onClick={()=>handleAcceptRequest()}>Confirm</button>
                        </div>
                    )
                }
            </div>
        </div>
    )

}

export default TutorResponsePage;