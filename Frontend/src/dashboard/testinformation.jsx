import './testinformation.css'
import { useNavigate } from 'react-router-dom'

function TestInformation() {
    const tests = [{ name: "Maths", timeLeft: "2 hours" }, { name: "Science", timeLeft: "5 hours" }, { name: "Computer science", timeLeft: "2 days" }]
    return (
        <div className='info_container'>
            {
                tests.map((test, ind) => (
                    <div className={test.name} key={ind} >
                        <p role='button' onClick={() => { window.open(`/tests/${test.name}`) }}>{test.name}</p>
                        <span>{test.timeLeft} left</span>
                        <hr></hr>
                    </div>
                ))
            }
        </div>
    );
}

export default TestInformation