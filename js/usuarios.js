// =========================================================
// Gestión de usuarios (página privada)
// Une los componentes <formulario-usuario> y <tabla-usuarios>
// con los datos guardados en localStorage.
// =========================================================

// R1: Solo usuarios autenticados. Sin sesión, se vuelve al login.
protegerPagina();

const formularioUsuario = document.getElementById("formularioUsuario");
const tablaUsuarios = document.getElementById("tablaUsuarios");

let usuarios = obtenerUsuarios();

// R2: Mostrar los usuarios registrados en la tabla.
function actualizarTabla() {
  tablaUsuarios.renderizar(usuarios, formularioUsuario.identificacionEditando);
}

// R3: Crear o actualizar. El formulario ya validó los campos; aquí se revisa que
//     no se repitan la identificación ni el correo y se guarda en localStorage.
formularioUsuario.addEventListener("guardar-usuario", (e) => {
  const { usuario, identificacionEditando } = e.detail;

  // Los demás usuarios (sin contar al que se está editando)
  const otros = usuarios.filter((u) => u.identificacion !== identificacionEditando);
  if (otros.find((u) => u.identificacion === usuario.identificacion) !== undefined) {
    formularioUsuario.mostrarMensaje("Ya existe un usuario con esa identificación.", "fallo");
    return;
  }
  if (otros.find((u) => u.email === usuario.email) !== undefined) {
    formularioUsuario.mostrarMensaje("Ya existe un usuario con ese correo.", "fallo");
    return;
  }

  if (identificacionEditando === null) {
    usuarios.push(usuario);
    console.log("Usuario creado:", usuario.identificacion);
  } else {
    const indice = usuarios.findIndex((u) => u.identificacion === identificacionEditando);
    usuarios[indice] = usuario;
    console.log("Usuario actualizado:", usuario.identificacion);

    // Si el usuario se editó a sí mismo, se actualizan la sesión y el nombre del menú
    if (usuario.identificacion === obtenerSesion().identificacion) {
      iniciarSesion(usuario);
      document.querySelector("acme-menu").render();
    }
  }

  guardarUsuarios(usuarios);
  formularioUsuario.limpiar();
  formularioUsuario.mostrarMensaje(
    `Usuario ${usuario.nombre} ${identificacionEditando === null ? "creado" : "actualizado"}.`,
    "exito"
  );
  actualizarTabla();
});

// R4: Editar: la tabla avisa qué usuario se eligió y el formulario se llena con sus datos.
tablaUsuarios.addEventListener("editar-usuario", (e) => {
  const usuario = usuarios.find((u) => u.identificacion === e.detail.identificacion);
  formularioUsuario.editar(usuario);
  actualizarTabla();
});

// R5: Eliminar (la tabla ya pidió el doble clic de confirmación).
//     No se puede borrar el usuario con el que se inició sesión.
tablaUsuarios.addEventListener("eliminar-usuario", (e) => {
  const { identificacion } = e.detail;
  const usuario = usuarios.find((u) => u.identificacion === identificacion);

  if (identificacion === obtenerSesion().identificacion) {
    formularioUsuario.mostrarMensaje("No puedes eliminar tu propio usuario mientras tienes la sesión abierta.", "fallo");
    actualizarTabla(); // devuelve el botón a "Eliminar"
    return;
  }

  usuarios = usuarios.filter((u) => u.identificacion !== identificacion);
  guardarUsuarios(usuarios);
  if (formularioUsuario.identificacionEditando === identificacion) formularioUsuario.limpiar();
  formularioUsuario.mostrarMensaje(`Usuario ${usuario.nombre} eliminado.`, "exito");
  console.log("Usuario eliminado:", identificacion);
  actualizarTabla();
});

// Al cancelar la edición se quita el resaltado de la fila
formularioUsuario.addEventListener("cancelar-edicion", () => {
  formularioUsuario.mostrarMensaje("", "");
  actualizarTabla();
});

actualizarTabla();
