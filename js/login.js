// =========================================================
// Login (index.html): entrada de la aplicación
// =========================================================

const formularioLogin = document.getElementById("formularioLogin");

// R1: Si ya hay una sesión iniciada, no tiene sentido ver el login: se va a la gestión de usuarios.
if (obtenerSesion() !== null) {
  location.replace("html/usuarios.html");
}

// R2: Se cargan los datos iniciales. Se guarda la promesa para esperarla antes de validar
//     (así un clic muy rápido en "Ingresar" no encuentra la lista de usuarios vacía).
const datosListos = inicializarDatos();

// R3: El componente avisa con el evento "login-enviar" cuando el formato es correcto.
formularioLogin.addEventListener("login-enviar", async (e) => {
  await datosListos;
  const { email, contrasena } = e.detail;

  // R4: Se busca un usuario con ese correo y esa contraseña.
  const usuario = obtenerUsuarios().find(
    (u) => u.email.toLowerCase() === email && u.contrasena === contrasena
  );

  // Por seguridad no se dice cuál de los dos datos falló
  if (usuario === undefined) {
    formularioLogin.mostrarMensaje("Correo o contraseña incorrectos.", "fallo");
    console.log(`Intento fallido de inicio de sesión: ${email}`);
    return;
  }

  // R5: Usuario correcto: se guarda la sesión y se entra a la zona privada.
  iniciarSesion(usuario);
  formularioLogin.mostrarMensaje(`¡Hola, ${usuario.nombre}! Ingresando...`, "exito");
  formularioLogin.bloquear();
  console.log(`Sesión iniciada: ${usuario.nombre} (${usuario.cargo})`);

  setTimeout(() => {
    location.href = "html/usuarios.html";
  }, 800);
});
