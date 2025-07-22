import './testAnalysis.css'
import { useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { Bar, Pie } from 'react-chartjs-2'
import { Chart, LinearScale, CategoryScale, BarElement, Legend, Tooltip, plugins, ArcElement } from 'chart.js'

Chart.register(LinearScale, CategoryScale, BarElement, Legend, Tooltip, ArcElement);

const ReportChart = ({ testStatistics, type }) => {
    console.log("Logging from chart: ", testStatistics);
    const totalQuestions = testStatistics.questionForStandardTest.length;
    let correct = 0, incorrect = 0, unmarked = 0;
    testStatistics.status.forEach(stat => {
        if (stat == 'correct') {
            correct++;
        }
        else if (stat == 'incorrect') {
            incorrect++;
        }
        else {
            unmarked++;
        }
    })
    const DataSet = {
        data: [correct, incorrect, unmarked],
        backgroundColor: ["green", "red", "orange"],
        borderRadius: type == 'bar' ? 5 : 0,
        barThickness: 100,
        order: 1,
        categoryPercentage: 1
    };


    const options = {
        responsive: true,
        maintainAspectRatio: false, // Allows better control of bar spacing
        plugins: {
            legend: {
                display: type == 'bar' ? false : true,
            }
        },
        scales: {
            x: {
                grid: { display: false },
                categoryPercentage: 0.6,  // Reduce space between bars (default 0.8)
                barPercentage: 0.5,     // Increase bar width
            },
            y: {
                grid: { display: type == 'pie' ? false : true },
                beginAtZero: true,
                min: 0,       // Start from 0
                max: totalQuestions,     // End at 100
                ticks: {
                    stepSize: 1 // Increments of 10
                }
            }
        }
    };
    const data = {
        labels: ["Answered correctly", "Answered wrongly", "Unmarked"],
        datasets: [DataSet]
    }
    return (
        <div style={{ height: "80%", width: "80%", margin: "auto" }}>
            {
                type == 'bar' &&
                <Bar data={data} options={options} />
            }
            {
                type == 'pie' &&
                <Pie data={data} options={options} />
            }
        </div>

    );
};

function TestAnalysis() {

    const testId = useLocation().pathname.substring(10);
    const [testStatistics, setTestStatistics] = useState({});
    //const [totalQuestions, setTotalQuestions] = useState(0);
    const [questionNumber, setQuestionNumber] = useState(1);
    const [questions, setQuestions] = useState([{}]);
    const [chartType, setChartType] = useState("bar");
    const [testType, setTestType] = useState("");
    //let questions=[{}];

    useEffect(() => {

        async function fetchTestStatistics() {
            const response = await axios.get(`http://localhost:4000/test/statistics/${testId}`);
            setTestStatistics(response.data.statistics);
            if (response.data.statistics == "Standard") {
                setTestType("Standard");
                setQuestions(response.data.statistics.questionForStandardTest.map((que, ind) => (
                    {
                        question: que.question,
                        type: que.answerType,
                        options: que.options,
                        response: response.data.statistics.response[ind],
                        mark: response.data.statistics.result.scores[ind],
                        answer: que.answer
                    }
                )));
            } else {
                setTestType("Custom");
            }

            //setTotalQuestions(response.data.statistics.questionForStandardTest.length);

        }

        fetchTestStatistics();

    }, []);

    const memoizedtestStatics = useMemo(() => testStatistics, [testStatistics]);

    useEffect(() => {
        console.log(questions);
        console.log("Test statistics : ", testStatistics);
    }, [questions])


    const Question = ({ num }) => {

        const styleforWronglyMarkedResponse = {
            backgroundColor: "rgb(250, 225, 228)",
            border: "1px solid rgb(220, 53, 69)"
        }

        const styleforCorrectlyMarkedResponse = {
            backgroundColor: "rgb(235, 255, 246)",
            border: "1px solid rgb(13, 253, 117)"
        }

        const styleForCorrectAnswer = {
            backgroundColor: "rgb(240, 245, 251)",
            border: "1px solid rgb(13, 110, 253)"
        }

        const styleForUnmarked = {
            backgroundColor: 'white'
        }

        if (Object.keys(questions[0]).length !== 0 && questions[num - 1].type.toLowerCase() == 'singlecorrect') {
            return (
                <>
                    <h3>Question {num}</h3>
                    <p>{questions[num - 1].question}</p>
                    <div className="options">
                        {
                            questions[num - 1].options.map((option, ind) => {
                                return (
                                    <div key={ind}
                                        style={questions[num - 1].answer.includes(ind) ? (questions[num - 1].response[ind] == 1 ? styleforCorrectlyMarkedResponse : styleForCorrectAnswer)
                                            : (questions[num - 1].response[ind] == 1 ? styleforWronglyMarkedResponse : styleForUnmarked)}>
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
        else if (Object.keys(questions[0]).length !== 0 && questions[num - 1].type.toLowerCase() == 'multicorrect') {
            return (
                <>
                    <h3>Question {num}</h3>
                    <p>{questions[num - 1].question}</p>
                    <div className="options">
                        {
                            questions[num - 1].options.map((option, ind) => {
                                return (
                                    <div key={ind}
                                        style={questions[num - 1].answer.includes(ind) ? (questions[num - 1].response[ind] == 1 ? styleforCorrectlyMarkedResponse : styleForCorrectAnswer)
                                            : (questions[num - 1].response[ind] == 1 ? styleforWronglyMarkedResponse : styleForUnmarked)}>
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
        else if (Object.keys(questions[0]).length !== 0) {
            const space = ' '
            return (
                <>
                    <h3>Question {num}</h3>
                    <p>{questions[num - 1].question}</p>
                    <span className='number'
                        style={questions[num - 1].response.length == 0 ? styleForUnmarked : (questions[num - 1].response[0] == questions[num - 1].answer[0] ? styleforCorrectlyMarkedResponse : styleforWronglyMarkedResponse)}
                    >
                        {(questions[num - 1].response.length == 0 || (questions[num - 1].response.length > 0 && questions[num - 1].answer[0] == questions[num - 1].response[0])) && questions[num - 1].answer[0]}
                        {
                            questions[num - 1].response.length > 0 && questions[num - 1].answer[0] != questions[num - 1].response[0] &&
                            <>
                                <s >{questions[num - 1].response[0]}</s>
                                <span>{space} {questions[num - 1].answer[0]}</span>
                            </>
                        }

                    </span>
                </>
            )
        }
    };

    return (
        <div className='test_analysis'>
            {
                testType == "Standard" &&
                <>
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
                                    const StyleForCorrectResponse = { borderColor: 'rgb(13, 110, 253)', backgroundColor: "rgb(240, 245, 251)" }
                                    const StyleForIncorrectResponse = { borderColor: 'rgb(220, 53, 69)', backgroundColor: 'rgb(250, 225, 228)' }
                                    const StyleForUnmarkedResponse = { backgroundcolor: "white" }
                                    const style = responsestatus == 'correct' ? StyleForCorrectResponse : (responsestatus == 'incorrect' ? StyleForIncorrectResponse : StyleForUnmarkedResponse);
                                    return (
                                        <span key={i + 1} style={style} onClick={() => setQuestionNumber(i + 1)}>{i + 1}</span>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <div className="questions_and_feedback">
                        <div className="questions">
                            <Question num={questionNumber} />
                        </div>
                        <div className="feedback">
                            <h2>Feedback: </h2>
                        </div>
                    </div>
                    <div className="statistics">
                        <div className="type_of_chart">
                            <h1 >REPORT</h1>
                            <select name="type of bar" id='type'
                                value={chartType}
                                onChange={(e) => setChartType(e.target.value)}
                            >
                                <option value="bar" >Bar</option>
                                <option value="pie" >Pie</option>
                            </select>
                        </div>
                        <div className="chart" >
                            {
                                Object.keys(testStatistics).length != 0 &&
                                <ReportChart testStatistics={memoizedtestStatics} type={chartType} />
                            }
                        </div>

                    </div>
                </>
            }
            {
                testType == "Custom" &&
                <div className='test_ended'>
                    <div className="dialog">
                        <h2>This is a Descriptive test.</h2>
                        <h3>Feedback and analysis might not be available .</h3>
                    </div>
                </div>
            }
        </div>
    )
}

export default TestAnalysis