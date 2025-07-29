import './paymentPage.css';
import logo from '/WhatsApp Image 2025-02-19 at 20.32.04_9336c379.jpg'
import {crudInstance as axios} from "../components/customAxios"
import { useLocation } from 'react-router-dom';

function loadScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement('script')
        script.src = src
        script.onload = () => {
            resolve(true)
        }
        script.onerror = () => {
            resolve(false)
        }
        document.body.appendChild(script)
    })
}

async function displayRazorpay(amount, studId,courseName,startDate,tutorName,tutorId,templateId,schedule,endDate,classCount,subject,chaptersRequested) {

    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js')

    if (!res) {
        alert('Razropay failed to load!!')
        return
    }

    let data;
    try {
        data = (await axios.post("http://localhost:4000/payment", {
            amount: amount*100,
            currency: "INR",
            receipt: "receipt",
            studId,
            courseName,
            startDate,
            tutorName,
            tutorId,
            templateId,
            schedule,
            endDate,
            classCount,
            subject,
            chaptersRequested
        })).data;

        console.log(data)
    } catch (err) {
        console.log(err);
        alert(err);
        return;
    }


    const options = {
        "key": import.meta.env.VITE_KEY_ID, // Enter the Key ID generated from the Dashboard
        "amount": data.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "TeachHubl",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": data.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "callback_url": "http://localhost:4000/payment/callback",
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
}

function PaymentPage() {

    const { courseName, tutorName, startDate, endDate, subtotal, platformFee, total, studId,templateId,tutorId,schedule,classCount,subject,chaptersRequested } = useLocation().state;

    return (
        <div className="payment_page">
            <div className="logo_and_title">
                <h1>TeachHubl</h1>
                <img src={logo} />
            </div>
            <hr />
            <div className="content_container">
                <div className="summary">
                    <h2>Course Summary</h2>
                    <p className="info">Course Name <span>{courseName}</span></p>
                    <p className="info">Tutor Name <span>{tutorName}</span></p>
                    <p className="info">Starts at <span>{startDate}</span></p>
                    <p className="info">Ends at <span>{endDate}</span></p>
                </div>
                <div className="summary">
                    <h2>Order Summary</h2>
                    <p className="info">SubTotal <span>₹ {subtotal}</span></p>
                    <p className="info">Platform fee ( 18% ) <span>₹ {platformFee}</span></p>
                    <p className="info">Total <span>₹ {total}</span></p>
                </div>
                <button onClick={() => displayRazorpay(total, studId,courseName,startDate,tutorName,tutorId,templateId,schedule,endDate,classCount,subject,chaptersRequested)}>Pay ₹{total}</button>
            </div>
        </div>
    );
}

export default PaymentPage;