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
const userID  = document.getElementById('user-id').value;
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

