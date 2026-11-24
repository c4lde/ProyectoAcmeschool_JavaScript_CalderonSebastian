// =========================================================
// Acme School · script.js (código común)
// Se carga en TODAS las páginas antes que los componentes
// y que el script de cada página.
// =========================================================

// Claves de localStorage y sessionStorage
const CLAVE_USUARIOS = "acme:usuarios";     // [{ identificacion, nombre, email, telefono, cargo, contrasena }]
const CLAVE_EXAMENES = "acme:examenes";     // [{ codigo, titulo, tiempo, porcentaje, descripcion, preguntas }]
const CLAVE_RESULTADOS = "acme:resultados"; // [{ codigoExamen, identificacion, nombre, respuestas, porcentaje, aprobado, fecha }]
const CLAVE_SESION = "acme:sesion";         // { identificacion, nombre, email, cargo } (sessionStorage)

// Las páginas de la carpeta html/ deben subir un nivel para llegar a la raíz del proyecto
const RUTA_BASE = location.pathname.includes("/html/") ? "../" : "";

// Usuario que se crea si no se puede leer el JSON inicial (por ejemplo, al abrir el
// proyecto con doble clic en lugar de Live Server). Así el login siempre funciona.
const ADMIN_POR_DEFECTO = {
  identificacion: "1000000001",
  nombre: "Administrador Acme",
  email: "admin@acme.edu.co",
  telefono: "3001234567",
  cargo: "Administrativo",
  contrasena: "Admin123"
};

// ---------- localStorage ----------

// Lee un valor de localStorage y lo convierte de JSON. Si no existe o está dañado, devuelve el valor por defecto.
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

// La primera vez que se abre la aplicación copia los datos de ejemplo a localStorage.
// Después siempre se trabaja con lo que haya en localStorage.
async function inicializarDatos() {
  const faltanUsuarios = !Array.isArray(leerLocal(CLAVE_USUARIOS, null));
  const faltanExamenes = !Array.isArray(leerLocal(CLAVE_EXAMENES, null));
  if (!faltanUsuarios && !faltanExamenes) return;

  try {
    const datos = await cargarJSON("datos-iniciales.json");
    if (faltanUsuarios) guardarLocal(CLAVE_USUARIOS, datos.usuarios);
    if (faltanExamenes) guardarLocal(CLAVE_EXAMENES, datos.examenes);
    console.log("Datos iniciales cargados desde json/datos-iniciales.json");
  } catch (error) {
    console.warn(`${error.message}. Se crea solo el administrador por defecto.`);
    if (faltanUsuarios) guardarLocal(CLAVE_USUARIOS, [ADMIN_POR_DEFECTO]);
    if (faltanExamenes) guardarLocal(CLAVE_EXAMENES, []);
  }
}

// ---------- Usuarios, exámenes y resultados ----------
// Si la clave no tiene un arreglo (no existe o está dañada) se devuelve un arreglo vacío.

function leerLista(clave) {
  const lista = leerLocal(clave, []);
  return Array.isArray(lista) ? lista : [];
}

function obtenerUsuarios() {
  return leerLista(CLAVE_USUARIOS);
}

function guardarUsuarios(usuarios) {
  guardarLocal(CLAVE_USUARIOS, usuarios);
}

function obtenerExamenes() {
  return leerLista(CLAVE_EXAMENES);
}

function guardarExamenes(examenes) {
  guardarLocal(CLAVE_EXAMENES, examenes);
}

function obtenerResultados() {
  return leerLista(CLAVE_RESULTADOS);
}

function guardarResultados(resultados) {
  guardarLocal(CLAVE_RESULTADOS, resultados);
}

// ---------- Sesión (sessionStorage) ----------
// Se usa sessionStorage para que la sesión se cierre sola al cerrar el navegador.

function obtenerSesion() {
  const texto = sessionStorage.getItem(CLAVE_SESION);
  if (texto === null) return null;
  try {
    return JSON.parse(texto);
  } catch (error) {
    sessionStorage.removeItem(CLAVE_SESION);
    return null;
  }
}

function iniciarSesion(usuario) {
  // Nunca se guarda la contraseña en la sesión
  const { identificacion, nombre, email, cargo } = usuario;
  sessionStorage.setItem(CLAVE_SESION, JSON.stringify({ identificacion, nombre, email, cargo }));
}

// El login es la entrada de la aplicación: index.html
function cerrarSesion() {
  sessionStorage.removeItem(CLAVE_SESION);
  location.href = `${RUTA_BASE}index.html`;
}

// Las páginas privadas llaman esta función al inicio: sin sesión, se vuelve al login.
// replace() evita que con el botón "Atrás" se regrese a la página privada.
function protegerPagina() {
  if (obtenerSesion() === null) {
    location.replace(`${RUTA_BASE}index.html`);
    return false;
  }
  return true;
}

// ---------- Utilidades ----------

// Validaciones que se repiten en varios formularios
const EXPRESION_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EXPRESION_TELEFONO = /^\d{7,10}$/;
const EXPRESION_IDENTIFICACION = /^\d{6,12}$/;

// Muestra un mensaje con la clase exito o fallo (o lo limpia si el texto es "")
function mostrarMensaje(elemento, texto, tipo) {
  elemento.textContent = texto;
  elemento.classList.remove("exito", "fallo");
  if (tipo) elemento.classList.add(tipo);
}

// Crea un botón con sus clases y su data-accion (se usa en las tablas)
function crearBoton(texto, clases, accion) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = clases;
  boton.dataset.accion = accion;
  boton.textContent = texto;
  return boton;
}

// Crea una celda <td>. data-etiqueta es el título que se ve en celulares (tabla en modo tarjeta)
function crearCelda(texto, etiqueta) {
  const celda = document.createElement("td");
  celda.textContent = texto;
  celda.dataset.etiqueta = etiqueta;
  return celda;
}
