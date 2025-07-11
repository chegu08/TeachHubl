const { SendEmailCommand } = require('@aws-sdk/client-ses');
const { sesclient } = require('../../config/config');

const sendEmailForNewClass=async ({studName, className, tutorName, startDate, endDate, amount, subject, tutorEmail}) =>{
    const htmlBody = `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: 'Segoe UI', sans-serif;
        background-color: #f3f4f6;
        padding: 30px;
        color: #111827;
      }
      .container {
        background-color: #ffffff;
        border-radius: 10px;
        padding: 40px;
        max-width: 600px;
        margin: auto;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.07);
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
      }
      .header h1 {
        color: #3b82f6;
        margin: 0;
      }
      .section {
        margin-bottom: 20px;
      }
      .section h2 {
        font-size: 18px;
        color: #1f2937;
        margin-bottom: 10px;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 5px;
      }
      .section p {
        margin: 5px 0;
        line-height: 1.6;
      }
      .footer {
        text-align: center;
        margin-top: 30px;
        font-size: 0.9em;
        color: #6b7280;
      }
      .highlight {
        color: #2563eb;
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>📘 New Class Created!</h1>
        <p>A student has enrolled in your class.</p>
      </div>

      <div class="section">
        <h2>👨‍🎓 Student Details</h2>
        <p><strong>Name:</strong> <span class="highlight">${studName}</span></p>
      </div>

      <div class="section">
        <h2>📚 Class Details</h2>
        <p><strong>Class Name:</strong> ${className}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Start Date:</strong> ${startDate}</p>
        <p><strong>End Date:</strong> ${endDate}</p>
        <p><strong>Amount Paid:</strong> ₹${amount}</p>
      </div>

      <div class="footer">
        <p>Log in to your TeachHubl dashboard for more details and to prepare your resources.</p>
        <p>📮 Need help? Contact support@teachhubl.com</p>
      </div>
    </div>
  </body>
</html>
`;

    // change the source to the official mail later
    const emailOptions = {
        Source: "cheguevera597@gmail.com",
        Destination: {
            ToAddresses: [tutorEmail]
        },
        ReplyToAddresses: [],
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: htmlBody
                }
            },
            Subject: {
                Charset: "UTF-8",
                Data: "New Class is created"
            }
        }
    }
    try {
        const email = new SendEmailCommand(emailOptions)
        const Response = await sesclient.send(email)
        console.log("Email successfully setup ", Response)
        return 200;
    } catch(err) {
        console.log(err);
        return 500;
    }
};

const sendEmailForCancelledClass=async ({
    
}) =>{

};

module.exports={
    sendEmailForCancelledClass,
    sendEmailForNewClass
}