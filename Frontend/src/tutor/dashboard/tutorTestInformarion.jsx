import './tutorTestInformation.css';

function TutorTestInformation ({uncorrectedtests}) {
return (
        <div className='info_container'>
            {
                uncorrectedtests.map((test, ind) => (
                    <div className={test.testId} key={ind} >
                        {/* 
                            onclick is not used just for now
                            once the page where tutor is able to provide feecback is built
                            then clcking here should take the tutor to that page
                         */}
                        <p role='button' >{test.testId}</p>
                        <span>{ String(test.startDate).split('/').join('-')} {test.startTime}</span>
                        <hr></hr>
                    </div>
                ))
            }
        </div>
    );
};

export default TutorTestInformation;