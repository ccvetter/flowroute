const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.get('/api/message', (req, res) => {
    res.json({ message: 'Hello from the server!' });
});
app.listen(5000, () => console.log('Server is running on http://localhost:3000'));
