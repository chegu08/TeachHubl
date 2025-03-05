import './testpage.css'
// import timerIcon from '../assets/stopwatch.svg'
import arrowleft from '../assets/arrow-left-circle.svg'
import arrowright from '../assets/arrow-right-circle.svg'
import { useState, useEffect,useRef } from 'react'
import { useLocation } from 'react-router-dom'
// import { debounce } from 'lodash'
import axios from 'axios'


function Timer ({curtime}) {
    const [time,setTime]=useState(curtime);

    useEffect(()=>{
        const interval=setInterval(()=>{
            setTime(pre=>(pre>0?pre-1:pre))
        },1000)
        return ()=>clearInterval(interval);
    },[]);

    return (
        <div className="timer" style={{backgroundColor:time<=10?"red":""}}>
            <div className="foreground" style={{color:time<=10?"red":""}}>
                {time}
            </div>
        </div>
    );
};

function TestPage() {
    const [questionNumber, setQuestionNumber] = useState(1);
    const [answers, setAnswers] = useState([[""]]);
    const [marked, setMarked] = useState([false]);
    const [completedprogressbarwidth, setCompletedprogressBarWidth] = useState('0%');
    const timer=useRef();
    const [testCompleted,setTestCompleted]=useState(false);
    const currentLocation=useLocation().pathname.substring(7);
    const [questions,setQuestions]=useState([{}]);

    useEffect(() => {
        async function fetch(){
            const fetchtestdetails=(await axios.get(`http://localhost:4000/test/${currentLocation}`)).data?.testDetails;
            if(fetchtestdetails.testType=='Standard'){
                setQuestions(()=>fetchtestdetails.questionForStandardTest.map((que,_)=>(
                    {
                        question:que.question,
                        type:que.answerType,
                        options:que.options
                    }
                )));
                timer.current=fetchtestdetails.duration*3600;
            }
        }
        fetch();
        console.log(currentLocation);
    }, [])

    useEffect(()=>{

        //console.log("questions length: ",questions.length);
        if(Object.keys(questions[0]).length !== 0){
            setAnswers(questions.map((que, ind) => (
                que.type == 'Numerical' ? Array(1).fill("") : Array(que.options.length).fill("0")
            )));
            setMarked(Array(questions.length).fill(false));
            console.log("Questions : ",questions);

        } 
    },[questions]);

    useEffect(() => {
        if(Object.keys(questions[0]).length !== 0){
            const interval = setInterval(() => {
                if(timer.current>0){
                    timer.current=timer.current-1;
                }
                else if(timer.current==0){
                    setTestCompleted(true);
                }
            }, 1000);
    
            return () => clearInterval(interval);
        }
        
    }, [questions]);

    useEffect(() => {
        console.log("Answers: ",answers);
        // console.log("marked: ",marked);
        let i = 0;
        for (let ind in marked) {
            marked[ind] == true ? i++ : i += 0;
        }
        setCompletedprogressBarWidth(String(100 * (i / questions.length)).concat('%'))
    }, [answers, marked])

    const Question = ({ num }) => {
        if (Object.keys(questions[0]).length !== 0&&questions[num - 1].type.toLowerCase() == 'singlecorrect') {
            return (
                <>
                    <h3>Question {num}</h3>
                    <p>{questions[num - 1].question}</p>
                    <div className="options">
                        {
                            questions[num - 1].options.map((option, ind) => {
                                return (
                                    <div key={ind} >
                                        <label htmlFor={ind}>{option}</label>
                                        <input id={ind} name={"answer"} type='radio'
                                            checked={answers[num - 1][ind] != '0'}
                                            onChange={(e) => {
                                                setAnswers(
                                                    (pre) => pre.map((val, i) => (
                                                        i == num - 1 ? val.map((opt, j) => (j == ind ? '1' : '0')) : val)));
                                                setMarked((pre) => pre.map((mark, i) => (i == num - 1) ? true : mark));
                                            }} />
                                    </div>
                                )
                            })
                        }
                    </div>
                </>
            )
        }
        else if (Object.keys(questions[0]).length !== 0&&questions[num - 1].type.toLowerCase() == 'multicorrect') {
            return (
                <>
                    <h3>Question {num}</h3>
                    <p>{questions[num - 1].question}</p>
                    <div className="options">
                        {
                            questions[num - 1].options.map((option, ind) => {
                                return (
                                    <div key={ind} >
                                        <label htmlFor={ind}>{option}</label>
                                        <input id={ind} name={ind} type='checkbox'
                                            checked={answers[num - 1][ind] != '0'}
                                            onChange={(e) => {
                                                setAnswers(
                                                    (pre) => pre.map((val, i) => (
                                                        i == num - 1 ? val.map((opt, j) => (j == ind ? String(1 - Number(opt)) : opt)) : val
                                                    )));
                                                setMarked((pre) => pre.map((mark, i) => (i == num - 1) ? true : mark));
                                            }} />
                                    </div>
                                )
                            })
                        }
                    </div>
                </>
            )
        }
        else if(Object.keys(questions[0]).length !== 0){
            return (
                <>
                    <h3>Question {num}</h3>
                    <p>{questions[num - 1].question}</p>
                    <input type='number'
                        value={answers[num - 1]?.[0]??""}
                        onChange={(e) => {
                            setAnswers(
                                (pre) => pre.map((val, i) => (i == num - 1) ? [e.target.value] : val));
                            setMarked((pre) => pre.map((mark, i) => (i == num - 1) ? true : mark));
                        }} />
                </>
            )
        }
    };

    const handleunmarkQuestion = () => {
        if (questions[questionNumber - 1].type.toLowerCase() == 'numerical') {
            setAnswers((pre) => pre.map((arr, ind) => (ind == questionNumber - 1 ? [''] : arr)));
        }
        else {
            setAnswers((pre) => pre.map((arr, ind) => (ind == questionNumber - 1 ? Array(questions[questionNumber - 1].options.length).fill(false) : arr)));
        }
        setMarked((pre) => pre.map((bool, ind) => (ind == questionNumber - 1 ? false : bool)));
    };

    
    return (
        
        <div className="testpage">
            {!testCompleted&&<><div className="details">
                <div className="testdetails">
                    <strong className='testname' style={{ fontSize: "larger" }}>Maths</strong>
                    <div className="fullprogressbar">
                        <div className="completedprogressbar" style={{ width: completedprogressbarwidth }}>

                        </div>
                    </div>
                    <button className="save_and_mark">Save and review</button>
                    <button className="mark_and_next">Review and next</button>
                    <button className="unmark" onClick={handleunmarkQuestion}>Unmark</button>
                </div>
                {Object.keys(questions[0]).length!==0&&<Timer curtime={timer.current}/>}
            </div>
            <div className="questions">
                <Question num={questionNumber} />
            </div>
            <div className="navigation_and_finish">
                <button className="previous" onClick={() => (setQuestionNumber((pre) => (pre > 1 ? pre - 1 : pre)))}><img src={arrowleft} width={"150%"} height={"150%"} /><div>Previous</div></button>
                <button className="next" onClick={() => (setQuestionNumber((pre) => (pre < questions.length ? pre + 1 : pre)))}><div>Next</div><img src={arrowright} width={"150%"} height={"150%"} /></button>
                <button className="finish" style={{ backgroundColor: "#dc3545", color: "white" }}>Finish</button>
            </div></>}
            {testCompleted&&
            <div className='test_ended'>
                <div className="dialog">
                    <h2>Test has ended!</h2>
                    <h3>Please wait while we are working on the assessment for this test</h3>
                </div>
            </div>}
        </div>
    )
}

export default TestPage