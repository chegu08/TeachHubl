const { SendEmailCommand, SendRawEmailCommand } = require('@aws-sdk/client-ses');
const { sesclient } = require('../../config/config');
const { generateInvoiceBuffer } = require("../../utils/createInvoice");
const fs=require("fs");
const path=require("path");


const sendEmailForNewClass = async ({ studName, className, tutorName, startDate, endDate, amount, subject, tutorEmail, studEmail }) => {
  console.log("cmae here");
  const textContent = "Invoice for the newly created class";
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
  // const emailOptions = {
  //     Source: "cheguevera597@gmail.com",
  //     Destination: {
  //         ToAddresses: [tutorEmail]
  //     },
  //     ReplyToAddresses: [],
  //     Message: {
  //         Body: {
  //             Html: {
  //                 Charset: "UTF-8",
  //                 Data: htmlBody
  //             }
  //         },
  //         Subject: {
  //             Charset: "UTF-8",
  //             Data: "New Class is created"
  //         },
  //     }
  // }
  const boundary = "NextPartBoundary";

  // Create MIME body with alternative and mixed content
  let body = [
    `From: cheguevera597@gmail.com`,
    `To: ${tutorEmail},${studEmail}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: multipart/alternative; boundary="altBoundary"`,
    ``,
    `--altBoundary`,
    `Content-Type: text/plain; charset="UTF-8"`,
    ``,
    textContent || "Your email client does not support HTML.",
    ``,
    `--altBoundary`,
    `Content-Type: text/html; charset="UTF-8"`,
    ``,
    htmlBody,
    ``,
    `--altBoundary--`
  ];



  try {
    const result = await generateInvoiceBuffer({ studName, className, tutorName, startDate, endDate, amount, subject, tutorEmail, studEmail }); // your generated buffer

    if(!result.success) {
      throw new Error("Error generating invoice");
    }

    const fileName = 'invoice.pdf';
    const encodedFile = result.buffer.toString("base64").match(/.{1,76}/g).join('\r\n');

    body.push(
      `--${boundary}`,
      `Content-Type: application/pdf; name="${fileName}"`,
      `Content-Description: ${fileName}`,
      `Content-Disposition: attachment; filename="${fileName}";`,
      `Content-Transfer-Encoding: base64`,
      ``,
      encodedFile,
      ``,
      `--${boundary}--`
    );


    const rawEmail = Buffer.from(body.join("\r\n"));
    const email = new SendRawEmailCommand({
      RawMessage:{
        Data:rawEmail
      },
      Source:"cheguevera597@gmail.com"
    });
    const Response = await sesclient.send(email);
    console.log("Email successfully setup ", Response);

    fs.writeFileSync(path.join(__dirname,'..','..','test_doc','invoice.eml'),rawEmail);
    fs.writeFileSync(path.join(__dirname,'..','..','test_doc','invoice.pdf'),result.pdf_bytes);

    return 200;
  } catch (err) {
    console.log(err);
    return 500;
  }
};

const sendEmailForCancelledClass = async ({

}) => {

};

module.exports = {
  sendEmailForCancelledClass,
  sendEmailForNewClass
}