const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;

const app = express();

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: 'https://pfatc.vercel.app/api/auth/discord/callback',
    scope: ['identify', 'email', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/api/auth/discord', passport.authenticate('discord'));
app.get('/api/auth/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
        res.redirect('/');
    });

app.get('/api/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.get('/api', (req, res) => {
    res.send(req.isAuthenticated() ? 'Logged in' : 'Logged out');
});

module.exports = app;
