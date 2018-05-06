const express      = require('express');
const app          = express();
const server       = require('http').Server(app);
const path         = require('path');
const mongoose     = require('mongoose');
const passport     = require('passport');
const flash        = require('connect-flash');
const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const session      = require('express-session');
const io           = require('socket.io')(server);

// Conexión con la base de datos MongoDB.
const { urlDB }    = require('./config/database');
mongoose.connect(urlDB);
mongoose.connection.on('error', () => mongoose.connect(urlDB));

// Configuración del puerto en el que escucha el servidor.
app.set('port', process.env.PORT || 3000);
// Configuración de la ruta de las plantillas.
app.set('views', path.join(__dirname, 'views'));
// Configuración del motor de plantillas.
app.set('view engine', 'ejs');

// Habilita el uso del middleware "morgan".
app.use(morgan('dev'));
// Habilita el uso del middleware "cookie-parser".
app.use(cookieParser());
// Habilita el uso del middleware "body-parser".
app.use(bodyParser.urlencoded( { extended: false } ));
// Configuración de las sesiones de la aplicación.
app.use(session( {
	secret: '&*^*&#$^7sdfjgsdj78^&*usdfsgf',
	resave: false,
	saveUninitialized: false
}));
// Habilita el uso del sistema de autentificación con sesiones.
app.use(passport.initialize());
app.use(passport.session());
// Habilita el uso del middleware "connect-flash".
app.use(flash());

// Configuración del sistema de autentificación de la aplicación.
require('./config/passport')(passport);

// Configuración de las rutas de la aplicación.
require('./app/routes')(app, passport);

// Configuración de la ruta de los ficheros públicos.
app.use(express.static(path.join(__dirname, 'public')));

// Configuración del sistema de las partidas de la aplicación.
require('./app/game')(io);

// Captura los errores de rutas que no existen.
app.use((req, res, next) => {
	res.status(404).render('error');
	next();
});

// Ejecuta el servidor en el puerto asignado.
server.listen(app.get('port'), () => {
    console.log('Server running. Listening in the port *:', app.get('port'));
});
