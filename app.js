const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const dotenv = require('dotenv');
const flash = require('connect-flash');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const agentRoutes = require('./routes/agent');
const ticketRoutes = require('./routes/ticket');
const adminRoutes = require('./routes/admin');

dotenv.config();

// DB initialization
connectDB();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Flash setup
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

// Routing
app.get('/', (req, res) => {
  res.render('home', { session: req.session });
});

app.use('/auth', authRoutes);
app.use('/agent', agentRoutes);
app.use('/ticket', ticketRoutes);
app.use('/admin', adminRoutes);

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});