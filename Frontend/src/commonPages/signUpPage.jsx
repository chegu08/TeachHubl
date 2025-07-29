import { Toaster, toast } from 'sonner';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { crudInstance as axios } from '../components/customAxios'

import logo from '../assets/WhatsApp Image 2025-02-19 at 20.32.04_9336c379.svg';
import google_logo from '../assets/google.png';

function SignUpPage() {

    const navigation=useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [role, setRole] = useState("");
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [age, setAge] = useState("");
    const [preferredSubjects, setPreferredSubject] = useState([]);
    const [preferToRemeber, setPreferToRemember] = useState(false);
    const [gender,setGender]=useState("");
    const [degree,setDegree]=useState("");
    const [address,setAddress]=useState("");
    const [yearsOfExperience,setYearsOfExperience]=useState("");
    

    const handleSendRequest = async (e) => {
        e.preventDefault();

        if (password.length < 8) {
            toast.error("Password must be atleast 8 characters");
            return;
        }
        if (password != repeatPassword) {
            toast.error("Passwords did not match");
            return;
        }

        if (name.trim() == "") {
            toast.error("Name Cannot be empty");
            return;
        }

        const name_length = name.length;
        for (let i = 0; i < name_length; i++) {
            if (!((name[i] >= 'a' && name[i] <= 'z') || (name[i] >= 'A' && name[i] <= 'Z') || (name[i] >= '0' && name[i] <= '9') || name[i] == ' ')) {
                toast.error("Name must contain only alpha numericals and ' ' ");
                return;
            }
        }

        // if(Number(age.trim())==undefined||Number(age.trim()) === NaN) {
        //     toast.error("Age must be a valid number");
        //     return ;
        // }

        if (String(phoneNumber).trim().length != 10) {
            toast.error("Phone number must be 10 digits long");
            return;
        }

        if (role == "") {
            toast.error("Role must be mentioned");
            return;
        }

        if(role=="Tutor") {
            if(degree.trim()=='') {
                toast.error("Degree cannot be empty");
                return ;
            }
            if(yearsOfExperience<0) {
                toast.error("Experience cannot be negative");
                return ;
            }
        }

        try {
            const response = await axios.post(`/signup/${role}/emailAndPassword`, {
                age,
                name: name.trim(),
                phoneNumber,
                preferredSubjects,
                email,
                password,
                sessionType: (preferToRemeber) ? "long" : "short",
                prefession: role,
                gender,
                address,
                yearsofExperience:yearsOfExperience,
                degree
            });
            if(response.data.auth_token) {
                localStorage.setItem("jwt",response.data.auth_token);
                if(role=='Student') navigation('/');
                else navigation('/tutor');
            }
        } catch (err) {
            console.log(err);
            toast.error("Error signing up...retry later");
        }

    };

    return (
        <div className="signin_page">
            <Toaster richColors />
            <header>
                <img src={logo} />
                <strong>TeachHubl</strong>
            </header>
            <div className="body">
                <form className="section_box" onSubmit={handleSendRequest}>
                    <div className="guidance_section">
                        <p>Start your journey</p>
                        <h1>Sign Up to TeachHubl</h1>
                    </div>
                    <div className="input_section">
                        <input type="text" placeholder='Name' value={name} onChange={(e) => setName(e.target.value)} required />
                        <input type="number" placeholder='Phone Number' value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                        <input type='number' placeholder='Age' value={age} onChange={e => setAge(e.target.value)} required />
                        <input type="email" placeholder='Email address' value={email} onChange={(e) => setEmail(e.target.value)} required />
                        {
                            role=='Tutor'&&
                            <>
                                <input type="text" placeholder='gender' value={gender} onChange={e=>setGender(e.target.value)} required/>
                                <input type="text" placeholder='Degree' value={degree} onChange={e=>setDegree(e.target.value)} required/>
                                <input type="text" placeholder='Address' value={address} onChange={e=>setAddress(e.target.value)} required/>
                                <input type="number" placeholder='Years Of Experience' value={yearsOfExperience} onChange={e=>setYearsOfExperience(e.target.value)} required/>
                            </>
                        }
                        <input type="password" placeholder='Password' value={password} onChange={e => setPassword(e.target.value)} required />
                        <input type="password" placeholder='Repeat Password' value={repeatPassword} onChange={e => setRepeatPassword(e.target.value)} required />
                        <select value={role} onChange={e => setRole(e.target.value)}>
                            <option value="">Select a role</option>
                            <option value="Student">Student</option>
                            <option value="Tutor">Tutor</option>
                        </select>
                        <div className="forgot_section">
                            <div className="forgot">
                                <input type="checkbox" id='remember' checked={preferToRemeber} onChange={e => setPreferToRemember(e.target.checked)} />&nbsp;
                                <label htmlFor="remember">Remember me for 30 days</label>
                            </div>
                            <a href="/">Forgot password</a>
                        </div>
                    </div>
                    <div className="button_section">
                        <button style={{ backgroundColor: "rgb(13, 110, 253)", height: "50px" }} type='submit'>Sign up</button>
                        <button style={{ backgroundColor: 'white', color: "black", height: "50px" }} type='button'><img src={google_logo} /> Sign in with Google </button>
                        <div className="sign_up" style={{ display: "flex", justifyContent: "center" }}>
                            <span>Already have an account?</span> &nbsp;
                            <a href="/">Sign in</a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
};

export default SignUpPage;