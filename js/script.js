// =========================================================
// Acme School · script.js (código común)
// Se carga en TODAS las páginas antes del script de cada página.
// =========================================================

// Claves de localStorage y sessionStorage
const CLAVE_USUARIOS = "acme:usuarios";     // [{ identificacion, nombre, email, telefono, cargo, contrasena }]
const CLAVE_EXAMENES = "acme:examenes";     // [{ codigo, titulo, tiempo, porcentaje, descripcion, preguntas }]
const CLAVE_RESULTADOS = "acme:resultados"; // [{ codigoExamen, identificacion, nombre, aciertos, total, porcentaje, aprobado, fecha }]
const CLAVE_SESION = "acme:sesion";         // { identificacion, nombre, email, cargo } (sessionStorage)

// Las páginas de la carpeta html/ deben subir un nivel para llegar a json/ y a index.html
const RUTA_BASE = location.pathname.includes("/html/") ? "../" : "";

// ---------- localStorage ----------

// Lee un valor de localStorage y lo convierte de JSON. Si no existe, devuelve el valor por defecto.
function leerLocal(clave, porDefecto) {
  const texto = localStorage.getItem(clave);
  if (texto === null) return porDefecto;
  try {
    return JSON.parse(texto);
  } catch (error) {
    console.error(`El valor de ${clave} no es un JSON válido`);
    return porDefecto;
  }
}

// Guarda cualquier valor como JSON en localStorage
function guardarLocal(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

// ---------- Datos iniciales ----------

// Carga cualquier archivo de la carpeta json/
async function cargarJSON(nombreArchivo) {
  const respuesta = await fetch(`${RUTA_BASE}json/${nombreArchivo}`);
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar ${nombreArchivo} (${respuesta.status})`);
  }
  return respuesta.json();
}

// La primera vez que se abre la aplicación, copia los datos de ejemplo a localStorage.
// Después siempre se trabaja con lo que haya en localStorage.
async function inicializarDatos() {
  if (localStorage.getItem(CLAVE_USUARIOS) !== null && localStorage.getItem(CLAVE_EXAMENES) !== null) {
    return;
  }
  try {
    const datos = await cargarJSON("datos-iniciales.json");
    if (localStorage.getItem(CLAVE_USUARIOS) === null) guardarLocal(CLAVE_USUARIOS, datos.usuarios);
    if (localStorage.getItem(CLAVE_EXAMENES) === null) guardarLocal(CLAVE_EXAMENES, datos.examenes);
    console.log("Datos iniciales cargados");
  } catch (error) {
    console.error(error.message);
    // Sin el JSON la aplicación igual funciona, pero empieza vacía
    if (localStorage.getItem(CLAVE_USUARIOS) === null) guardarLocal(CLAVE_USUARIOS, []);
    if (localStorage.getItem(CLAVE_EXAMENES) === null) guardarLocal(CLAVE_EXAMENES, []);
  }
}

// ---------- Usuarios y exámenes ----------

function obtenerUsuarios() {
  return leerLocal(CLAVE_USUARIOS, []);
}

function guardarUsuarios(usuarios) {
  guardarLocal(CLAVE_USUARIOS, usuarios);
}

function obtenerExamenes() {
  return leerLocal(CLAVE_EXAMENES, []);
}

function guardarExamenes(examenes) {
  guardarLocal(CLAVE_EXAMENES, examenes);
}

// ---------- Sesión (sessionStorage) ----------
// Se usa sessionStorage para que la sesión se cierre sola al cerrar el navegador.

function obtenerSesion() {
  const texto = sessionStorage.getItem(CLAVE_SESION);
  return texto === null ? null : JSON.parse(texto);
}

function iniciarSesion(usuario) {
  // Nunca se guarda la contraseña en la sesión
  const { identificacion, nombre, email, cargo } = usuario;
  sessionStorage.setItem(CLAVE_SESION, JSON.stringify({ identificacion, nombre, email, cargo }));
}

function cerrarSesion() {
  sessionStorage.removeItem(CLAVE_SESION);
  location.href = `${RUTA_BASE}html/login.html`;
}

// Las páginas privadas llaman esta función al inicio: sin sesión, se va al login.
function protegerPagina() {
  if (obtenerSesion() === null) {
    location.replace(`${RUTA_BASE}html/login.html`);
    return false;
  }
  return true;
}

// ---------- Utilidades ----------

// Muestra un mensaje con la clase exito o fallo
function mostrarMensaje(elemento, texto, tipo) {
  elemento.textContent = texto;
  elemento.classList.remove("exito", "fallo");
  if (tipo) elemento.classList.add(tipo);
}

// Validaciones que se repiten en varios formularios
const EXPRESION_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EXPRESION_TELEFONO = /^\d{7,10}$/;
const EXPRESION_IDENTIFICACION = /^\d{6,12}$/;
