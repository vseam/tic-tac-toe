const url    = window.location.href.split('/')[3];
var openChat = false;

// Comprueba en qué ruta está el usuario para asignarle eventos específicos a cada menú.
switch(url) {
	case '':
		document.getElementById('nav-game').addEventListener('click', function() { window.location.href = '/game'; });
		document.getElementById('nav-rank').addEventListener('click', function() { window.location.href = '/rank'; });
		break;
	case 'game':
		document.getElementById('nav-home').addEventListener('click', function() {
			if(playerBoolean != null) {
				if(openChat) {
					document.getElementById('chat').removeAttribute('class');
					openChat = false;
				}
				createLeaveAlert('/');
			} else {
				window.location.href = '/'
			}
		});

		document.getElementById('nav-chat').addEventListener('click', function() {
			const element = document.getElementById('chat');
			const alert   = document.getElementById('new-message');

			if(playerBoolean != null) {
				if(!openChat) {
					element.setAttribute('class', 'open');
					alert.removeAttribute('style');
					openChat = true;
				} else {
					element.removeAttribute('class');
					openChat = false;
				}
			}
		});

		document.getElementById('nav-rank').addEventListener('click', function() {
			if(playerBoolean != null) {
				if(openChat) {
					document.getElementById('chat').removeAttribute('class');
					openChat = false;
				}
				createLeaveAlert('/rank');
			} else {
				window.location.href = '/rank';
			}
		});
		break;
	case 'rank':
		document.getElementById('nav-home').addEventListener('click', function() { window.location.href = '/'; });
		document.getElementById('nav-game').addEventListener('click', function() { window.location.href = '/game'; });
		break;
}

// Función que crea la alerta cuando estás dentro de partida.
function createLeaveAlert(goTo) {
	if(!document.getElementById('leave')) {
		let base = document.createElement('div');
		base.setAttribute('id', 'leave');
		base.setAttribute('class', 'warn');

		let alert = document.createElement('div');
		alert.setAttribute('id', 'warn-bc');
		base.appendChild(alert);

		let icon = document.createElement('i');
		icon.setAttribute('class', 'fas fa-exclamation-triangle');
		alert.appendChild(icon);

		let title = document.createElement('h2');
		title.appendChild(document.createTextNode('¿Estas seguro?'));
		alert.appendChild(title);

		let text = document.createElement('p');
		text.appendChild(document.createTextNode('¡Estás apunto de abandonar la partida!'));
		alert.appendChild(text);

		let btnClose = document.createElement('button');
		btnClose.setAttribute('class', 'btn btn-grey');
		btnClose.addEventListener('click', function() { fadeOut(base); });
		btnClose.appendChild(document.createTextNode('Cancelar'));
		alert.appendChild(btnClose);

		let btnAccept = document.createElement('button');
		btnAccept.setAttribute('class', 'btn btn-primary');
		btnAccept.addEventListener('click', function() { window.location.href = goTo; });
		btnAccept.appendChild(document.createTextNode('Sí, estoy seguro'));
		alert.appendChild(btnAccept);

		alerts.appendChild(base);
		fadeIn(base);
	}
}
