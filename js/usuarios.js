// =========================================================
// Gestión de usuarios (página privada)
// =========================================================

// R1: Solo usuarios autenticados. Sin sesión, se redirige al login.
protegerPagina();

const formUsuario = document.getElementById("formUsuario");
const tituloFormulario = document.getElementById("tituloFormulario");
const inputIdentificacion = document.getElementById("identificacion");
const mensajeUsuario = document.getElementById("mensajeUsuario");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const tablaUsuarios = document.getElementById("tablaUsuarios");
const resumenUsuarios = document.getElementById("resumenUsuarios");

let usuarios = obtenerUsuarios();
let identificacionEditando = null; // null = modo crear; con valor = modo editar

// Reglas de validación: cada campo devuelve un mensaje de error o "" si está bien
const REGLAS = {
  identificacion: (valor) =>
    EXPRESION_IDENTIFICACION.test(valor) ? "" : "Solo números, entre 6 y 12 dígitos.",
  nombre: (valor) =>
    valor.length >= 3 ? "" : "Escribe el nombre completo (mínimo 3 letras).",
  email: (valor) =>
    EXPRESION_CORREO.test(valor) ? "" : "Escribe un correo válido.",
  telefono: (valor) =>
    EXPRESION_TELEFONO.test(valor) ? "" : "Solo números, entre 7 y 10 dígitos.",
  cargo: (valor) =>
    valor === "Administrativo" || valor === "Docente" ? "" : "Elige un cargo.",
  contrasena: (valor) =>
    valor.length >= 6 ? "" : "La contraseña debe tener mínimo 6 caracteres."
};

// R2: Pinta la tabla: una fila por usuario con sus datos y los botones Editar y Eliminar.
function renderizar() {
  const filas = usuarios.map((usuario) => {
    const fila = document.createElement("tr");
    fila.dataset.id = usuario.identificacion;

    const datos = [usuario.identificacion, usuario.nombre, usuario.email, usuario.telefono];
    datos.forEach((dato) => {
      const celda = document.createElement("td");
      celda.textContent = dato;
      fila.append(celda);
    });

    const celdaCargo = document.createElement("td");
    const etiqueta = document.createElement("span");
    etiqueta.className = `etiqueta etiqueta-${usuario.cargo.toLowerCase()}`;
    etiqueta.textContent = usuario.cargo;
    celdaCargo.append(etiqueta);

    const celdaAcciones = document.createElement("td");
    celdaAcciones.className = "celda-acciones";
    const btnEditar = document.createElement("button");
    btnEditar.className = "btn btn-secundario btn-pequeno";
    btnEditar.dataset.accion = "editar";
    btnEditar.textContent = "Editar";
    const btnEliminar = document.createElement("button");
    btnEliminar.className = "btn btn-peligro btn-pequeno";
    btnEliminar.dataset.accion = "eliminar";
    btnEliminar.textContent = "Eliminar";
    celdaAcciones.append(btnEditar, btnEliminar);

    fila.append(celdaCargo, celdaAcciones);
    return fila;
  });

  if (filas.length === 0) {
    const fila = document.createElement("tr");
    const celda = document.createElement("td");
    celda.colSpan = 6;
    celda.className = "vacio";
    celda.textContent = "No hay usuarios registrados.";
    fila.append(celda);
    filas.push(fila);
  }

  tablaUsuarios.replaceChildren(...filas);

  const docentes = usuarios.filter((u) => u.cargo === "Docente").length;
  resumenUsuarios.textContent = `Total: ${usuarios.length} | Docentes: ${docentes} | Administrativos: ${usuarios.length - docentes}`;
}

// R3: Valida un campo con REGLAS, muestra el error debajo y marca el input.
function validarCampo(nombreCampo) {
  const input = formUsuario.elements[nombreCampo];
  const error = REGLAS[nombreCampo](input.value.trim());
  document.getElementById(`error-${nombreCampo}`).textContent = error;
  input.classList.toggle("incorrecto", error !== "");
  return error === "";
}

// Validación en vivo: UN solo listener en el formulario (el evento input burbujea desde cada campo)
formUsuario.addEventListener("input", (e) => {
  if (REGLAS[e.target.name] !== undefined) validarCampo(e.target.name);
});

// Deja el formulario vacío y en modo "crear"
function limpiarFormulario() {
  formUsuario.reset();
  identificacionEditando = null;
  inputIdentificacion.disabled = false;
  tituloFormulario.textContent = "Nuevo usuario";
  btnGuardar.textContent = "Crear usuario";
  btnCancelar.classList.add("oculto");
  Object.keys(REGLAS).forEach((campo) => {
    document.getElementById(`error-${campo}`).textContent = "";
    formUsuario.elements[campo].classList.remove("incorrecto");
  });
}

