const functions = require('firebase-functions');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(functions.config().sendgrid.key);

exports.sendEmail = functions.https.onCall(async (data, context) => {
  const msg = {
    to: data.to, // recipient
    from: 'bernabebf@students.nu-moa.edu.ph', // must be verified with SendGrid
    subject: data.subject,
    text: data.text,
    html: data.html, // optional
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error);
    return { success: false, error: error.message };
  }
});
