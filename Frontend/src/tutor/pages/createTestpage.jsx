import './createTestPage.css';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {crudInstance as axios} from "../../components/customAxios";
import { jwtDecode } from 'jwt-decode';
import { Navigate } from 'react-router-dom';
const jwt=localStorage.getItem("jwt");

import TutorHeader from '../TutorHeader/tutorHeader'

function CreateTestPage() {
    if (!jwt) return <Navigate to="/signIn" />;

    
    const decode=jwtDecode(jwt);
    const tutorId = decode.userId;

    const classId = useParams().classId;

    const [testName, setTestName] = useState("");
    const [maxMarks, setMaxMarks] = useState(0);
    const [duration, setDuration] = useState(0);
    const [testType, setTestType] = useState("Standard");
    const [testDate, setTestDate] = useState();
    const [testTime, setTestTime] = useState();
    const [totalQuestions, setTotalQuestions] = useState(1);
    const [questionForCustomTest, setQuestionForCustomTest] = useState("");
    const [questions, setQuestions] = useState([{
        question: "",
        answerType: "",
        options: ["", "", "", ""],
        answer: "",
        marks: ""
    }]);

    useEffect(() => {
        // it will not be more than 1
        if (totalQuestions > questions.length) {
            setQuestions(pre => [...pre, {
                question: "",
                answerType: "",
                options: ["", "", "", ""],
                answer: "",
                marks: ""
            }])
        }
    }, [totalQuestions]);

    const handleQuestionInput = (e, ind) => {
        const textArea = e.target;

        if (textArea.scrollHeight < 300) {
            textArea.style.height = "auto";
            textArea.style.height = textArea.scrollHeight + "px";
        }

        setQuestions(pre => (
            pre.map((questionDetail, i) => (i != ind ? questionDetail : { ...questionDetail, question: e.target.value }))
        ));
    }

    const handleUploadTest = async (e) => {

        e.preventDefault();
        if (testType == "Standard") {
            let totalmarks = 0

            // checking whether the all the questions are correct
            for (let i = 0; i < totalQuestions; i++) {
                if (questions[i].question.trim() == "") {
                    alert(`You have given no question for question ${i + 1}`);
                    document.getElementById(`que_${i}`).scrollIntoView({ behaviour: "smooth" });
                    return;
                }

                if (questions[i].answerType == "") {
                    alert(`You have not selected for question ${i + 1}`);
                    document.getElementById(`que_${i}`).scrollIntoView({ behaviour: "smooth" });
                    return;
                }

                if (questions[i].marks == "") {
                    alert(`You have given not provided marks for question ${i + 1}`);
                    document.getElementById(`que_${i}`).scrollIntoView({ behaviour: "smooth" });
                    return;
                }

                const ans = questions[i].answer.split(',').map(ans_ind => ans_ind.trim());
                for (let j = 0; j < ans.length; j++) {
                    if (isNaN(parseInt(ans[j]))) {
                        alert(`Answer must only contain numbers , spaces and ","`);
                        document.getElementById(`que_${i}`).scrollIntoView({ behaviour: "smooth" });
                        return;
                    }

                    if (Number(ans[j]) <= 0 || Number(ans[j]) > 4) {
                        alert("Answer must contain number 1 , 2, 3, 4 ");
                        document.getElementById(`que_${i}`).scrollIntoView({ behaviour: "smooth" });
                        return;
                    }
                }

                for (let j = 0; j < 4; j++) {
                    if (questions[i].options[j].trim() == "") {
                        alert("Options must not be empty");
                        document.getElementById(`que_${i}`).scrollIntoView({ behaviour: "smooth" });
                        return;
                    }
                }
                totalmarks += Number(questions[i].marks);
            }

            if (totalmarks > maxMarks) {
                alert("The sum of all marks of questions is exceeding the maximum marks");
                return;
            }

            const questionDetails = questions.map(que => (
                {
                    ...que,
                    answer: [...new Set(que.answer.split(',').map(a => Number(a.trim()) - 1))].sort(),
                    marks: Number(que.marks)
                }
            ));
            try {
                const response = await axios.post('/test', {
                    classId,
                    testType,
                    startDate: testDate,
                    startTime: testTime,
                    duration: duration / 60,
                    maxScore: maxMarks,
                    questionForStandardTest: questionDetails
                });
                alert(response.data.testId);
            } catch (err) {
                console.log(err);
                alert("err");
            }
        }
        else {
            try {
                const formData=new FormData();
                formData.append('classId',classId);
                formData.append('testType',testType);
                formData.append('startDate',testDate);
                formData.append('startTime',testTime);
                formData.append('duration',duration/60);
                formData.append('maxScore',maxMarks);
                formData.append('questionForCustomTest',questionForCustomTest);
                const response = await axios.post('/test', formData ,{
                    headers:{
                        "Content-Type":"multipart/form-data"
                    }
                });
                alert(response.data.testId);
            } catch(err) {
                console.log(err);
                alert("err");
            }
        }
    };

    return (
        <div className="create-test-page">
            <TutorHeader />
            <div className="courses_container">
                <form className="new_course_container" onSubmit={handleUploadTest}>
                    <div className="input_container">
                        <label htmlFor='course_name'>Test Name :</label>
                        <input type="text" className="course_name" id="course_name" value={testName} onChange={(e) => setTestName(e.target.value)} required />
                    </div>
                    <div className="input_container">
                        <label htmlFor='subject'>Max marks : </label>
                        <input type="number" className="subject" id="subject" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} required />
                    </div>
                    <div className="input_container">
                        <label htmlFor='duration'>Duration (mins): </label>
                        <input type="number" className="duration" id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} required />
                    </div>
                    <div className="input_container">
                        <label htmlFor='date'>Date : </label>
                        <input type="date" className="duration" id="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} required />
                    </div>
                    <div className="input_container">
                        <label htmlFor='time'>Time : </label>
                        <input type="time" className="duration" id="time" value={testTime} onChange={(e) => setTestTime(e.target.value)} required />
                    </div>
                    <div className="input_container" >
                        <div className="input_container" style={{ width: "50%", justifyContent: "flex-start" }}>
                            <input type="radio" name="test-type" id="standard" value={"Standard"} onChange={(e) => setTestType(e.target.value)} checked={testType == "Standard"} style={{ width: "5%" }} />
                            <label htmlFor='standard'>Standard Test</label>
                        </div>
                        <div className="input_container" style={{ width: "50%", justifyContent: "flex-start" }}>
                            <input type="radio" name="test-type" id="custom" value={"Custom"} onChange={(e) => setTestType(e.target.value)} checked={testType == "Custom"} style={{ width: "5%" }} />
                            <label htmlFor='custom'>Custom Test</label>
                        </div>
                    </div>
                    {
                        testType == "Standard" &&
                        <>
                            {
                                questions.map((que, ind) => (
                                    <div className="questions_container" key={ind} id={`que_${ind}`}>
                                        <textarea name="question" placeholder={"Question " + String(ind + 1)} onInput={(e) => handleQuestionInput(e, ind)} value={que.question}></textarea>
                                        <div className="remainder_section">
                                            <div className="input_container" >
                                                <div className="input_container" style={{ width: "50%", justifyContent: "flex-start" }}>
                                                    <input type="radio" name="answer-type" id="singlecorrect" value={"SingleCorrect"} style={{ width: "5%" }} onChange={(e) => {
                                                        setQuestions(pre => (
                                                            pre.map((questionDetail, i) => (i != ind ? questionDetail : { ...questionDetail, answerType: e.target.value }))
                                                        ))
                                                    }} />
                                                    <label htmlFor='singlecorrect'>SingleCorrect</label>
                                                </div>
                                                <div className="input_container" style={{ width: "50%", justifyContent: "flex-start" }}>
                                                    <input type="radio" name="answer-type" id="multicorrect" value={"MultiCorrect"} style={{ width: "5%" }} onChange={(e) => {
                                                        setQuestions(pre => (
                                                            pre.map((questionDetail, i) => (i != ind ? questionDetail : { ...questionDetail, answerType: e.target.value }))
                                                        ))
                                                    }} />
                                                    <label htmlFor='multicorrect"'>MultiCorrect</label>
                                                </div>
                                                <div className="input_container" style={{ width: "50%", justifyContent: "flex-start" }}>
                                                    <input type="radio" name="answer-type" id="Numerical" value={"Numerical"} style={{ width: "5%" }} onChange={(e) => {
                                                        setQuestions(pre => (
                                                            pre.map((questionDetail, i) => (i != ind ? questionDetail : { ...questionDetail, answerType: e.target.value }))
                                                        ))
                                                    }} />
                                                    <label htmlFor='Numerical'>Numerical</label>
                                                </div>
                                            </div>
                                            {
                                                que.answerType != "Numerical" &&
                                                que.options.map((opt, j) => (
                                                    <div className="input_container" key={j}>
                                                        <label htmlFor='option' >Option {j + 1} : </label>
                                                        <input type="text" id="option" required value={opt}
                                                            onChange={(e) => {
                                                                setQuestions(pre => (
                                                                    pre.map((questionDetails, i) => (
                                                                        i != ind ? questionDetails : {
                                                                            ...questionDetails,
                                                                            options: questionDetails.options.map((op, k) => (k != j ? op : e.target.value))
                                                                        }
                                                                    ))
                                                                ))
                                                            }} />
                                                    </div>
                                                ))
                                            }

                                            <div className="input_container">
                                                <label htmlFor='answer'>Answer : </label>
                                                <input type="text" id="answer" placeholder='Specify option numbers separated by commas...' required
                                                    value={que.answer}
                                                    onChange={(e) => {
                                                        setQuestions(pre => (
                                                            pre.map((questionDetails, i) => (i != ind ? questionDetails : { ...questionDetails, answer: e.target.value }))
                                                        ))
                                                    }} />
                                            </div>
                                            <div className="input_container">
                                                <label htmlFor='option'>Mark : </label>
                                                <input type="number" id="option" required
                                                    value={que.marks}
                                                    onChange={(e) => {
                                                        setQuestions(pre => (
                                                            pre.map((questionDetails, i) => (i != ind ? questionDetails : { ...questionDetails, marks: e.target.value }))
                                                        ))
                                                    }} />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                            {/* the div below is given the same name as the above even though the functionality is different purely 
                                because for css purposes */}
                            <button style={{ backgroundColor: "ButtonText" }} onClick={() => setTotalQuestions(pre => pre + 1)} type={"button"}>Add question</button>
                        </>
                    }
                    {
                        testType == "Custom" &&
                        <div className="input_container">
                            <label htmlFor='question'>Question PDF: </label>
                            <input type="file" className="custom-test-question" id="question" onChange={(e) => {
                                setQuestionForCustomTest(e.target.files[0]);
                            }} required />
                        </div>
                    }
                    <input type='submit' className="confirm_course" onClick={handleUploadTest} />
                </form>
            </div>
        </div>
    )
};

export default CreateTestPage;