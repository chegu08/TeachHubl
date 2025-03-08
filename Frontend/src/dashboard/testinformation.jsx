import './testinformation.css'
import { useState,useEffect } from 'react';


function TestInformation({upcomingtests}) {
    return (
        <div className='info_container'>
            {
                upcomingtests.map((test, ind) => (
                    <div className={test.testId} key={ind} >
                        <p role='button' onClick={() => { window.open(`/tests/${test.testId}`) }}>{test.testId}</p>
                        <span>{ String(test.startDate).split('/').join('-')} {test.startTime}</span>
                        <hr></hr>
                    </div>
                ))
            }
        </div>
    );
}

export default TestInformation