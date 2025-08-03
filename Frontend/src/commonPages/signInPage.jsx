import './signInPage.css';
import { Toaster, toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { crudInstance as axios } from '../components/customAxios';
import { jwtDecode } from 'jwt-decode';

import logo from '../assets/WhatsApp Image 2025-02-19 at 20.32.04_9336c379.svg';
import google_logo from '../assets/google.png';

const mailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function SignInPage() {


    const navigation = useNavigate();
    const [searchParams, _] = useSearchParams();
    const signedInWithGoogle = searchParams.get('signedInWithGoogle');
    const auth_token_key = searchParams.get('key');
    const retry_needed = searchParams.get('retryneeded');

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [preferToRemeber, setPreferToRemember] = useState(false);

    const handleSignInWithGoogle = async (e) => {
        if (role == "") {
            toast.error("Role must not be empty");
            return;
        }

        try {
            const response = await axios.get(`/login/authUrl?role=${role.toLowerCase()}&sessionType=${preferToRemeber ? "long" : "short"}`);
            window.open(response.data, "_blank", "noreferrer noopener");
        } catch (err) {
            console.log(err);
            toast.error("Error signing in with google...try again later");
        }
    };

    const handleSendRequest = async (e) => {
        e.preventDefault();
        console.log(e.target);

        if (role == "") {
            toast.error("Role must not be empty");
            return;
        }

        if (password.trim() == "" || email.trim() == "") {
            toast.error("Email or password can't be empty");
            return;
        }

        if (password.trim().length < 8) {
            toast.error("Password must contain atleast 8 character");
            return;
        }

        const isValidMail = mailRegex.test(email);
        if (!isValidMail) {
            toast.error("Email must be valid");
            return;
        }
        try {
            const response = await axios.post(`/login/${role.toLowerCase()}/emailandpassword`, {
                email, password, sessionType: preferToRemeber ? "long" : "short"
            });
            if (response.data.auth_token) {
                localStorage.setItem("jwt", response.data.auth_token);
                if (role == 'Student') navigation('/');
                else navigation('/tutor');
            }
        } catch (err) {
            if (err.status == 401) {
                toast.error("This mailId is not registered");
            }
            else if (err.status == 403) {
                toast.error("Incorrect password");
            }
            else toast.error("Error signing in...try again later");
            console.log(err);
        }
    };

    useEffect(() => {
        async function fetchAuthToken() {
            const response = await axios.post('/login/authToken', {
                key: auth_token_key
            });
            localStorage.setItem("jwt", response.data);
            const decode=jwtDecode(response.data);
            const role=decode.role;
            if (role.toLowerCase() == 'student') navigation('/');
            else navigation('/tutor');
        };

        if (signedInWithGoogle && auth_token_key && retry_needed) {
            if (signedInWithGoogle != "true" || retry_needed == "true") {
                alert("Error occured in signin...Please sign in again");
                location.reload();
            }
            fetchAuthToken();
        }
    }, []);

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
                        <p>Please enter your details</p>
                        <h1>Welcome Back</h1>
                    </div>
                    <div className="input_section">
                        <input type="email" placeholder='Email address' value={email} onChange={(e) => setEmail(e.target.value)} />
                        <input type="password" placeholder='Password' value={password} onChange={e => setPassword(e.target.value)} />
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
                        <button style={{ backgroundColor: "rgb(13, 110, 253)" }} type='submit'>Sign in</button>
                        <button style={{ backgroundColor: 'white', color: "black" }} type="button" onClick={handleSignInWithGoogle}><img src={google_logo} /> Sign in with Google </button>
                        <div className="sign_up" style={{ display: "flex", justifyContent: "center" }}>
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