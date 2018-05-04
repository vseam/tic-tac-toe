const mongoose = require('mongoose');

// Esquema de las partidas para la base de datos.
const matchSchema = new mongoose.Schema({
	userID:   String,
	date:     String,
	opponent: String,
	result:   String
});

module.exports = mongoose.model('Match', matchSchema);
