const userID  = document.getElementById('user-id').value;

/**
 * [CONFIGURACIÓN DEL PERFIL].
 */
const btnSettings = document.getElementById('open-settings');
btnSettings.addEventListener('click', function() {
	let base = document.createElement('div');
	base.setAttribute('id', 'winSettings');
	base.setAttribute('class', 'warn');

	let alert = document.createElement('div');
	alert.setAttribute('id', 'warn-bc');
	base.appendChild(alert);

	let btnClose = document.createElement('i');
	btnClose.setAttribute('class', 'fas fa-times-circle btn-close');
	btnClose.addEventListener('click', function() { fadeOut(base); });
	alert.appendChild(btnClose);

	let title = document.createElement('h2');
	title.appendChild(document.createTextNode('Configuración'));
	alert.appendChild(title);

	// Cambiar avatar del perfil.
	let avatarForm = document.createElement('form');
	avatarForm.setAttribute('method', 'post');
	avatarForm.setAttribute('action', '/user/avatar/' + userID);
	avatarForm.setAttribute('enctype', 'multipart/form-data');
	alert.appendChild(avatarForm);

	let avatarInput = document.createElement('input');
	avatarInput.setAttribute('id', 'avatar');
	avatarInput.setAttribute('name', 'avatar');
	avatarInput.setAttribute('type', 'file');
	avatarInput.setAttribute('style', 'display: none');
	avatarForm.appendChild(avatarInput);

	let btnAvatar = document.createElement('label');
	btnAvatar.setAttribute('for', 'avatar');
	btnAvatar.setAttribute('class', 'btn btn-primary btn-full btn-mg');
	btnAvatar.appendChild(document.createTextNode('Cambiar avatar'));
	avatarInput.addEventListener('change', function() {
		console.log(avatarInput.files[0].size);
		if(avatarInput.files[0].size <= 8388608) {
			avatarForm.submit();
		} else {
			console.log('muy grande puta');
		}
	});
	avatarForm.appendChild(btnAvatar);

	let hr1 = document.createElement('hr');
	hr1.setAttribute('style', 'margin: 16px 0');
	alert.appendChild(hr1);

	// Cambiar contraseña de la cuenta.
	let passwdForm = document.createElement('form');
	passwdForm.setAttribute('method', 'post');
	passwdForm.setAttribute('action', '/user/passwd/' + userID);
	alert.appendChild(passwdForm);

	let passwdInput = document.createElement('input');
	passwdInput.setAttribute('class', 'form-control fc-light');
	passwdInput.setAttribute('name', 'passwd');
	passwdInput.setAttribute('type', 'password');
	passwdInput.setAttribute('placeholder', 'Nueva contraseña');
	passwdForm.appendChild(passwdInput);

	let btnPasswd = document.createElement('button');
	btnPasswd.setAttribute('class', 'btn btn-primary btn-full btn-mg');
	btnPasswd.appendChild(document.createTextNode('Cambiar contraseña'));
	btnPasswd.addEventListener('click', function() {
		passwdForm.submit();
	});
	passwdForm.appendChild(btnPasswd);

	let hr2 = document.createElement('hr');
	hr2.setAttribute('style', 'margin: 12px 0');
	alert.appendChild(hr2);

	// Eliminar cuenta definitivamente.
	let deleteForm = document.createElement('form');
	deleteForm.setAttribute('method', 'post');
	deleteForm.setAttribute('action', '/user/delete/' + userID);
	alert.appendChild(deleteForm);

	let btnDelete = document.createElement('button');
	btnDelete.setAttribute('class', 'btn btn-grey btn-full btn-mg');
	btnDelete.appendChild(document.createTextNode('Borrar cuenta'));
	btnDelete.addEventListener('click', function() {
		this.remove();

		let btnDelete = document.createElement('button');
		btnDelete.setAttribute('class', 'btn btn-delete btn-full btn-mg');
		btnDelete.appendChild(document.createTextNode('Confirmar eliminación'));
		btnDelete.addEventListener('click', function() {
			deleteForm.submit();
		});
		deleteForm.appendChild(btnDelete);
	});
	deleteForm.appendChild(btnDelete);

	document.getElementById('settings').appendChild(base);
	fadeIn(base);
});

/**
 * [CÁLCULO DEL RATIO G/P].
 */
const wonGames  = document.getElementById('won-games').innerText;
const lostGames = document.getElementById('lost-games').innerText;
const calc 		= document.getElementById('calc');

if(wonGames == 0 && lostGames == 0) {
	calc.innerText = '0';
} else if(wonGames >= 1 && lostGames == 0) {
	calc.innerText = 'All';
	calc.setAttribute('class', 'good');
} else if(wonGames == 0 && lostGames >= 1) {
	calc.innerText = 'Nothing';
	calc.setAttribute('class', 'bad');
} else {
	// Calcula el ratio de partidas ganadas/perdidas.
	let ratioCalc = (wonGames / lostGames).toFixed(3);
	calc.innerText = ratioCalc;

	if(ratioCalc > 1.000) {
		calc.setAttribute('class', 'good');
	} else if(ratioCalc < 1.000) {
		calc.setAttribute('class', 'bad');
	}
}

/**
 * [OBTENCIÓN DE LAS ÚLTIMAS PARTIDAS].
 */
const matches = document.getElementById('matches-body');

fetch('/getmatches/' + userID).then((res) => {
	if(res.ok) { return res.json(); }
}).then((rows) => {
	// Comprueba si se han encontrado partidas recientes del usuario actual.
	if(rows.length > 0) {
		// Elimina el mensaje de partidas no encontradas y muestra la tabla.
		document.getElementById('not-found').remove();
		document.getElementById('matches').removeAttribute('class');

		// Recorre las partidas recientes y las va mostrando en la tabla.
		for(let row of rows) {
			let tr = document.createElement('tr');

			let tdDate = document.createElement('td');
			tdDate.appendChild(document.createTextNode(row['date']));
			tr.appendChild(tdDate);

			let tdOppo = document.createElement('td');
			tdOppo.appendChild(document.createTextNode(row['opponent']));
			tr.appendChild(tdOppo);

			let tdResu = document.createElement('td');
			tdResu.appendChild(document.createTextNode(row['result']));
			(row['result'] == 'Ganada') ? tdResu.setAttribute('class', 'won') : tdResu.setAttribute('class', 'lost');
			tr.appendChild(tdResu);

			matches.appendChild(tr);
		}
	}
}).catch(console.log);

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
