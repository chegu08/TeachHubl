import './testpage.css'
// import timerIcon from '../assets/stopwatch.svg'
import arrowleft from '../assets/arrow-left-circle.svg'
import arrowright from '../assets/arrow-right-circle.svg'
import { useState } from 'react'

function TestPage() {
    const [questionNumber,setQuestionNumber]=useState(1);
    const questions = [
        {
            type: "singlecorrect",
            question: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio sunt saepe ea, est maiores impedit praesentium quas consequuntur repudiandae necessitatibus officia veritatis tenetur quis, dolore accusantium ad fugit mollitia dolor! Deserunt, possimus perspiciatis laudantium dolores ex facilis amet incidunt, porro inventore necessitatibus ipsum sapiente dolor ducimus? Quibusdam perspiciatis nisi suscipit!`,
            options:['Option 1','Option 2','Option 3',"Option 4"]
        },
        {
            type: "multicorrect",
            question: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio sunt saepe ea, est maiores impedit praesentium quas consequuntur repudiandae necessitatibus officia veritatis tenetur quis, dolore accusantium ad fugit mollitia dolor! Deserunt, possimus perspiciatis laudantium dolores ex facilis amet incidunt, porro inventore necessitatibus ipsum sapiente dolor ducimus? Quibusdam perspiciatis nisi suscipit!`,
            options:['Option 1','Option 2','Option 3',"Option 4"]
        },
        {
            type: "numerical",
            question: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio sunt saepe ea, est maiores impedit praesentium quas consequuntur repudiandae necessitatibus officia veritatis tenetur quis, dolore accusantium ad fugit mollitia dolor! Deserunt, possimus perspiciatis laudantium dolores ex facilis amet incidunt, porro inventore necessitatibus ipsum sapiente dolor ducimus? Quibusdam perspiciatis nisi suscipit!`
        }
    ]

    const Question = ({ num }) => {
        if (questions[num - 1].type == 'singlecorrect') {
            return (
                <>
                    <h3>Question {num}</h3>
                    <p>{questions[num-1].question}</p>
                    <div className="options">
                        {
                            questions[num-1].options.map((option,ind)=>{
                                return (
                                    <div key={ind} >
                                        <label htmlFor={ind}>{option}</label>
                                        <input id={ind} name={"answer"} type='radio'/>
                                    </div>
                                )
                            })
                        }
                    </div>
                </>
            )
        }
        else if (questions[num - 1].type == 'multicorrect') {
            return (
                <>
                    <h3>Question {num}</h3>
                    <p>{questions[num-1].question}</p>
                    <div className="options">
                        {
                            questions[num-1].options.map((option,ind)=>{
                                return (
                                    <div key={ind} >
                                        <label htmlFor={ind}>{option}</label>
                                        <input id={ind} name={ind} type='checkbox'/>
                                    </div>
                                )
                            })
                        }
                    </div>
                </>
            )
        }
        else {
            return (
                <>
                    <h3>Question {num}</h3>
                    <p>{questions[num-1].question}</p>
                    <input type='number'/>
                </>
            )
        }
    };

    return (
        <div className="testpage">
            <div className="details">
                <div className="testdetails">
                    <strong className='testname' style={{ fontSize: "larger" }}>Maths</strong>
                    <div className="fullprogressbar">
                        <div className="completedprogressbar">

                        </div>
                    </div>
                    <button className="save_and_mark">save and review</button>
                    <button className="mark_and_next">review and next</button>
                </div>
                <div className="timer">
                    <div className="foreground">
                        150:00 mins
                    </div>
                </div>
            </div>
            <div className="questions">
                <Question num={questionNumber} />
            </div>
            <div className="navigation_and_finish">
                <button className="previous" onClick={()=>(setQuestionNumber((pre)=>(pre>1?pre-1:pre)))}><img src={arrowleft} width={"150%"} height={"150%"} /><div>Previous</div></button>
                <button className="next" onClick={()=>(setQuestionNumber((pre)=>(pre<questions.length?pre+1:pre)))}><div>Next</div><img src={arrowright} width={"150%"} height={"150%"} /></button>
                <button className="finish" style={{ backgroundColor: "#dc3545", color: "white" }}>Finish</button>
            </div>
        </div>
    )
}

export default TestPage