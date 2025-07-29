import './tests.css'
import {useState,useEffect} from 'react';
import {useNavigate,Navigate} from 'react-router-dom'
import {crudInstance as axios} from "../components/customAxios";
import { jwtDecode } from 'jwt-decode';
const jwt=localStorage.getItem("jwt");

function Tests(){
    if (!jwt) return <Navigate to="/signIn" />;

    const decode=jwtDecode(jwt);
    const studId=decode.userId;
    const [alltests,setAllTests]=useState();
    const navigation=useNavigate();
    useEffect(()=>{
        async function fetchalltests(studId){
            const allTests=(await axios.get(`/test/all/${studId}`)).data.allTests;
            setAllTests(allTests);
        }
        fetchalltests(studId);
    },[]);

    return (
        <div className="testspage">
                <div className="heading">
                    <strong style={{width:"40%"}}>TestName</strong>
                    <strong style={{width:"20%"}}>Class</strong>
                    <strong style={{width:"20%"}}>Date</strong>
                    <strong style={{width:"20%"}}>Status</strong>
                </div>
                <hr />
                <div className="testlist">
                    {
                        alltests&&alltests.map((test,ind)=>{
                            const date=test.startDate.substring(0,10).split('-').reverse().join("-")
                            return (<div key={ind} onClick={()=>navigation(`/analysis/${test.testId}`)}>
                                <span className="test_name" style={{width:"40%",fontSize:"large"}}>
                                    {test.testId}
                                </span>
                                <span className="subject" style={{width:"20%",fontSize:'small',color:"rgb(145, 161, 214)"}}>
                                    {test.className}
                                </span>
                                <span className="test_date" style={{width:"20%",fontSize:'small',color:"rgb(145, 161, 214)"}}>
                                    {date}
                                </span>
                                <span className="status" style={{width:"20%",fontSize:'small',color:"rgb(145, 161, 214)"}}>
                                    {test.status}
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