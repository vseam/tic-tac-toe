const socket      = io();
const squares     = document.getElementsByClassName('square');
const alerts      = document.getElementById('alerts');
var playerBoolean = null;
var totalChecks   = 0;
var hasWon        = false;

/**
 * [CONTROLADOR DE LA PARTIDA].
 */
// Emite al servidor que el usuario se ha conectado al juego.
const userID   = document.getElementById('user-id').value;
const username = document.getElementById('username').value;
const avatar   = document.getElementById('avatar').value;
socket.emit('joinUser', { userID: userID, username: username, avatar: avatar });

// Recibe el evento del servidor que asigna el jugador del usuario.
socket.on('assignPlayer', function(data) {
	const opponent = document.getElementById('opponent');

	playerBoolean = data.player;

	// Muestra la imagen y el nombre del oponente con su color correspondiente.
	let imgOpponent = document.createElement('img');
	imgOpponent.setAttribute('src', '/images/avatars/' + data.imgOpponent);
	opponent.appendChild(imgOpponent);

	let txtOpponent = document.createElement('span');
	txtOpponent.appendChild(document.createTextNode(data.opponent))
	opponent.appendChild(txtOpponent);

	(!playerBoolean) ? opponent.setAttribute('class', 'opponent green') : opponent.setAttribute('class', 'opponent red');
});

// Recibe el evento del servidor para empezar la partida.
socket.on('startGame', function(currentPlayer) {
    // Oculta el aviso de espera con un efecto.
    fadeOut(document.getElementById('waiting'));

    // Asigna los eventos a las casillas para poder hacer click sobre ellas.
    for(var i = 0; i < squares.length; i++) {
        squares[i].addEventListener('click', checkSquare);
    }

    // Comprueba si es el turno del usuario y en caso contrario le muestra un aviso.
    if(currentPlayer != playerBoolean) {
		let base = document.createElement('div');
		base.setAttribute('id', 'turn');
		base.setAttribute('class', 'warn');

		let message = document.createElement('h2');
		message.appendChild(document.createTextNode('Turno del oponente'));
		base.appendChild(message);

		alerts.appendChild(base);
        fadeIn(base);
    }
});

// Recibe el evento del servidor para pintar una casilla del tablero.
socket.on('paintSquare', function(data) {
	const squareColor = ['#BDE2AE', '#E2AEAE'];
	let colorPosition = (data.evPlayer == true) ? 0 : 1;

    squares[data.squareID].style.backgroundColor = squareColor[colorPosition];
    // Asigna un valor a la casilla dependiendo de qué jugador la haya pintado.
    squares[data.squareID].value = data.evPlayer;

    // Comprueba si el jugador que ha pintado la casilla es el mismo que el usuario.
    if(data.evPlayer == playerBoolean) {
        // Comprueba si ha ganado la partida el usuario.
        checkWin(playerBoolean);
    }

	// Comprueba si es el turno del usuario y le oculta el aviso del turno oponente,
	// en caso contrario, le muestra el aviso del turno oponente.
	const yourTurn = new Audio('/sounds/your-turn.mp3');

    if(data.evPlayer != playerBoolean) {
		fadeOut(document.getElementById('turn'));
		// Reproduce el sonido del turno.
		yourTurn.play();
    } else {
        let base = document.createElement('div');
		base.setAttribute('id', 'turn');
		base.setAttribute('class', 'warn');

		let message = document.createElement('h2');
		message.appendChild(document.createTextNode('Turno del oponente'));
		base.appendChild(message);

		alerts.appendChild(base);
        fadeIn(base);
    }
});

// Recibe el evento del servidor para guardar la cantidad total de comprobaciones de las casillas.
socket.on('checksRoom', function(checks) {
    totalChecks = checks;

	// Comprueba si se han pintado todas las casillas del tablero y no ha ganado nadie.
    if(totalChecks == 9 && !hasWon) {
        // Reinicia la partida y limpia el tablero.
        setTimeout(function() {
            restartGame();
        }, 1500);
    }
});

