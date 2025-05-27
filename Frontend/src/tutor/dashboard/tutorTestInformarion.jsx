import './tutorTestInformation.css';
import {useNavigate} from 'react-router-dom';

function TutorTestInformation ({uncorrectedtests}) {
    const navigation=useNavigate();
return (
        <div className='info_container'>
            {
                uncorrectedtests.map((test, ind) => (
                    <div className={test.testId} key={ind} role='button' onClick={()=>navigation(`/tutor/feedback/${test.testId}`)}>
                        {/* 
                            onclick is not used just for now
                            once the page where tutor is able to provide feecback is built
                            then clcking here should take the tutor to that page
                         */}
                        <p>{test.testId}</p>
                        <span>{ String(test.startDate).split('/').join('-')} {test.startTime}</span>
                        <hr></hr>
                    </div>
                ))
            }
        </div>
    );
};

export default TutorTestInformation;