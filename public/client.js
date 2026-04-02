function mostrarMensaje(id, texto, tipo) {
  var el = document.getElementById(id);
  el.textContent = texto;
  el.className = tipo;
  el.style.display = 'block';
}

async function registrar() {
  var username = document.getElementById('username').value.trim();
  var password = document.getElementById('password').value.trim();

  if (!username || !password) {
    mostrarMensaje('mensaje', 'Completa todos los campos', 'error');
    return;
  }

  try {
    var response = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    var data = await response.json();

    if (response.ok) {
      mostrarMensaje('mensaje', data.mensaje + ' Redirigiendo...', 'exito');
      setTimeout(function() { window.location.href = '/login.html'; }, 1500);
    } else {
      mostrarMensaje('mensaje', data.error, 'error');
    }
  } catch (error) {
    mostrarMensaje('mensaje', 'Error de conexion', 'error');
  }
}

async function login() {
  var username = document.getElementById('username').value.trim();
  var password = document.getElementById('password').value.trim();

  if (!username || !password) {
    mostrarMensaje('mensaje', 'Completa todos los campos', 'error');
    return;
  }

  try {
    var response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    var data = await response.json();

    if (response.ok) {
      // Guardar el token en localStorage
      localStorage.setItem('token', data.token);
      mostrarMensaje('mensaje', 'Login exitoso! Token guardado.', 'exito');
    } else {
      mostrarMensaje('mensaje', data.error, 'error');
    }
  } catch (error) {
    mostrarMensaje('mensaje', 'Error de conexion', 'error');
  }
}

async function verPerfil() {
  var token = localStorage.getItem('token');

  if (!token) {
    mostrarMensaje('mensaje', 'Primero inicia sesion para obtener un token', 'error');
    return;
  }

  try {
    var response = await fetch('/perfil', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    var data = await response.json();

    if (response.ok) {
      var perfilDiv = document.getElementById('perfil');
      perfilDiv.style.display = 'block';
      perfilDiv.innerHTML =
        '<strong>' + data.mensaje + '</strong>' +
        '<p>Usuario: ' + data.usuario.username + '</p>' +
        '<p>Rol: ' + data.usuario.rol + '</p>';
    } else {
      mostrarMensaje('mensaje', data.error, 'error');
    }
  } catch (error) {
    mostrarMensaje('mensaje', 'Error de conexion', 'error');
  }
}