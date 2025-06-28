import './calendar.css'

function Calendar({year,month}){
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
    let numofDays;
    switch (month) {
        case "January":
        case "March":
        case "May":
        case "July":
        case "August":
        case "October":
        case "December":
            numofDays=31;
            break;
        
        case "Febuary" :
            numofDays=(year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28;
            break;
    
        default:
            numofDays=30;
            break;
    }
    const monthMatrix=new Array(5).fill(null).map(_=>new Array(7).fill(""));
    const dayOfFirstDay=new Date(year,monthMapping[month]);
    let pointer=dayOfFirstDay.getDay();
    for(let i=0;i<numofDays;i++) {
        const row=Math.floor(pointer/7);
        const col=pointer%7;
        monthMatrix[row][col]=String(i+1);
        pointer=(pointer+1)%35;
    }
    return (
        <div className="minimalcalendar" >
            <table width={"90%"} height={"90%"}>
                <tr>
                    <th>Sun</th>
                    <th>Mon</th>
                    <th>Tue</th>
                    <th>Wed</th>
                    <th>Thu</th>
                    <th>Fri</th>
                    <th>Sat</th>
                </tr>
                {
                    monthMatrix.map((arr,i)=>(
                        <tr key={i}>
                            {
                                arr.map((day,j)=>(
                                    <td key={j}>{day}</td>
                                ))
                            }
                        </tr>
                    ))
                }
            </table>
        </div>
    )
}

export default Calendar