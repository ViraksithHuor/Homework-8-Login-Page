const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const { engine } = require('express-handlebars');

const app = express();
const port = process.env.PORT || 3000;

// template engine setup
app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('mySuperSecureCookieSecret_2026'));
app.use(session({
    secret  : 'myVeryStrongSessionSecret_2026',
    resave  : false,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    const theme = req.signedCookies.theme || 'light';
    res.locals.theme = theme;
    next();
});

// static files
app.use(express.static(path.join(__dirname, 'public')));

const users = {
    "admin": {
        username: "admin",
        password: "password123",
        fullName: "System Administrator",
        email: "admin@university.edu",
        bio: "Managing the campus network infrastructure."
    },
    "student_dev": {
        username: "student_dev",
        password: "dev_password",
        fullName: "Jane Developer",
        email: "jane.d@student.edu",
        bio: "Full-stack enthusiast and coffee drinker."
    }
};

// functions
function requireLogin(req, res, next) {

    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

// routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login', { error: req.query.error });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users[username];

    if (user && user.password === password) {
        req.session.user = user;
        res.redirect('/profile');
    } else {
        res.render('login', { error: 'Invalid username or password' });
    }
});

app.get('/profile', requireLogin, (req, res) => {
    res.render('profile', { user: req.session.user });
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

app.get('/toggle-theme', (req, res) => {

    let currentTheme = req.signedCookies.theme || 'light';

    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    res.cookie('theme', newTheme, {
        httpOnly: true,
        signed: true
    });

    res.redirect('/profile');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});