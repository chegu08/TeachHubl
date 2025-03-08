import './testpage.css'
// import timerIcon from '../assets/stopwatch.svg'
import arrowleft from '../assets/arrow-left-circle.svg'
import arrowright from '../assets/arrow-right-circle.svg'
import { useState, useEffect,useRef } from 'react'
import { useLocation } from 'react-router-dom'
// import { debounce } from 'lodash'
import axios from 'axios'


function Timer ({curtime}) {

    const [timer,setTimer]=useState(curtime);
    const [displayedTime,setDisplayedTime]=useState("");

    useEffect(()=>{
        const interval=setInterval(()=>{
            setTimer(pre=>(pre>0?pre-1:pre))
        },1000);
        
        return ()=>clearInterval(interval);
    },[]);

    useEffect(()=>{
        let secondsRemaining=timer;
        const hours=Math.floor(secondsRemaining/3600);
        secondsRemaining-=hours*3600;
        const minutes=Math.floor(secondsRemaining/60);
        secondsRemaining-=minutes*60;
        setDisplayedTime(()=>{
            if(hours>=1){
                return `${hours} : ${minutes} : ${secondsRemaining}`
            }
            else if(minutes>=1){
                return `${minutes} : ${secondsRemaining}`
            }
            else {
                return `${secondsRemaining}`
            }
        })

    },[timer]);

    return (
        <div className="timer" style={{backgroundColor:timer<=10?"red":""}}>
            <div className="foreground" style={{color:timer<=10?"red":""}}>
                {displayedTime}
            </div>
        </div>
    );
};

function TestPage() {
    const [questionNumber, setQuestionNumber] = useState(1);
    const [answers, setAnswers] = useState([[""]]);
    const [marked, setMarked] = useState([false]);
    const [reviewed,setReviewed]=useState([false]);
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
            setReviewed(Array(questions.length).fill(false));
            //console.log("Questions : ",questions);

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
    

    // const handleSaveAndReview=()=>{
    //     if(questions[questionNumber-1].type.toLowerCase()=='singlecorrect'){
    //         setAnswers(
    //             (pre) => pre.map((val, i) => (
    //                 i == num - 1 ? val.map((opt, j) => (j == ind ? '1' : '0')) : val)));
    //         setMarked((pre) => pre.map((mark, i) => (i == num - 1) ? true : mark));
    //     }
    //     else if(questions[questionNumber-1].type.toLowerCase()=='multicorrect'){

    //     }
    //     else{

    //     }
    //     handleReviewAndNext();
    // };

    const handleReviewAndNext=()=>{
        setReviewed(pre=>(
            pre.map((rev,ind)=>(
                ind==questionNumber-1?true:rev
            ))
        ));
        setQuestionNumber(pre=>(pre<questions.length?pre+1:pre));
    }

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

    const QuestionStatusBoard=()=>{
        return (
            <div className="status_board">
                <div className="information">
                        <button className='saved' style={{fontFamily:"sans-serif",color:"white",backgroundColor:"#0d6efd"}}>Saved</button>
                        <button className='unmarked' style={{fontFamily:"sans-serif",backgroundColor:"white"}}>Unmarked</button>
                        <button className='saveandreview' style={{fontFamily:"sans-serif",color:"white",backgroundColor:"#d8aad8"}}>Save and review</button>
                        <button className='reviewandnext' style={{fontFamily:"sans-serif",color:"white",backgroundColor:"rgb(220, 53, 69)"}}>Review and next</button>
                </div>
                <div className="status_keys">
                    {
                        questions.map((_,ind)=>(
                            <div key={ind} style={{backgroundColor:(marked[ind])?(!reviewed[ind]?"#0d6efd":"#d8aad8"):(reviewed[ind]?"rgb(220, 53, 69)":""),color:(marked[ind]||reviewed[ind])?("white"):""}}>
                                {ind}
                            </div>
                        ))
                    }
                </div>
            </div>
        )
    };

    const handleunmarkQuestion = () => {
        if (questions[questionNumber - 1].type.toLowerCase() == 'numerical') {
            setAnswers((pre) => pre.map((arr, ind) => (ind == questionNumber - 1 ? [''] : arr)));
        }
        else {
            setAnswers((pre) => pre.map((arr, ind) => (ind == questionNumber - 1 ? Array(questions[questionNumber - 1].options.length).fill(false) : arr)));
        }
        setMarked((pre) => pre.map((bool, ind) => (ind == questionNumber - 1 ? false : bool)));
        setReviewed(pre=>pre.map((rev,ind)=>(ind==questionNumber-1?false:rev)))
    };

    const handleFinishTest= async ()=>{
        // this should clear the timer and the interval so that it should automatically call test ended page
        timer.current=0;

        const userresponse=marked.map((mark,ind)=>(
            !mark?[]
            :answers[ind].map((set,_)=>(questions[ind].type=='Numerical'?Number(set):(set=='1'?1:0)))
        ));

        await axios.put(`http://localhost:4000/test/response`,{testId:currentLocation,response:userresponse});
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
                    <button className="save_and_mark" onClick={handleReviewAndNext}>Save and review</button>
                    <button className="mark_and_next" onClick={handleReviewAndNext}>Review and next</button>
                    <button className="unmark" onClick={handleunmarkQuestion}>Unmark</button>
                </div>
                {Object.keys(questions[0]).length!==0&&<Timer curtime={timer.current}/>}
            </div>
            <div className="question_and_status_board">
                <div className="questions">
                    <Question num={questionNumber} />              
                </div>
                <QuestionStatusBoard />
            </div>     
            <div className="navigation_and_finish">
                <button className="previous" onClick={() => (setQuestionNumber((pre) => (pre > 1 ? pre - 1 : pre)))} ><img src={arrowleft} width={"150%"} height={"150%"} /><div>Previous</div></button>
                <button className="next" onClick={() => (setQuestionNumber((pre) => (pre < questions.length ? pre + 1 : pre)))} ><div>Next</div><img src={arrowright} width={"150%"} height={"150%"} /></button>
                <button className="finish" onClick={handleFinishTest} style={{ backgroundColor: "#dc3545", color: "white" }}>Finish</button>
            </div>
            </>}
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