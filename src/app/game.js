const User  = require('../app/models/user');
const Match = require('../app/models/match');

module.exports = (io) => {
	// Indica la ruta donde se va a ejecutar el juego.
	io.path('/game');

	// Objeto de las salas de juego.
	function Room(player1, player2, currentPlayer) {
		this.player1       = player1;
		this.player2       = player2;
		this.currentPlayer = currentPlayer;
	}

	var usersOnline = 0;
	var waitingList = new Array();
	var roomNumber  = 0;
	var roomsList   = new Array();

	/**
	 * [CONTROLADOR DE LA PARTIDA].
	 */
	// Detecta cuando un usuario se conecta al juego.
	io.on('connection', function(socket) {
		// Genera la fecha actual para guardarla en el historico de partidas.
		let currentDate = new Date();
		let dateDay 	= (currentDate.getDate() <= 9) ? '0' + currentDate.getDate() : currentDate.getDate();
		let months  	= ['Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Sep.', 'Oct.', 'Nov.', 'Dic.'];
		let dateToSave  = dateDay + ' ' + months[currentDate.getMonth()];

		// Recibe el evento del cliente de que un usuario se ha conectado al juego.
		socket.on('joinUser', function(data) {
			// Asigna el nombre de usuario al socket.
			socket.userID   = data.userID;
			socket.username = data.username;
			socket.avatar   = data.avatar;

			// Incrementa el contador de usuarios conectados en este momento.
			usersOnline++;

			// Añade al usuario nuevo a la lista de espera.
			waitingList.push(socket);
			console.log('A user has connected. (Room: ' + roomNumber + ') - ' + '[' + usersOnline + ']');

			// Comprueba si hay más de dos jugadores en la lista de espera.
			if(waitingList.length >= 2 && waitingList[0].username != waitingList[1].username) {
				var currentPlayer = null;

				// Asigna la sala de juego a los dos primeros usuarios de la lista de espera.
				waitingList[0].join(roomNumber);
				waitingList[1].join(roomNumber);
				waitingList[0].room = roomNumber;
				waitingList[1].room = roomNumber;

				// Crea la sala de juego con los dos usuarios y asigna aleatoriamente quién empieza la partida.
				var playerRandom = waitingList[Math.round(Math.random())];
				roomsList.push(new Room(waitingList[0], waitingList[1], playerRandom.id));

				// Comprueba qué usuario es el que debe empezar la partida.
				(playerRandom == waitingList[0]) ? currentPlayer = true : currentPlayer = false;

				// Elimina a los dos usuarios de la lista de espera.
				waitingList.splice(0, 2);

				// Emite el evento que asigna a cada jugador de la partida.
				io.sockets.connected[roomsList[(roomsList.length - 1)].player1.id].emit('assignPlayer', {
					player: true,
					opponent: roomsList[(roomsList.length - 1)].player2.username,
					imgOpponent: roomsList[(roomsList.length - 1)].player2.avatar
				});
				io.sockets.connected[roomsList[(roomsList.length - 1)].player2.id].emit('assignPlayer', {
					player: false,
					opponent: roomsList[(roomsList.length - 1)].player1.username,
					imgOpponent: roomsList[(roomsList.length - 1)].player1.avatar
				});

				// Emite el evento a la sala de juego para empezar la partida.
				io.to(roomNumber).emit('startGame', currentPlayer);
				console.log('The game has started in room ' + roomNumber + '.');

				// Incrementa el número de las salas de juego.
				roomNumber++;
			} else if(waitingList.length >= 2 && waitingList[0].username == waitingList[1].username) {
				// Elimina al jugador duplicado de la lista de espera.
				waitingList.splice(1, 1);
			}
		});

		// Recibe el evento del cliente para pintar una casilla del tablero.
		socket.on('paintSquare', function(squareID) {
			var roomObject = roomsList[socket.room];

			// Comprueba si es el turno del usuario que ha enviado el evento.
			if(roomObject.currentPlayer == socket.id) {
				var playerBoolean;

				// Comprueba qué usuario ha enviado el evento.
				if(roomObject.player1.id == socket.id) {
					playerBoolean = true;
					// Cambia el turno del usuario en la partida.
					roomObject.currentPlayer = roomObject.player2.id;
				} else {
					playerBoolean = false;
					// Cambia el turno del usuario en la partida.
					roomObject.currentPlayer = roomObject.player1.id;
				}

				// Emite el evento al cliente para pintar una casilla del tablero.
				io.to(socket.room).emit('paintSquare', {
					evPlayer: playerBoolean,
					squareID: squareID
				});
			}
		});

		// Recibe el evento del cliente para las comprobaciones totales de las casillas.
		socket.on('checksRoom', function(checks) {
			io.to(socket.room).emit('checksRoom', checks);
		});

		// Recibe el evento del cliente para nombrar a un ganador de la partida.
		socket.on('sayWinner', function(playerWinner) {
			var roomObject = roomsList[socket.room];

			// Comprueba qué usuario ha ganado la partida.
			if(playerWinner) {
				// Actualiza los registros de la base de datos del jugador que ha ganado.
				User.update(
					{'username': roomObject.player1.username },
					{$inc: { wonGames: 1, eloPoints: 2 }},
					(error, userUpdated) => {}
				);

				// Actualiza los registros de la base de datos del jugador que ha perdido.
				User.update(
					{'username': roomObject.player2.username },
					{$inc: { lostGames: 1, eloPoints: -1 }},
					(error, userUpdated) => {}
				);

				// Guarda en la base de datos la información del resultado de la partida.
				new Match({
					userID:  roomObject.player1.userID,
					date:    dateToSave,
					opponent: roomObject.player2.username,
					result:  'Ganada'
				}).save();

				new Match({
					userID:  roomObject.player2.userID,
					date:    dateToSave,
					opponent: roomObject.player1.username,
					result:  'Perdida'
				}).save();

				// Emite los eventos a los usuarios de la sala de juego.
				io.sockets.connected[roomObject.player1.id].emit('sayWinner', true);
				io.sockets.connected[roomObject.player2.id].emit('sayWinner', false);
			} else {
				// Actualiza los registros de la base de datos del jugador que ha ganado.
				User.update(
					{'username': roomObject.player2.username },
					{$inc: { wonGames: 1, eloPoints: 2 }},
					(error, userUpdated) => {}
				);

				// Actualiza los registros de la base de datos del jugador que ha perdido.
				User.update(
					{'username': roomObject.player1.username },
					{$inc: { lostGames: 1, eloPoints: -1 }},
					(error, userUpdated) => {}
				);

				// Guarda en la base de datos la información del resultado de la partida.
				new Match({
					userID:  roomObject.player2.userID,
					date:    dateToSave,
					opponent: roomObject.player1.username,
					result:  'Ganada'
				}).save();

				new Match({
					userID:  roomObject.player1.userID,
					date:    dateToSave,
					opponent: roomObject.player2.username,
					result:  'Perdida'
				}).save();

				// Emite los eventos a los usuarios de la sala de juego.
				io.sockets.connected[roomObject.player1.id].emit('sayWinner', false);
				io.sockets.connected[roomObject.player2.id].emit('sayWinner', true);
			}

			// Elimina la sala de juego.
			roomObject.player1.room = undefined;
			roomObject.player2.room = undefined;
			roomsList[socket.room] = null;
			console.log('The game has finished in room ' + socket.room + '.');
		});

		// Detecta cuando un usuario se desconecta del servidor.
		socket.on('disconnect', function() {
			// Comprueba si el usuario que se ha desconectado pertenecía a alguna sala de juego.
			if(socket.room >= 0) {
				let roomObject = roomsList[socket.room];

				// Comprueba qué usuario ha sido el que se ha desconectado.
				if(socket.username != roomObject.player1.username) {
					roomObject.player1.room = -5;

					// Actualiza los registros de la base de datos del jugador que ha ganado.
					User.update(
						{ 'username': roomObject.player1.username },
						{ $inc: { wonGames: 1, eloPoints: 2 } },
						(error, userUpdated) => {}
					);

					// Guarda en la base de datos la información del resultado de la partida.
					new Match({
						userID:  roomObject.player1.userID,
						date:    dateToSave,
						opponent: roomObject.player2.username,
						result:  'Ganada'
					}).save();

					// Guarda en la base de datos la información del resultado de la partida.
					new Match({
						userID:  roomObject.player2.userID,
						date:    dateToSave,
						opponent: roomObject.player1.username,
						result:  'Perdida'
					}).save();
				} else {
					roomObject.player2.room = -5;

					// Actualiza los registros de la base de datos del jugador que ha ganado.
					User.update(
						{ 'username': roomObject.player2.username },
						{ $inc: { wonGames: 1, eloPoints: 2 } },
						(error, userUpdated) => {}
					);

					// Guarda en la base de datos la información del resultado de la partida.
					new Match({
						userID:  roomObject.player2.userID,
						date:    dateToSave,
						opponent: roomObject.player1.username,
						result:  'Ganada'
					}).save();

					// Guarda en la base de datos la información del resultado de la partida.
					new Match({
						userID:  roomObject.player1.userID,
						date:    dateToSave,
						opponent: roomObject.player2.username,
						result:  'Perdida'
					}).save();
				}

				// Actualiza los registros de la base de datos del jugador que ha perdido.
				User.update(
					{ 'username': socket.username },
					{ $inc: { lostGames: 1, eloPoints: -1 } },
					(error, userUpdated) => {}
				);

				// Emite el evento al cliente de que un usuario se ha desconectado.
				io.to(socket.room).emit('userDisconnect');
				roomsList[socket.room] = null;
			} else {
				// Elimina de la lista de espera a el usuario que se ha desconectado.
				if(socket.room != -5) {
					var position = waitingList.indexOf(socket);
					waitingList.splice(position, 1);
				}
			}

			// Decrementa el contador de usuarios conectados en este momento.
			usersOnline--;
			console.log('A user has been disconnected. (Room: ' + socket.room + ') - ' + '[' + usersOnline + ']');
		});

		/**
		 * [CONTROLADOR DEL CHAT].
		 */
		// Recibe el evento del cliente para escribir un mensaje en el chat.
		socket.on('chatMessage', function(data) {
			io.to(socket.room).emit('printMessage', {
				message: data.message,
				user: data.playerBoolean
			});
		});
	});
}
