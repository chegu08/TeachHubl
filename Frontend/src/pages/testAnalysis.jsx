import './testAnalysis.css'
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react'
import axios from 'axios'

function TestAnalysis() {

    const testId = useLocation().pathname.substring(10);
    const [testStatistics, setTestStatistics] = useState({});
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [questionNumber,setQuestionNumber]=useState(2);
    const [questions,setQuestions]=useState([{}]);
    //let questions=[{}];

    useEffect(() => {

        async function fetchTestStatistics() {
            const response = await axios.get(`http://localhost:4000/test/statistics/${testId}`);
            setTestStatistics(response.data.statistics);
            setQuestions(response.data.statistics.questionForStandardTest.map((que,ind)=>(
                {
                    question:que.question,
                    type:que.answerType,
                    options:que.options,
                    response:response.data.statistics.response[ind],
                    mark:response.data.statistics.result.scores[ind],
                    answer:que.answer
                }
            )));
            setTotalQuestions(response.data.statistics.questionForStandardTest.length);
            
        }


        fetchTestStatistics();

    }, []);

    useEffect(()=>{
        console.log(questions);
        console.log("Test statistics : ",testStatistics);
    },[questions])


    const Question = ({ num }) => {

        const styleforWronglyMarkedResponse={
            backgroundColor:"rgb(250, 225, 228)",
            border:"1px solid rgb(220, 53, 69)"
        }

        const styleforCorrectlyMarkedResponse={
            backgroundColor:"rgb(235, 255, 246)",
            border:"1px solid rgb(13, 253, 117)"
        }

        const styleForCorrectAnswer={
            backgroundColor:"rgb(240, 245, 251)",
            border:"1px solid rgb(13, 110, 253)"
        }

        const styleForUnmarked={
            backgroundColor:'white'
        }

        if (Object.keys(questions[0]).length !== 0&&questions[num - 1].type.toLowerCase() == 'singlecorrect') {
            return (
                <>
                    <h3>Question {num}</h3>
                    <p>{questions[num - 1].question}</p>
                    <div className="options">
                        {
                            questions[num - 1].options.map((option, ind) => {
                                return (
                                    <div key={ind} 
                                    style={questions[num-1].answer.includes(ind)?(questions[num-1].response[ind]==1?styleforCorrectlyMarkedResponse:styleForCorrectAnswer)
                                    :(questions[num-1].response[ind]==1?styleforWronglyMarkedResponse:styleForUnmarked)}>
                                        <label htmlFor={ind}>{option}</label>
                                        <span id={ind} name={"answer"} />
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
                                    <div key={ind}
                                    style={questions[num-1].answer.includes(ind)?(questions[num-1].response[ind]==1?styleforCorrectlyMarkedResponse:styleForCorrectAnswer)
                                        :(questions[num-1].response[ind]==1?styleforWronglyMarkedResponse:styleForUnmarked)}>
                                        <label htmlFor={ind}>{option}</label>
                                        <span id={ind} name={ind} />
                                    </div>
                                )
                            })
                        }
                    </div>
                </>
            )
        }
        else if(Object.keys(questions[0]).length !== 0){
            const space=' '
            return (
                <>
                    <h3>Question {num}</h3>
                    <p>{questions[num - 1].question}</p>
                    <span className='number'
                    style={questions[num-1].response.length==0?styleForUnmarked:(questions[num-1].response[0]==questions[num-1].answer[0]?styleforCorrectlyMarkedResponse:styleforWronglyMarkedResponse)} 
                    >
                        {(questions[num-1].response.length==0||(questions[num-1].response.length>0&&questions[num-1].answer[0]==questions[num-1].response[0]))&&questions[num-1].answer[0]}
                        {
                            questions[num-1].response.length>0&&questions[num-1].answer[0]!=questions[num-1].response[0]&&
                            <>
                                <s >{questions[num-1].response[0]}</s>
                                <span>{space} {questions[num-1].answer[0]}</span>
                            </>
                            
                            
                        }
                        
                    </span>
                </>
            )
        }
    };


    return (
        <div className='test_analysis'>
            <div className="question_navigation">
                <strong style={{ fontSize: "large" }}>{testId}</strong>
                <div className="instructions">
                    <li type="none"><span style={{ borderColor: 'rgb(13, 253, 213)', backgroundColor: "rgb(235, 255, 246)" }}></span><em>Correctly marked</em></li>
                    <li type="none"><span style={{ borderColor: 'rgb(13, 110, 253)', backgroundColor: "rgb(240, 245, 251)" }}></span><em>Correct</em></li>
                    <li type="none"><span style={{ borderColor: 'rgb(220, 53, 69)', backgroundColor: 'rgb(250, 225, 228)' }}></span><em>Incorrect</em></li>
                    <li type="none"><span style={{ backgroundcolor: "white" }}></span><em>Unmarked</em></li>
                </div>
                <div className="question_status">
                    {
                        Object.keys(testStatistics).length != 0 &&
                        testStatistics.status.map((responsestatus, i) => {
                            const StyleForCorrectResponse={ borderColor: 'rgb(13, 110, 253)', backgroundColor: "rgb(240, 245, 251)" }
                            const StyleForIncorrectResponse={ borderColor: 'rgb(220, 53, 69)', backgroundColor: 'rgb(250, 225, 228)' }
                            const StyleForUnmarkedResponse={ backgroundcolor: "white" }
                            const style=responsestatus=='correct'?StyleForCorrectResponse:(responsestatus=='incorrect'?StyleForIncorrectResponse:StyleForUnmarkedResponse);
                            return (
                                <span key={i + 1} style={style} onClick={()=>setQuestionNumber(i+1)}>{i + 1}</span>
                            )
                        })
                    }
                </div>
            </div>
            <div className="questions_and_feedback">
                    <div className="questions">
                        <Question num={questionNumber}/>
                    </div>
                    <div className="feedback">

                    </div>
            </div>
            <div className="statistics">

            </div>
        </div>
    )
}

export default TestAnalysis