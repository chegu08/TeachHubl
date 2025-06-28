import "./tutorCalendar.css";
import { useState,useEffect } from 'react';
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

function getBackGroundColor(status) {
    if(status=="unavailable") return "rgb(250, 225, 228)";
    else if(status=="slots_left") return "rgba(41, 130, 255, 0.66)";
    else if(status=="filled") return "rgb(235, 255, 246)";
    else if(status=="out_of_range") return "rgb(222, 224, 231)";
    else return "white";
}

function TutorCalendar({ year, month, calenderInfo: calenderInfoForResponsePage }) {

    let numofDays;
    switch (month) {
        case "January":
        case "March":
        case "May":
        case "July":
        case "August":
        case "October":
        case "December":
            numofDays = 31;
            break;

        case "Febuary":
            numofDays = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28;
            break;

        default:
            numofDays = 30;
            break;
    }
    const monthMatrix = new Array(5).fill(null).map(_ => new Array(7).fill(""));
    const dayOfFirstDay = new Date(year, monthMapping[month]);
    // console.log(year ," ",month);
    let pointer = dayOfFirstDay.getDay();
    // console.log(pointer);
    // console.log(dayOfFirstDay);
    for (let i = 0; i < numofDays; i++) {
        const row = Math.floor(pointer / 7);
        const col = pointer % 7;
        // console.log("row ", row, " col ", col);
        monthMatrix[row][col] = String((i + 1));
        pointer = (pointer + 1) % 35;
    }

    const [slotsForTheMonth, setSlotsForTheMonth] = useState([]);

    useEffect(() => {

            if(!calenderInfoForResponsePage) {
                return ;
            }

        const styleInfoMatrix=new Array(numofDays).fill({status:"out_of_range"});

        calenderInfoForResponsePage.forEach(val => {
            const date=new Date(val.date);
            if(year==date.getFullYear()&&monthMapping[month]==date.getMonth()) {
                styleInfoMatrix[date.getDate()-1]={status:val.status,backGroundColor:getBackGroundColor(val.status)};
                if(val.slots) styleInfoMatrix[date.getDate()-1].slots=val.slots;
            }
        });

        setSlotsForTheMonth(styleInfoMatrix);

        
        console.log(styleInfoMatrix);

    }, [year,month,calenderInfoForResponsePage]);


    return (
        <div className="minimalcalendar" >
            <table width={"90%"} height={"90%"}>
                <thead>
                    <tr>
                        <th>Sun</th>
                        <th>Mon</th>
                        <th>Tue</th>
                        <th>Wed</th>
                        <th>Thu</th>
                        <th>Fri</th>
                        <th>Sat</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        monthMatrix.map((arr, i) => (
                            <tr key={i}>
                                {
                                    arr.map((day, j) => (
                                        <td key={j} style={slotsForTheMonth.length>0 ?{
                                            backgroundColor:slotsForTheMonth[Number(day)-1]?.backGroundColor
                                        }:{}}>{day}</td>
                                    ))
                                }
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    )
}

export default TutorCalendar;