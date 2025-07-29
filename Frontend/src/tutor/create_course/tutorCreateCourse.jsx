import './tutorCreateCourse.css';
import leftarrow from '../../assets/arrow-left.svg';
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {crudInstance as axios} from "../../components/customAxios";
import { jwtDecode } from 'jwt-decode';
const jwt=localStorage.getItem("jwt");

function TutorCreateCourse({ setMainSection }) {
    if (!jwt) return <Navigate to="/signIn" />;

    const decode=jwtDecode(jwt);

    const tutorId = decode.userId;

    const [courseName, setCourseName] = useState("");
    const [courseSubject, setCourseSubject] = useState("");
    const [courseImage, setCourseImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [courseOverview, setCourseOverview] = useState("");
    const [courseAgenda, setCourseAgenda] = useState("");
    const [chapters, setChapters] = useState([""]);
    const [resourceFiles, setResourceFiles] = useState([null]);
    const [courseDescription, setCourseDescription] = useState("");
    const [previousTemplates, setPreviousTemplates] = useState([]);
    const [maxprice,setMaxPrice]=useState();
    const [maxClass,setMaxClass]=useState();

    useEffect(() => {
        async function fetchPreviousTemplates() {
            const response = await axios.get(`/tutor/template/${tutorId}`);
            setPreviousTemplates(response.data.map(
                (temp) => ({
                    ...temp,
                    thumbnailForImage: "data:image/jpeg;base64," + temp.thumbnailForImage
                })
            ));
        };

        fetchPreviousTemplates();
    }, []);

    const handleCourseImage = (event) => {
        const filereader = new FileReader();

        filereader.onload = () => {
            console.log(filereader.result);
            setPreviewImage(filereader.result);
        }
        filereader.readAsDataURL(event.target.files[0]);
        setCourseImage(event.target.files[0]);
    };

    const checkValidityOfFormData=()=>{

        // checking whether the entered tempate name does not clash with other templates
        for(const template of previousTemplates) {
            if(courseName == template.name) {
                alert('You already have a template with the same name...\nProvide a unique name');
                return false;
            }
        }

        if(maxprice<=0) {
            alert('Max Price must not be Zero or lesser');
            return false;
        }

        if(maxClass<=0) {
            alert('Max Classes must not be Zero or lesser');
            return false;
        }

        return true;
    }

    const handleUploadTemplateCourse = async (e) => {

        e.preventDefault();

        if(!checkValidityOfFormData()) {
            return ;
        }

        const formdata = new FormData();

        // always the first file from the files array is the course Image
        // and the rest is resources for the course... this is the convention...
        // do not change this

        formdata.append('resources', courseImage);
        resourceFiles.forEach(file => {
            if (file) formdata.append('resources', file);
        });
        formdata.append('tutorId', tutorId);
        formdata.append('name', courseName);
        formdata.append('subject', courseSubject);
        formdata.append('overview', courseOverview);
        formdata.append("agenda", courseAgenda);
        formdata.append('description', courseDescription);
        formdata.append('maxPrice',maxprice);
        formdata.append('maxClasses',maxClass);
        chapters.forEach(chapter => {
            if (chapter !== '') {
                formdata.append('chapters', chapter);
            }
        });
        const response = await axios.post('/tutor/template', formdata, {
            headers: {
                "Content-Type": 'multipart/form-data'
            }
        });

        if (response.status == 200) {
            alert('A new template has been successfully created successfully');
            location.reload();
        }
        else {
            alert('Error creating the template... try again after some time');
        }
    };



    return (
        <div className="tutor_create_courses_container">
            <nav onClick={() => setMainSection("my_courses")}><img src={leftarrow} width={"20px"} height={"20px"} /> &ensp;Back to courses</nav>
            <div className="courses_container">
                <form className="new_course_container" onSubmit={handleUploadTemplateCourse}>
                    <div className="input_container">
                        <label htmlFor='course_name'>Name :</label>
                        <input type="text" className="course_name" id="course_name" value={courseName} onChange={(e) => setCourseName(e.target.value)} required />
                    </div>
                    <div className="input_container">
                        <label htmlFor='subject'>Subject: </label>
                        <input type="text" className="subject" id="subject" value={courseSubject} onChange={(e) => setCourseSubject(e.target.value)} required />
                    </div>
                    <div className="input_container">
                        <label htmlFor='course_img'>Course Image :</label>
                        <input type="file" className="course_img" id='course_img' onChange={(e) => handleCourseImage(e)} accept='image/*' required />
                    </div>
                    <div className="preview_course_image">
                        {
                            previewImage ? <img src={previewImage} height={"100%"} width={"100%"} /> : <h1>Image Preview</h1>
                        }
                    </div>
                    <div className="input_container">
                        <label htmlFor="course_description">Course Description: </label>
                        <input type="text" id='course_description' value={courseDescription} onChange={(e) => setCourseDescription(e.target.value)} required />
                    </div>
                    <div className="input_container">
                        <label htmlFor="course_overview">Course Overview: </label>
                        <input type="text" id='course_overview' value={courseOverview} onChange={(e) => setCourseOverview(e.target.value)} />
                    </div>
                    <div className="input_container">
                        <label htmlFor="course_agenda">Course Agenda: </label>
                        <input type="text" id='course_agenda' value={courseAgenda} onChange={(e) => setCourseAgenda(e.target.value)} />
                    </div>
                    <div className="input_container">
                        <label htmlFor="maxprice">Max Price: </label>
                        <input type="number" id='maxprice' value={maxprice} onChange={(e) => setMaxPrice(e.target.value)} required/>
                    </div>
                    <div className="input_container">
                        <label htmlFor="maxclass">Max Classes: </label>
                        <input type="number" id='maxclass' value={maxClass} onChange={(e) => setMaxClass(e.target.value)} required/>
                    </div>
                    <div className="chapters_container">
                        <h1>Chapters</h1>
                        {
                            chapters.map((_, ind) => (
                                <div className="input_container" key={ind}>
                                    <label htmlFor="course_chapter">Chapter {ind + 1}: </label>
                                    <input type="text" id='course_chapter' value={chapters[ind]} onChange={(e) => setChapters(pre => {
                                        const newchapters = [...pre];
                                        newchapters[ind] = e.target.value;
                                        return newchapters;
                                    })}
                                        required={ind === 0}
                                    />
                                </div>
                            ))
                        }
                        <button className="add_chapter" type='button' onClick={() => setChapters(pre => [...pre, ""])}>Add Chapter</button>
                    </div>
                    {/* the div below is given the same name as the above even though the functionality is different purely 
                        because for css purposes */}
                    <div className="chapters_container">
                        <h1>Resources</h1>
                        {
                            resourceFiles.map((_, ind) => (
                                <div className="input_container" key={ind}>
                                    <label htmlFor="course_resource">Resource {ind + 1}: </label>
                                    <input type="file" id='course_resource' onChange={(e) => setResourceFiles(pre => {
                                        const newresourcefiles = [...pre];
                                        newresourcefiles[ind] = e.target.files[0];
                                        return newresourcefiles;
                                    })} />
                                </div>
                            ))
                        }
                        <button className="add_chapter" type='button' onClick={() => setResourceFiles(pre => [...pre, null])}>Add Resourse</button>
                    </div>
                    <input type='submit' className="confirm_course" />
                </form>
                <div className="previous_courses_container">
                    <h2>Your templates</h2>
                    <ul className='previous_templates_list'>
                        {
                            previousTemplates.map((template, ind) => (
                                
                                    <button className="template" typeof='none' key={ind}>
                                        <img src={template.thumbnailForImage} height={"100%"} width={"100px"} />
                                        <div className="name_and_subject" style={{flexGrow:1,alignItems:"center",justifyContent:"left",textAlign:"left"}}>
                                            <p style={{marginTop:"15px",fontSize:"large",paddingLeft:"20px"}}>{template.name}</p>
                                            <p style={{fontSize:"small",marginTop:"5px",color:"rgb(145, 161, 214)",paddingLeft:"20px"}}>{template.subject}</p>
                                        </div>
                                    </button>
                            ))
                        }
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default TutorCreateCourse;