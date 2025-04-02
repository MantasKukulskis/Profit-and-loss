const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: '8mantas8@gmail.com', 
    pass: 'dttb pfem tzio scnw ' 
  }
});

transporter.sendMail({
  from: '8mantas8@gmail.com',
  to: 'draudimas88@gmail.com',
  subject: 'Test Email',
  text: 'Hello, this is a test email sent via Node.js!'
}, (error, info) => {
  if (error) {
    console.log('❌ Klaida siunčiant el. laišką:', error);
  } else {
    console.log('✅ El. laiškas išsiųstas:', info.response);
  }
});