const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const app = express()

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/*', function (req, res) {
  res.setHeader(
    'Content-Security-Policy-Report-Only',
    "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self'"
  );
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(process.env.PORT || 3000, () => console.log('Listening on port 3000!'));