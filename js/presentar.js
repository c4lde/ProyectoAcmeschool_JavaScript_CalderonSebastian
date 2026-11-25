// =========================================================
// Presentar examen (página PÚBLICA: no pide iniciar sesión)
// Flujo: lista de exámenes → datos del estudiante → examen con
// reloj → resultado. Cada paso es una "vista" que se muestra u oculta.
// =========================================================

const vistaLista = document.getElementById("vistaLista");
const listaExamenes = document.getElementById("listaExamenes");
const sinExamenes = document.getElementById("sinExamenes");
const registroEstudiante = document.getElementById("registroEstudiante");
const vistaExamen = document.getElementById("vistaExamen");
const tituloExamen = document.getElementById("tituloExamen");
const estudianteExamen = document.getElementById("estudianteExamen");
const totalPreguntas = document.getElementById("totalPreguntas");
const porcentajeAprobar = document.getElementById("porcentajeAprobar");
const progresoRespuestas = document.getElementById("progresoRespuestas");
const reloj = document.getElementById("reloj");
const formExamen = document.getElementById("formExamen");
const contenedorPreguntas = document.getElementById("contenedorPreguntas");
const mensajeExamen = document.getElementById("mensajeExamen");
const btnTerminar = document.getElementById("btnTerminar");
const resultadoExamen = document.getElementById("resultadoExamen");

let examenActual = null;     // examen que se está presentando
let estudiante = null;       // { identificacion, nombre }
let preguntas = [];          // los <pregunta-examen> en pantalla
let examenTerminado = false; // evita calificar dos veces (botón y reloj al mismo tiempo)
let confirmarTerminar = false;

// Si alguien entra primero a esta página, también se cargan los datos iniciales
const datosListos = inicializarDatos();

