const express = require('express');
const connectDB = require('./config/db')
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskroutes')
const cookieParser = require('cookie-parser');
const cors = require('cors')
require('dotenv').config();
cookieParser
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "http://localhost:5173"],
  })
);

connectDB();

app.use(express.json());

// Routes
app.use('/user',userRoutes)
app.use('/task',taskRoutes)

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));