import './tests.css'
import {useState,useEffect} from 'react';
import axios from 'axios'

function Tests(){
    const [alltests,setAllTests]=useState();
    useEffect(()=>{
        async function fetchalltests(){
            const allTests=(await axios.get('http://localhost:4000/test/all/cheguevera')).data.allTests;
            setAllTests(allTests);
        }
        fetchalltests();
    },[]);

    return (
        <div className="testspage">
                <div className="heading">
                    <strong style={{width:"40%"}}>TestName</strong>
                    <strong style={{width:"20%"}}>subject</strong>
                    <strong style={{width:"20%"}}>Date</strong>
                    <strong style={{width:"20%"}}>Status</strong>
                </div>
                <hr />
                <div className="testlist">
                    {
                        alltests&&alltests.map((test,ind)=>{
                            const date=test.startDate.substring(0,10).split('-').reverse().join("-")
                            return (<div key={ind}>
                                <span className="test_name" style={{width:"40%",fontSize:"large"}}>
                                    {test.testId}
                                </span>
                                <span className="subject" style={{width:"20%",fontSize:'small',color:"rgb(145, 161, 214)"}}>
                                    Computer
                                </span>
                                <span className="test_date" style={{width:"20%",fontSize:'small',color:"rgb(145, 161, 214)"}}>
                                    {date}
                                </span>
                                <span className="status" style={{width:"20%",fontSize:'small',color:"rgb(145, 161, 214)"}}>
                                    {test.completed?"completed":"Not completed"}
                                </span>
                            </div>)
                            
                        }
                            
                        )
                    }
                </div>
        </div>
    )
}

export default Tests