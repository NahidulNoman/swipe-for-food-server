const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();

// middle wares 
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('swipe for food server is running...')
});

app.listen(port , ()=> {
    console.log(`swipe for food server is running port ${port}`)
});