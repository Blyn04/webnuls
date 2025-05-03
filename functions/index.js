// const functions = require('firebase-functions');
// const sgMail = require('@sendgrid/mail');

// sgMail.setApiKey(functions.config().sendgrid.key);

// exports.sendEmail = functions.https.onCall(async (data, context) => {
//   const msg = {
//     to: data.to, // recipient
//     from: 'bernabebf@students.nu-moa.edu.ph', // must be verified with SendGrid
//     subject: data.subject,
//     text: data.text,
//     html: data.html, // optional
//   };

//   try {
//     await sgMail.send(msg);
//     return { success: true };
    
//   } catch (error) {
//     console.error('SendGrid error:', error);
//     return { success: false, error: error.message };
//   }
// });

const functions = require('firebase-functions');
const sgMail = require('@sendgrid/mail');
const { spawn } = require('child_process');  // Import spawn to call Python script

sgMail.setApiKey(functions.config().sendgrid.key);

// Existing email sending function
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

// New function to predict sales
exports.predictSales = functions.https.onRequest((req, res) => {
    // Call Python script to run model and get predictions
    const pythonProcess = spawn('python', ['./predict_sales.py']);  // Adjust path as needed
    
    pythonProcess.stdout.on('data', (data) => {
        res.send(`Predicted sales for next month: ${data.toString()}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.log(`python process exited with code ${code}`);
        }
    });
});
