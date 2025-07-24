const {PDFDocument, rgb}=require("pdf-lib");
const fontkit =require("@pdf-lib/fontkit");
const path=require("path");
const fs=require("fs");
const logo_path=path.join(__dirname,'..','public',"WhatsApp Image 2025-02-19 at 20.32.04_9336c379.jpg");
const logo=fs.readFileSync(logo_path);

async function generateInvoiceBuffer({ studName, className, tutorName, startDate, endDate, amount, subject,  }) {
    try {
        const subtotal=amount/118;
        const total=amount/100;

        const pdf_doc=await PDFDocument.create();
        pdf_doc.registerFontkit(fontkit);
        const img=await pdf_doc.embedJpg(logo);
        const imgDims=img.scale(0.7);
        const font_bytes=fs.readFileSync(path.resolve(__dirname,"..","fonts","Poppins-Regular.ttf"));
        const customFont=await pdf_doc.embedFont(font_bytes);
        const page=pdf_doc.addPage();
        
        const text="TeachHubl";
        const textSize=48;
        // const textWidth=customFont.widthOfTextAtSize(text,textSize);
        // const textHeight=customFont.heightAtSize(textSize);
        const {width,height}=page.getSize();

        page.drawText(text,{
            x:60,
            y:height-100,
            font:customFont,
            size:textSize,
            color:rgb(0,0,0)
        });

        page.drawText("Tutoring Invoice",{
            x:60,
            y:(height-140),
            size:textSize/2,
            color:rgb(0,0,0),
            opacity:0.75
        });

        page.drawImage(img,{
            x:width-150,
            y:height-140,
            width:imgDims.width,
            height:imgDims.height
        })

        page.drawLine({
            start:{ x:60,y:height-160},
            end:{x:width-60,y:height-160 },
            thickness:1,
            color:rgb(0,0,0),
            opacity:0.75
        });

        page.drawText("Invoice Summary",{
            x:60,
            y:(height-190),
            font:customFont,
            size:textSize/2,
            color:rgb(0,0,0),
            opacity:0.75
        });

        page.drawText("Start Date:",{
            x:60,
            y:height-220,
            font:customFont,
            size:textSize/3,
            color:rgb(0,0,0),
            opacity:0.7
        });

        page.drawText((new Date(startDate)).toLocaleDateString(),{
            x:width*0.6,
            y:height-220,
            font:customFont,
            size:textSize/3,
            color:rgb(0,0,0),
            opacity:0.7
        });

        page.drawText("End Date:",{
            x:60,
            y:height-250,
            font:customFont,
            size:textSize/3,
            color:rgb(0,0,0),
            opacity:0.7
        });

        page.drawText((new Date(endDate)).toLocaleDateString(),{
            x:width*0.6,
            y:height-250,
            font:customFont,
            size:textSize/3,
            color:rgb(0,0,0),
            opacity:0.7
        });

        page.drawText("Tutor:",{
            x:60,
            y:height-280,
            font:customFont,
            size:textSize/3,
            color:rgb(0,0,0),
            opacity:0.7
        });

        page.drawText(tutorName,{
            x:width*0.6,
            y:height-280,
            font:customFont,
            size:textSize/3,
            color:rgb(0,0,0),
            opacity:0.7
        });

        page.drawText("Student:",{
            x:60,
            y:height-310,
            font:customFont,
            size:textSize/3,
            color:rgb(0,0,0),
            opacity:0.7
        });

        page.drawText(studName,{
            x:width*0.6,
            y:height-310,
            font:customFont,
            size:textSize/3,
            color:rgb(0,0,0),
            opacity:0.7
        });

        page.drawText("Class Name:",{
            x:60,
            y:height-340,
            font:customFont,
            size:textSize/3,
            color:rgb(0,0,0),
            opacity:0.7
        });

        page.drawText(className,{
            x:width*0.6,
            y:height-340,
            font:customFont,
            size:textSize/3,
            color:rgb(0,0,0),
            opacity:0.7
        });

        page.drawText("Subject:",{
            x:60,
            y:height-370,
            font:customFont,
            size:textSize/3,
            color:rgb(0,0,0),
            opacity:0.7
        });

        page.drawText(subject,{
            x:width*0.6,
            y:height-370,
            font:customFont,
            size:textSize/3,
            color:rgb(0,0,0),
            opacity:0.7
        });

        page.drawLine({
            start:{ x:60,y:height-400},
            end:{x:width-60,y:height-400 },
            thickness:1,
            color:rgb(0,0,0),
            opacity:0.75
        });

        page.drawText("Payment Summary",{
            x:60,
            y:height-440,
            font:customFont,
            size:textSize/2,
            color:rgb(0,0,0),
            opacity:0.75
        });

        page.drawText("SubTotal:",{
            x:60,
            y:height-470,
            font:customFont,
            size:textSize/3,
            color:rgb(0,0,0),
            opacity:0.7
        });

        page.drawText("₹"+String(subtotal),{
            x:width*0.6,
            y:height-470,
            font:customFont,
            size:textSize/3,
            color:rgb(0,0,0),
            opacity:0.7
        });

        page.drawText("Platform Fee (18%):",{
            x:60,
            y:height-500,
            font:customFont,
            size:textSize/3,
            color:rgb(0,0,0),
            opacity:0.7
        });

        page.drawText("₹"+String(total-subtotal),{
            x:width*0.6,
            y:height-500,
            font:customFont,
            size:textSize/3,
            color:rgb(0,0,0),
            opacity:0.7
        });

        page.drawText("Total Payable :",{
            x:60,
            y:height-530,
            font:customFont,
            size:textSize/3,
            color:rgb(0,0,0),
            opacity:1
        });

        page.drawText("₹"+String(total),{
            x:width*0.6,
            y:height-530,
            font:customFont,
            size:textSize/3,
            color:rgb(0,0,0),
            opacity:1
        });

        page.drawLine({
            start:{ x:60,y:height-570},
            end:{x:width-60,y:height-570 },
            thickness:1,
            color:rgb(0,0,0),
            opacity:0.75
        });

        page.drawText("Payment",{
            x:60,
            y:height-600,
            font:customFont,
            size:textSize/3,
            color:rgb(0,0,0),
            opacity:0.75
        });

        page.drawText("Paid",{
            x:width*0.6,
            y:height-600,
            font:customFont,
            size:textSize/3,
            color:rgb(0,0,0),
            opacity:1
        });

        page.drawText("Thank you for learning with TeachHubl!",{
            x:60,
            y:height-630,
            font:customFont,
            size:textSize/3,
            color:rgb(0,0,0),
            opacity:0.75
        });

        const pdf_bytes=await pdf_doc.save();
        return {success:true,buffer:Buffer.from(pdf_bytes)};

    } catch(err) {
        console.log(err);
        return {success:false,Error:err};
    }

}

module.exports = {
    generateInvoiceBuffer
}