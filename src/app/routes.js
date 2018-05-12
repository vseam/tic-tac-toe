module.exports = (app, passport, multipart, fs) => {
	app.get('/', (req, res) => {
		if(!req.isAuthenticated()) {
			res.render('login', {
				errorMessageLogin: req.flash('errorMessageLogin'),
				errorMessageRegister: req.flash('errorMessageRegister')
			});
		} else {
			res.render('home', {
				pageName: 'home',
				user: req.user,
				passwordChanged: req.flash('passwordChanged'),
				avatarChanged: req.flash('avatarChanged'),
				avatarError: req.flash('avatarError')
			});
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

	app.post('/user/avatar/:id', multipart({ uploadDir: './src/public/images/avatars/uploads' }), (req, res) => {
		const User = require('../app/models/user');

		if(req.files) {
			let filePath  = req.files.avatar.path;
			let fileSplit = filePath.split('\\');
			let fileName  = fileSplit[5];

			let extSplit = fileName.split('\.');
			let fileExt  = extSplit[1];

			if(fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'png') {
				User.findOne(
					{ _id: req.params.id },
					(error, user) => {
						if(user) {
							if(user.avatar.split('/')[0] == 'uploads') {
								fs.unlink('./src/public/images/avatars/' + user.avatar, (error) => { });
							}
						}
					}
				)

				User.update(
					{ _id: req.params.id },
					{ avatar: 'uploads/' + fileName },
					(error, user) => {
						if(!error) {
							req.flash('avatarChanged', 'El avatar se ha cambiado con éxito');
							res.redirect('/');
						}
					}
				)
			} else {
				fs.unlink(filePath, (error) => {
					req.flash('avatarError', 'Extensión del avatar errónea');
					res.redirect('/');
				});
			}
		}
	});

	app.post('/user/passwd/:id', (req, res) => {
		const User 	   = require('../app/models/user');
		let usrMethods = new User();

		User.update(
			{ _id: req.params.id },
			{ password: usrMethods.generateHash(req.body.passwd) },
			(error, user) => {
				if(!error) {
					req.flash('passwordChanged', 'La contraseña se ha cambiado con éxito');
					res.redirect('/');
				}
			}
		);
	});

	app.post('/user/delete/:id', (req, res) => {
		const User = require('../app/models/user');

		User.findOne(
			{ _id: req.params.id },
			(error, user) => {
				if(user) {
					if(user.avatar.split('/')[0] == 'uploads') {
						fs.unlink('./src/public/images/avatars/' + user.avatar, (error) => { });
					}
				}
			}
		)

		User.deleteOne({ _id: req.params.id }, (error, user) => { });
	});
}
