const mongoose = require('mongoose');
const bcrypt   = require('bcrypt-nodejs');

// Esquema de los usuarios para la base de datos.
const userSchema = new mongoose.Schema({
	username:  String,
	password:  String,
	wonGames:  { type: Number, default: 0 },
	lostGames: { type: Number, default: 0 },
	eloPoints: { type: Number, default: 0 }
});

// Función que encripta la contraseña recivida por parámetro.
userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

// Función que compara la contraseña recivida por parámetro con la del usuario.
userSchema.methods.validatePassword = function(password) {
	return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', userSchema);