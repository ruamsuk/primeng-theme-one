const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const app = express();
app.use(bodyParser.json());
app.use(cors({origin: true}));

app.post('/setCustomUserClaims', async (req, res) => {
  const {uid, role} = req.body;
  try {
    await admin.auth().setCustomUserClaims(uid, {role});
    res.status(200).send(`Custom claims set for user ${uid}`);
  } catch (error) {
    res.status(500).send(`Error setting custom claims: ${error.message}`);
  }
});

exports.api = functions.https.onRequest(app);

