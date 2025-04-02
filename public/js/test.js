const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail', // Arba jūsų naudojama paslauga (pvz., Outlook, Yahoo ir pan.)
  auth: {
    user: '8mantas8@gmail.com', // Jūsų el. paštas
    pass: 'dttb pfem tzio scnw ' // Jūsų App Password
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