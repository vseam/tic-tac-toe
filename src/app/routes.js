module.exports = (app, passport) => {
	app.get('/', (req, res) => {
		if(!req.isAuthenticated()) {
			res.render('login', {
				errorMessageLogin: req.flash('errorMessageLogin'),
				errorMessageRegister: req.flash('errorMessageRegister')
			});
		} else {
			res.render('home', { pageName: 'home', user: req.user });
		}
	});

	app.post('/login', passport.authenticate('localLogin', {
		successRedirect: '/',
		failureRedirect: '/',
		failureFlash: true
	}));

	app.post('/register', passport.authenticate('localRegister', {
		successRedirect: '/',
		failureRedirect: '/',
		failureFlash: true
	}));

	app.get('/game', (req, res) => {
		if(req.isAuthenticated()) {
			res.render('game', { pageName: 'game', user: req.user });
		} else {
			res.redirect('/');
		}
	});

	app.get('/rank', (req, res) => {
		if(req.isAuthenticated()) {
			res.render('rank', { pageName: 'rank', user: req.user });
		} else {
			res.redirect('/');
		}
	});

	app.get('/getrank', (req, res) => {
		const User = require('../app/models/user');

		User.find((error, users) => {
			res.send(users);
		}).sort({ eloPoints: -1 });
	});

	app.get('/getmatches/:id', (req, res) => {
		const Match = require('../app/models/match');

		Match.find({ userID: req.params.id }, (error, matches) => {
			res.send(matches);
		}).sort({ _id: -1 }).limit(5);
	});

	app.get('/logout', (req, res) => {
		req.logout();
		res.redirect('/');
	});
}
