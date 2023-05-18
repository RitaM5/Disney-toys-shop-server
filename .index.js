const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;
//middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('disney dolls is running')
})

app.listen(port, () => {
    console.log(`Disney Dolls Server is running on port ${port}`)
})
 