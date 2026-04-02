const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = 3000;

const SECRET_KEY = 'tuClaveSecretaSuperSegura123';

// Array en memoria para guardar usuarios
const users = [];

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// POST /register
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username y password son obligatorios' });
  }

  const userExists = users.find(function(u) { return u.username === username; });
  if (userExists) {
    return res.status(409).json({ error: 'El nombre de usuario ya esta en uso' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = { username, password: hashedPassword };
  users.push(newUser);

  console.log('Usuario registrado:', newUser);
  res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });
});

// POST /login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = users.find(function(u) { return u.username === username; });
  if (!user) {
    return res.status(401).json({ error: 'Credenciales invalidas' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Credenciales invalidas' });
  }

  const payload = { username: user.username, rol: 'usuario' };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });

  res.json({ token });
});

// Middleware de verificacion de token
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payloadDecodificado = jwt.verify(token, SECRET_KEY);
    req.usuario = payloadDecodificado;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token invalido o expirado' });
  }
}

// GET /perfil - ruta protegida
app.get('/perfil', verificarToken, function(req, res) {
  res.json({
    mensaje: 'Acceso concedido al perfil',
    usuario: req.usuario
  });
});

app.listen(PORT, function() {
  console.log('Servidor corriendo en http://localhost:' + PORT);
});