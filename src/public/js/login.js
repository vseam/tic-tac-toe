const loginForm    = document.getElementById('form-login');
const registerForm = document.getElementById('form-register');

// Cambia el formulario de registro al de iniciar sesión.
document.getElementById('nav-login').addEventListener('click', function() {
	let parent = this.parentNode;

	// Comprueba si no se está mostrando ya el formulario de inicio de sesión.
	if(parent.getAttribute('class') != 'selected') {
		parent.setAttribute('class', 'selected');
		loginForm.removeAttribute('class');

		document.getElementById('nav-register').parentNode.removeAttribute('class');
		registerForm.setAttribute('class', 'not-show');
	}
});

// Cambia el formulario de iniciar sesión al de registro.
document.getElementById('nav-register').addEventListener('click', function() {
	let parent = this.parentNode;

	// Comprueba si no se está mostrando ya el formulario de registro.
	if(parent.getAttribute('class') != 'selected') {
		parent.setAttribute('class', 'selected');
		registerForm.removeAttribute('class');

		document.getElementById('nav-login').parentNode.removeAttribute('class');
		loginForm.setAttribute('class', 'not-show');
	}
});

function submit() { registerForm.submit(); }
