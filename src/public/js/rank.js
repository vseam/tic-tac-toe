/**
 * [OBTENCIÓN DE EL RANKING GLOBAL].
 */
const stats   = document.getElementById('stats-body');
const ranking = document.getElementById('rank-body');

fetch('/getrank').then((res) => {
	if(res.ok) { return res.json(); }
}).then((rows) => {
	let position  = 1;
	let userCount = 1;

	for(let row of rows) {
		let tr = document.createElement('tr');

		let tdPos = document.createElement('td');
		tdPos.appendChild(document.createTextNode(position));
		tr.appendChild(tdPos);

		let tdUser = document.createElement('td');
		tdUser.setAttribute('class', 'highlight');

		if(position >= 1 && position <= 3) {
			let icon = document.createElement('i');

			switch(position) {
				case 1:
					icon.setAttribute('class', 'fas fa-trophy trophy-gold');
					break;
				case 2:
					icon.setAttribute('class', 'fas fa-trophy trophy-silver');
					break;
				case 3:
					icon.setAttribute('class', 'fas fa-trophy trophy-bronze');
					break;
			}

			tdUser.appendChild(icon);
		}

		tdUser.appendChild(document.createTextNode(row['username']));
		tr.appendChild(tdUser);

		let tdPG = document.createElement('td');
		tdPG.appendChild(document.createTextNode(row['wonGames']));
		tr.appendChild(tdPG);

		let tdPP = document.createElement('td');
		tdPP.appendChild(document.createTextNode(row['lostGames']));
		tr.appendChild(tdPP);

		let tdELO = document.createElement('td');
		tdELO.setAttribute('class', 'highlight');
		tdELO.appendChild(document.createTextNode(row['eloPoints']));
		tr.appendChild(tdELO);

		if(row['username'] == document.getElementById('username').value) {
			let temp = tr.cloneNode(true);
			temp.childNodes[1].setAttribute('class', 'high-primary');

			stats.appendChild(temp);

			if(userCount >= 20) { break; }
		}

		if(userCount <= 20) { ranking.appendChild(tr); }

		position++;
		userCount++;
	}
}).catch(console.log);
