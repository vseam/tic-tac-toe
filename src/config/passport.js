const LocalStrategy = require('passport-local').Strategy;
const User          = require('../app/models/user');

module.exports = function(passport) {
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(error, user) {
			done(error, user);
		});
	});

	// Método para iniciar sesión un usuario en la aplicación.
	passport.use('localLogin', new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, username, password, done) {
		// Busca en la base de datos el usuario introducido en el formulario.
		User.findOne({ 'username': username }, function(error, user) {
			if(error) { return done(error); }

			// Comprueba si el usuario existe y si la contraseña es válida, sino le envía un error a la plantilla.
			if(!user || !user.validatePassword(password)) {
				return done(null, false, req.flash('errorMessageLogin', 'Los datos introducidos no son validos'));
			}
			return done(null, user);
		})
	}));

	// Método para registrar a un usuario en la aplicación.
	passport.use('localRegister', new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, username, password, done) {
		// Busca en la base de datos el usuario introducido en el formulario.
		User.findOne({ 'username': username }, function(error, user) {
			if(error) { return done(error); }

			// Comprueba si el usuario existe, en caso de encontrarlo, le envía un error a la plantilla.
			if(user) {
				return done(null, false, req.flash('errorMessageRegister', 'El nombre de usuario ya está en uso'));
			} else {
				// Crea el nuevo usuario con la información del formulario.
				let newUser = new User();

				newUser.username  = username;
				newUser.password  = newUser.generateHash(password);

				// Guarda en la base de datos la información del nuevo usuario.
				newUser.save(function(error) {
					if(error) { throw error; }
					return done(null, newUser);
				});
			}
		})
	}));
}