// Recibe el evento del servidor para nombrar a un ganador de la partida.
socket.on('sayWinner', function(playerWinner) {
	// Comprueba si el chat está abierto en ese momento y lo cierra automáticamente.
	if(openChat) {
		document.getElementById('chat').removeAttribute('class');
		openChat = false;
	}

	// Comprueba si el aviso del turno oponente está mostrado y lo elimina.
	if(document.getElementById('turn')) {
		document.getElementById('turn').parentNode.removeChild(document.getElementById('turn'));
	}

    // Muestra el aviso de qué usuario ha ganado la partida.
	let base = document.createElement('div');
	base.setAttribute('id', 'winner');
	base.setAttribute('class', 'warn');

	let alert = document.createElement('div');
	alert.setAttribute('id', 'warn-bc');
	base.appendChild(alert);

	let icon = document.createElement('i');
	let message = document.createElement('h2');

	const wonGame  = new Audio('/sounds/won-game.mp3');
	const lostGame = new Audio('/sounds/lost-game.mp3');

    if(playerWinner) {
		icon.setAttribute('class', 'fas fa-thumbs-up won');
		message.appendChild(document.createTextNode('¡Has Ganado!'));
		// Reproduce el sonido del ganador.
		wonGame.play();
    } else {
		icon.setAttribute('class', 'fas fa-thumbs-down lost');
		message.appendChild(document.createTextNode('¡Has Perdido!'));
		// Reproduce el sonido del perdedor.
		lostGame.play();
	}
	alert.appendChild(icon);
	alert.appendChild(message);

	let button = document.createElement('button');
	button.setAttribute('class', 'btn btn-primary');
	button.addEventListener('click', function() {
		window.location.href = '/';
	});
	button.appendChild(document.createTextNode('Volver al inicio'));
	alert.appendChild(button);

	alerts.appendChild(base);
	fadeIn(base);

	// Elimina el valor de la variable que declara el jugador del usuario.
	playerBoolean = null;
});

// Recibe el evento del servidor cuando el usuario rival se desconecta de la partida.
socket.on('userDisconnect', function() {
	// Comprueba si no ha terminado la partida cuando se desconecta el usuario.
    if(!document.getElementById('winner')) {
        // Comprueba si el aviso del turno oponente está mostrado y lo elimina.
        if(document.getElementById('turn')) {
            document.getElementById('turn').parentNode.removeChild(document.getElementById('turn'));
		}

		// Comprueba si el aviso de desconectarse está mostrado y la elimina.
		if(document.getElementById('leave')) {
            document.getElementById('leave').parentNode.removeChild(document.getElementById('leave'));
		}

		// Comprueba si el chat está abierto en ese momento y lo cierra automáticamente.
		if(openChat) {
			document.getElementById('chat').removeAttribute('class');
			openChat = false;
		}

		// Muestra el aviso de que el usuario rival se ha desconectado de la partida.
		let base = document.createElement('div');
		base.setAttribute('id', 'disconnect');
		base.setAttribute('class', 'warn');

		let alert = document.createElement('div');
		alert.setAttribute('id', 'warn-bc');
		base.appendChild(alert);

		let icon = document.createElement('i');
		icon.setAttribute('class', 'fas fa-thumbs-up won');
		alert.appendChild(icon);

		let message = document.createElement('h2');
		message.appendChild(document.createTextNode('¡Has Ganado!'));
		alert.appendChild(message);

		let text = document.createElement('p');
		text.appendChild(document.createTextNode('El rival se ha desconectado'));
		alert.appendChild(text);

		let button = document.createElement('button');
		button.setAttribute('class', 'btn btn-primary');
		button.addEventListener('click', function() {
			window.location.href = '/';
		});
		button.appendChild(document.createTextNode('Volver al inicio'));
		alert.appendChild(button);

		alerts.appendChild(base);
		fadeIn(base);

		// Reproduce el sonido del ganador.
		const wonGame  = new Audio('/sounds/won-game.mp3');
		wonGame.play();

		// Elimina el valor de la variable que declara el jugador del usuario.
		playerBoolean = null;
    }
});

// Comprueba si la casilla seleccionada ya ha sido pintada por un jugador.
function checkSquare(element) {
    let square = element.target;

    if(square.value != true && square.value != false) {
        socket.emit('paintSquare', square.id);
    }
}