// Muestra una sola vista y oculta las demás
function mostrarVista(vista) {
  [vistaLista, registroEstudiante, vistaExamen, resultadoExamen].forEach((elemento) => {
    elemento.classList.toggle("oculto", elemento !== vista);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// R1: Lista de exámenes disponibles con título, tiempo y porcentaje para aprobar.
async function mostrarLista() {
  await datosListos;
  const examenes = obtenerExamenes();

  const tarjetas = examenes.map((examen) => {
    const tarjeta = document.createElement("tarjeta-examen");
    tarjeta.setAttribute("codigo", examen.codigo);
    tarjeta.setAttribute("titulo", examen.titulo);
    tarjeta.setAttribute("descripcion", examen.descripcion);
    tarjeta.setAttribute("tiempo", examen.tiempo);
    tarjeta.setAttribute("porcentaje", examen.porcentaje);
    tarjeta.setAttribute("preguntas", examen.preguntas.length);
    return tarjeta;
  });

  listaExamenes.replaceChildren(...tarjetas);
  sinExamenes.classList.toggle("oculto", examenes.length > 0);
  mostrarVista(vistaLista);
}

// R2: Al elegir un examen se piden la identificación y el nombre.
listaExamenes.addEventListener("elegir-examen", (e) => {
  examenActual = obtenerExamenes().find((examen) => examen.codigo === e.detail.codigo);
  if (examenActual === undefined) {
    mostrarLista(); // el examen fue eliminado mientras tanto
    return;
  }
  registroEstudiante.preparar(examenActual);
  mostrarVista(registroEstudiante);
  registroEstudiante.enfocar();
});

registroEstudiante.addEventListener("volver", mostrarLista);

registroEstudiante.addEventListener("comenzar-examen", (e) => {
  estudiante = e.detail;
  iniciarExamen();
});

// R3: Encabezado (título, total de preguntas, % para aprobar), preguntas numeradas y reloj.
function iniciarExamen() {
  examenTerminado = false;
  confirmarTerminar = false;

  tituloExamen.textContent = examenActual.titulo;
  estudianteExamen.textContent = `${estudiante.nombre} · ID ${estudiante.identificacion}`;
  totalPreguntas.textContent = examenActual.preguntas.length;
  porcentajeAprobar.textContent = `${examenActual.porcentaje} %`;

  preguntas = examenActual.preguntas.map((pregunta, indice) => {
    const elemento = document.createElement("pregunta-examen");
    // Solo se envía el texto de las respuestas, no cuál es la correcta
    elemento.cargar({
      enunciado: pregunta.enunciado,
      respuestas: pregunta.respuestas.map((r) => ({ descripcion: r.descripcion }))
    }, indice + 1);
    return elemento;
  });
  contenedorPreguntas.replaceChildren(...preguntas);

  actualizarProgreso();
  mostrarMensaje(mensajeExamen, "", "");
  btnTerminar.disabled = false;
  btnTerminar.textContent = "Terminar";
  mostrarVista(vistaExamen);

  // R4: El reloj empieza en los minutos del examen y baja hasta 0.
  reloj.setAttribute("minutos", examenActual.tiempo);
  reloj.iniciar();
  console.log(`Examen iniciado: ${examenActual.codigo} por ${estudiante.nombre}`);
}

function contarRespondidas() {
  return preguntas.filter((pregunta) => pregunta.respuestaElegida() !== null).length;
}

function actualizarProgreso() {
  progresoRespuestas.textContent = `${contarRespondidas()} de ${preguntas.length}`;
}

// Cada <pregunta-examen> avisa cuando se responde (el evento burbujea hasta el contenedor)
contenedorPreguntas.addEventListener("respondida", () => {
  actualizarProgreso();
  // Si estaba pidiendo confirmación y responde otra pregunta, se reinicia la confirmación
  if (confirmarTerminar) {
    confirmarTerminar = false;
    btnTerminar.textContent = "Terminar";
    mostrarMensaje(mensajeExamen, "", "");
  }
});

// R5: Botón Terminar por si acaba antes del tiempo. Si faltan preguntas pide confirmar
//     con un segundo clic (no se usa confirm() porque congelaría el reloj).
formExamen.addEventListener("submit", (e) => {
  e.preventDefault();
  const sinResponder = preguntas.length - contarRespondidas();

  if (sinResponder > 0 && !confirmarTerminar) {
    confirmarTerminar = true;
    btnTerminar.textContent = "Sí, terminar de todas formas";
    mostrarMensaje(mensajeExamen, `Tienes ${sinResponder} pregunta(s) sin responder. Presiona de nuevo para terminar.`, "fallo");
    return;
  }
  finalizarExamen("estudiante");
});

// R6: Si el reloj llega a 0, el examen se termina solo.
reloj.addEventListener("tiempo-agotado", () => {
  finalizarExamen("tiempo");
});

// R7: Califica, guarda el resultado asociado al estudiante y muestra el porcentaje y si aprobó.
function finalizarExamen(finalizadoPor) {
  if (examenTerminado) return;
  examenTerminado = true;

  reloj.detener();
  btnTerminar.disabled = true;
  preguntas.forEach((pregunta) => pregunta.bloquear());

  const respuestas = preguntas.map((pregunta) => pregunta.respuestaElegida());
  const aciertos = examenActual.preguntas.filter((pregunta, indice) =>
    respuestas[indice] !== null && pregunta.respuestas[respuestas[indice]].correcta
  ).length;
  const total = examenActual.preguntas.length;
  const porcentaje = Math.round((aciertos / total) * 100);

  const resultado = {
    codigoExamen: examenActual.codigo,
    tituloExamen: examenActual.titulo,
    identificacion: estudiante.identificacion,
    nombre: estudiante.nombre,
    respuestas,                       // índice elegido en cada pregunta (null = sin responder)
    aciertos,
    total,
    porcentaje,
    aprobado: (aciertos / total) * 100 >= examenActual.porcentaje,
    segundosUsados: examenActual.tiempo * 60 - reloj.segundosRestantes,
    finalizadoPor,                    // "estudiante" o "tiempo"
    fecha: new Date().toISOString()
  };

  guardarResultados([...obtenerResultados(), resultado]);
  console.log(`Resultado: ${resultado.nombre} → ${porcentaje} % (${resultado.aprobado ? "aprobó" : "no aprobó"})`);

  resultadoExamen.mostrar(resultado, examenActual);
  mostrarVista(resultadoExamen);
}

resultadoExamen.addEventListener("volver-lista", mostrarLista);

mostrarLista();
