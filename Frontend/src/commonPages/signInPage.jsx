import './signInPage.css';
import { Toaster, toast } from 'sonner';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { crudInstance as axios } from '../components/customAxios';

import logo from '../assets/WhatsApp Image 2025-02-19 at 20.32.04_9336c379.svg';
import google_logo from '../assets/google.png';

function SignInPage() {

    const navigation=useNavigate();

    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [role,setRole]=useState("");
    const [preferToRemeber,setPreferToRemember]=useState(false);

    const handleSendRequest= async (e) =>{
        e.preventDefault();

        if(role=="") {
            toast.error("Role must not be empty");
            return ;
        }

        try {
            const response=await axios.post(`/login/${role.toLowerCase()}/emailandpassword`,{
                email,password,sesssionType:preferToRemeber?"long":"short"
            });
            if(response.data.auth_token) {
                localStorage.setItem("jwt",response.data.auth_token);
                if(role=='Student') navigation('/');
                else navigation('/tutor');
            }
        } catch(err) {
            if(err.status==401) {
                toast.error("This mailId is not registered");
            }
            else if(err.status==403) {
                toast.error("Incorrect password");
            }
            else toast.error("Error signing in...try again later");
            console.log(err);
        }
    };

    return (
        <div className="signin_page">
            <Toaster />
            <header>
                <img src={logo} />
                <strong>TeachHubl</strong>
            </header>
            <div className="body">
                <form className="section_box" onSubmit={handleSendRequest}>
                    <div className="guidance_section">
                        <p>Please enter your details</p>
                        <h1>Welcome Back</h1>
                    </div>
                    <div className="input_section">
                        <input type="email" placeholder='Email address' value={email} onChange={(e)=>setEmail(e.target.value)} required/>
                        <input type="password" placeholder='Password' value={password} onChange={e=>setPassword(e.target.value)} required/>
                        <select value={role} onChange={e=>setRole(e.target.value)}>
                            <option value="">Select a role</option>
                            <option value="Student">Student</option>
                            <option value="Tutor">Tutor</option>
                        </select>
                        <div className="forgot_section">
                            <div className="forgot">
                                <input type="checkbox" id='remember' checked={preferToRemeber} onChange={e=>setPreferToRemember(e.target.checked)}/>&nbsp;
                                <label htmlFor="remember">Remember me for 30 days</label>
                            </div>
                            <a href="/">Forgot password</a>
                        </div>
                    </div>
                    <div className="button_section">
                        <button style={{backgroundColor:"rgb(13, 110, 253)"}} type='submit'>Sign in</button>
                        <button style={{backgroundColor:'white',color:"black"}}><img src={google_logo}  type="button"/> Sign in with Google </button>
                        <div className="sign_up" style={{display:"flex",justifyContent:"center"}}>
                            <span>Don't have an account?</span> &nbsp;
                            <a href="/signUp">Sign up</a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default SignInPage;