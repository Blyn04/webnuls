const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');
const { spawn } = require('child_process');
const functions = require('firebase-functions'); 

// Set your SendGrid API key from environment config

const { defineSecret } = require('firebase-functions/params');

// Define the secret (at *deploy* time — does NOT access its value)
const SENDGRID_API_KEY = defineSecret('SENDGRID_API_KEY');

const corsHandler = cors({ origin: true });

// sendEmail function (Gen 2)
exports.sendEmail = onRequest(
  {
    region: 'us-central1',
    cpu: 1,
    memory: '512MiB',
    timeoutSeconds: 60,
    secrets: [SENDGRID_API_KEY], // Declare which secrets to inject at runtime
  },
  (req, res) => {
    corsHandler(req, res, async () => {
      try {
        // ✅ Access the secret at runtime
        sgMail.setApiKey(SENDGRID_API_KEY.value());

        const msg = {
          to: req.body.to,
          from: 'bernabebf@students.nu-moa.edu.ph',
          subject: req.body.subject,
          text: req.body.text,
          html: req.body.html,
        };

        await sgMail.send(msg);
        res.status(200).send({ success: true });
      } catch (error) {
        logger.error('Error sending email:', error);
        res.status(500).send({ success: false, error: error.message });
      }
    });
  }
);

// predictSales function (Gen 2)
// exports.predictSales = onRequest(
//   {
//     region: 'us-central1',
//     cpu: 1,
//     memory: '512MiB',
//     timeoutSeconds: 120,
//   },
//   (req, res) => {
//     const pythonProcess = spawn('python3', ['../analyticsAI/analytics.py']);

//     // Send the sales data to Python via stdin
//     pythonProcess.stdin.write(JSON.stringify(req.body));
//     pythonProcess.stdin.end();

//     pythonProcess.stdout.on('data', (data) => {
//       logger.log('Python output:', data.toString());
//       res.status(200).send({ prediction: data.toString() });
//     });

//     pythonProcess.stderr.on('data', (data) => {
//       logger.error(`stderr: ${data}`);
//     });

//     pythonProcess.on('close', (code) => {
//       if (code !== 0) {
//         logger.error(`Python process exited with code ${code}`);
//         res.status(500).send('Prediction failed');
//       }
//     });
//   }
// );
