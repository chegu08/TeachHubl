import './testinformation.css'
import { useNavigate } from 'react-router-dom'

function TestInformation(){
    const navigate=useNavigate();
    const tests=[{name:"Maths",timeLeft:"2 hours"},{name:"Science",timeLeft:"5 hours"},{name:"Computer science",timeLeft:"2 days"}]
    const TestInfo=[]
    tests.forEach((test)=>{
        TestInfo.push(
            <div className={test.name} key={test.name} >
                <p role='button' onClick={()=>{navigate(`/tests/${test.name}`)}}>{test.name}</p>
                <span>{test.timeLeft} left</span>
                <hr></hr>
            </div>
        )
    })
    return (<div className='info_container'>{TestInfo}</div>);
}

export default TestInformation