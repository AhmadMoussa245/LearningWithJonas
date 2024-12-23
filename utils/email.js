import nodemailer from 'nodemailer'
import 'dotenv/config'

const sendEmail=async options=>{
    // const transporter= nodemailer.createTransport({
        // Using Gmail not good idea:
        // (only 500 email a day and probably spam)
        
        // service:'Gmail',
        // auth:{
            //     user:process.env.EMAIL_USERNAME,
            //     pass:process.env.EMAIL_PASSWORD
            // }
            // Activate in gmail "less secure app" option
            // ---------------------------------------
            // })
            
    // 1) Create a transporter
    const transporter=nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth:{
            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD
        }
    });
    
    // 2) Define the email options
    const mailOptions={
        from:'Ahmad Moussa <test@ahmad.io>',
        to:options.email,
        subject:options.subject,
        text:options.message,
        // html:
        
    };
    
    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
};

export default sendEmail;