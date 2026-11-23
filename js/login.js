// =========================================================
// Login
// =========================================================

const formLogin = document.getElementById("formLogin");
const inputEmail = document.getElementById("email");
const inputContrasena = document.getElementById("contrasena");
const mensajeLogin = document.getElementById("mensajeLogin");
const btnIngresar = document.getElementById("btnIngresar");

// R1: Si ya hay una sesión iniciada, no tiene sentido ver el login: se va a la gestión de usuarios.
if (obtenerSesion() !== null) {
  location.replace("usuarios.html");
}

// R2: Al cargar la página se asegura que existan los datos iniciales (usuario administrador).
inicializarDatos();

// R3: Al enviar el formulario se valida el correo y la contraseña.
formLogin.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = inputEmail.value.trim().toLowerCase();
  const contrasena = inputContrasena.value;

  // Validación de formato antes de buscar al usuario
  inputEmail.classList.toggle("incorrecto", !EXPRESION_CORREO.test(email));
  inputContrasena.classList.toggle("incorrecto", contrasena === "");

  if (!EXPRESION_CORREO.test(email)) {
    mostrarMensaje(mensajeLogin, "Escribe un correo válido.", "fallo");
    return;
  }
  if (contrasena === "") {
    mostrarMensaje(mensajeLogin, "Escribe tu contraseña.", "fallo");
    return;
  }

  // R4: Se busca un usuario con ese correo y esa contraseña.
  const usuario = obtenerUsuarios().find(
    (u) => u.email.toLowerCase() === email && u.contrasena === contrasena
  );

  // Por seguridad no se dice cuál de los dos datos falló
  if (usuario === undefined) {
    mostrarMensaje(mensajeLogin, "Correo o contraseña incorrectos.", "fallo");
    console.log(`Intento fallido de inicio de sesión: ${email}`);
    return;
  }

  // R5: Usuario correcto: se guarda la sesión y se entra a la zona privada.
  iniciarSesion(usuario);
  mostrarMensaje(mensajeLogin, `¡Hola, ${usuario.nombre}! Ingresando...`, "exito");
  btnIngresar.disabled = true;
  console.log(`Sesión iniciada: ${usuario.nombre} (${usuario.cargo})`);

  setTimeout(() => {
    location.href = "usuarios.html";
  }, 800);
});
