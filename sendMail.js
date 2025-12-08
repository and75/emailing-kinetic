const nodemailer = require('nodemailer');
const fs = require('fs');

// Use the built HTML; adjust if you prefer a different path
const html = fs.readFileSync('./dist/index.html', 'utf8');

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '60a664b63ea91b',
    pass: '17caeacd656585',
  },
});

async function sendTest() {
  try {
    const info = await transporter.sendMail({
      from: '"Test Kinetic" <andreaporcella@gmail.com>',
      to: ['andreaporcella@gmail.com'],
      subject: 'Test Kinetic Email',
      html,
    });
    console.log('Email inviata:', info.messageId);
  } catch (err) {
    console.error('ERRORE:', err);
  }
}

sendTest();
