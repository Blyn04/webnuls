const functions = require('firebase-functions');
const sgMail = require('@sendgrid/mail');
const { spawn } = require('child_process');

// Set your SendGrid API key from functions config
sgMail.setApiKey(functions.config().sendgrid.key);

// ✅ 1st Gen: Callable Function
exports.sendEmail = functions.https.onCall(async (data, context) => {
  const msg = {
    to: data.to,
    from: 'bernabebf@students.nu-moa.edu.ph',
    subject: data.subject,
    text: data.text,
    html: data.html,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error);
    return { success: false, error: error.message };
  }
});

// ✅ 1st Gen: HTTP Trigger with Python
exports.predictSales = functions.https.onRequest((req, res) => {
  const pythonProcess = spawn('python3', ['./analyticsAI/analytics.py']);

  pythonProcess.stdout.on('data', (data) => {
    res.send(`Predicted sales for next month: ${data.toString()}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.log(`python process exited with code ${code}`);
      res.status(500).send('Prediction failed');
    }
  });
});