// Comprueba si ha ganado la partida el usuario.
function checkWin(player) {
    if(squares[0].value == player && squares[1].value == player && squares[2].value == player) {
        hasWon = true;
    } else if(squares[3].value == player && squares[4].value == player && squares[5].value == player) {
        hasWon = true;
    } else if(squares[6].value == player && squares[7].value == player && squares[8].value == player) {
        hasWon = true;
    } else if(squares[0].value == player && squares[3].value == player && squares[6].value == player) {
        hasWon = true;
    } else if(squares[1].value == player && squares[4].value == player && squares[7].value == player) {
        hasWon = true;
    } else if(squares[2].value == player && squares[5].value == player && squares[8].value == player) {
        hasWon = true;
    } else if(squares[0].value == player && squares[4].value == player && squares[8].value == player) {
        hasWon = true;
    } else if(squares[2].value == player && squares[4].value == player && squares[6].value == player) {
        hasWon = true;
    }

    totalChecks++;
    socket.emit('checksRoom', totalChecks);

	// Comprueba si el usuario ha ganado la partida y se lo emite al servidor.
    if(hasWon) {
        socket.emit('sayWinner', player);
    }
}

// Reinicia la partida y limpia el tablero cuando se ejecuta.
function restartGame() {
    for(var i = 0; i < squares.length; i++) {
        squares[i].style.backgroundColor = '';
        squares[i].value = null;
        totalChecks = 0;
    }
}

// Efecto para mostrar un elemento.
function fadeIn(element) {
    setTimeout(function() {
        element.style.opacity = 1;
    }, 200);
}

// Efecto para ocultar un elemento.
function fadeOut(element) {
    element.style.opacity = 0;

    setTimeout(function() {
        element.remove();
    }, 200);
}

/**
 * [CONTROLADOR DEL CHAT].
 */
// Recibe el evento del servidor para escribir un mensaje en el chat.
socket.on('printMessage', function(data) {
	const messages = document.getElementById('messages');

	const messageSent     = new Audio('/sounds/message-sent.mp3');
	const messageReceived = new Audio('/sounds/message-received.mp3');

	let p = document.createElement('p');
	// Comprueba qué usuario ha enviado el mensaje para asignarle un color al mensaje.
	if(data.user == true) {
		// Comprueba si el usuario es el que ha enviado el mensaje para posicionarlo en el chat.
		if(data.user == playerBoolean) {
			p.setAttribute('class', 'msg green right');
			// Reproduce el sonido de mensaje enviado.
			messageSent.play();
		} else {
			p.setAttribute('class', 'msg green left');
			// Reproduce el sonido de mensaje recibido.
			messageReceived.play();
		}
	} else {
		// Comprueba si el usuario es el que ha enviado el mensaje para posicionarlo en el chat.
		if(data.user == playerBoolean) {
			p.setAttribute('class', 'msg red right');
			messageSent.play();
		} else {
			p.setAttribute('class', 'msg red left');
			messageReceived.play();
		}
	}

	let alert = document.getElementById('new-message');
	// Comprueba si el chat del usuario está cerrado y pinta una alerta en las letras del menú.
	if(document.getElementById('chat').getAttribute('class') != 'open') {
		alert.style.color = '#F36060';
	}

	// Escribe el mensaje en el chat del usuario.
	p.appendChild(document.createTextNode(data.message));
	messages.appendChild(p);

	// Hace scroll hasta abajo del todo al recivir un mensaje.
	messages.scrollTo(0, messages.scrollHeight);
});

// Controla el evento que envía los datos del formulario.
document.getElementById('form').addEventListener('submit', function(ev) {
	// Evita que se recarge la página.
	ev.preventDefault();

	let msg = document.getElementById('message');

	// Comprueba si se el usuario ha escrito un mensaje.
	if(msg.value) {
		// Emite el mensaje del usuario al servidor para que lo escriba en el chat.
		socket.emit('chatMessage', {
			message: msg.value,
			playerBoolean: playerBoolean
		});

		// Limpia el mensaje anterior del input.
		msg.value = '';
	}

	return false;
});