// R4: Al enviar se validan TODOS los campos; si todo está bien se crea o se actualiza el usuario.
formUsuario.addEventListener("submit", (e) => {
  e.preventDefault();

  // map (no every) para que se muestren los errores de todos los campos a la vez
  const resultados = Object.keys(REGLAS).map((campo) => validarCampo(campo));
  const errores = resultados.filter((valido) => !valido).length;
  if (errores > 0) {
    mostrarMensaje(mensajeUsuario, `Revisa el formulario: hay ${errores} campo(s) con error.`, "fallo");
    return;
  }

  const datos = new FormData(formUsuario);
  const usuario = {
    // El input deshabilitado no viaja en FormData, por eso en edición se usa la identificación guardada
    identificacion: identificacionEditando !== null ? identificacionEditando : datos.get("identificacion").trim(),
    nombre: datos.get("nombre").trim(),
    email: datos.get("email").trim().toLowerCase(),
    telefono: datos.get("telefono").trim(),
    cargo: datos.get("cargo"),
    contrasena: datos.get("contrasena")
  };

  // No se repiten identificación ni correo (sin contar al usuario que se está editando)
  const otros = usuarios.filter((u) => u.identificacion !== identificacionEditando);
  if (otros.some((u) => u.identificacion === usuario.identificacion)) {
    mostrarMensaje(mensajeUsuario, "Ya existe un usuario con esa identificación.", "fallo");
    return;
  }
  if (otros.some((u) => u.email === usuario.email)) {
    mostrarMensaje(mensajeUsuario, "Ya existe un usuario con ese correo.", "fallo");
    return;
  }

  if (identificacionEditando === null) {
    usuarios.push(usuario);
    mostrarMensaje(mensajeUsuario, `Usuario ${usuario.nombre} creado.`, "exito");
    console.log("Usuario creado:", usuario.identificacion);
  } else {
    const indice = usuarios.findIndex((u) => u.identificacion === identificacionEditando);
    usuarios[indice] = usuario;
    mostrarMensaje(mensajeUsuario, `Usuario ${usuario.nombre} actualizado.`, "exito");
    console.log("Usuario actualizado:", usuario.identificacion);
  }

  guardarUsuarios(usuarios);
  limpiarFormulario();
  renderizar();
});

// R5: UN solo listener en la tabla: se lee data-accion del botón y se sube a la fila para saber el usuario.
tablaUsuarios.addEventListener("click", (e) => {
  const accion = e.target.dataset.accion;
  if (accion === undefined) return; // clic fuera de un botón

  const identificacion = e.target.closest("tr").dataset.id;
  const usuario = usuarios.find((u) => u.identificacion === identificacion);

  if (accion === "editar") {
    // Se llena el formulario con los datos del usuario (desestructuración)
    const { nombre, email, telefono, cargo, contrasena } = usuario;
    formUsuario.elements.identificacion.value = usuario.identificacion;
    formUsuario.elements.nombre.value = nombre;
    formUsuario.elements.email.value = email;
    formUsuario.elements.telefono.value = telefono;
    formUsuario.elements.cargo.value = cargo;
    formUsuario.elements.contrasena.value = contrasena;

    identificacionEditando = identificacion;
    inputIdentificacion.disabled = true; // la identificación es la llave, no se cambia
    tituloFormulario.textContent = `Editando a ${nombre}`;
    btnGuardar.textContent = "Guardar cambios";
    btnCancelar.classList.remove("oculto");
    mostrarMensaje(mensajeUsuario, "", "");
    formUsuario.scrollIntoView({ behavior: "smooth" });
  }

  if (accion === "eliminar") {
    // No se puede borrar el usuario con el que se inició sesión
    if (identificacion === obtenerSesion().identificacion) {
      mostrarMensaje(mensajeUsuario, "No puedes eliminar tu propio usuario mientras tienes la sesión abierta.", "fallo");
      return;
    }
    if (!confirm(`¿Eliminar a ${usuario.nombre}? Esta acción no se puede deshacer.`)) return;

    usuarios = usuarios.filter((u) => u.identificacion !== identificacion);
    guardarUsuarios(usuarios);
    if (identificacionEditando === identificacion) limpiarFormulario();
    mostrarMensaje(mensajeUsuario, `Usuario ${usuario.nombre} eliminado.`, "exito");
    console.log("Usuario eliminado:", identificacion);
    renderizar();
  }
});

// R6: Cancelar la edición devuelve el formulario al modo crear.
btnCancelar.addEventListener("click", () => {
  limpiarFormulario();
  mostrarMensaje(mensajeUsuario, "", "");
});

renderizar();
