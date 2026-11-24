// =========================================================
// Gestión de exámenes (página privada)
// Une los componentes <formulario-examen> y <tabla-examenes>
// con los datos guardados en localStorage.
// =========================================================

// R1: Solo usuarios autenticados. Sin sesión, se vuelve al login.
protegerPagina();

const formularioExamen = document.getElementById("formularioExamen");
const tablaExamenes = document.getElementById("tablaExamenes");

let examenes = obtenerExamenes();

// R2: Mostrar los exámenes registrados en la tabla.
function actualizarTabla() {
  tablaExamenes.renderizar(examenes, formularioExamen.codigoEditando);
}

// R3: Crear o actualizar. El formulario ya validó los campos y las preguntas;
//     aquí se revisa que el código no se repita y se guarda en localStorage.
formularioExamen.addEventListener("guardar-examen", (e) => {
  const { examen, codigoEditando } = e.detail;

  if (codigoEditando === null && examenes.some((ex) => ex.codigo === examen.codigo)) {
    formularioExamen.mostrarMensaje("Ya existe un examen con ese código.", "fallo");
    return;
  }

  if (codigoEditando === null) {
    examenes.push(examen);
    console.log("Examen creado:", examen.codigo);
  } else {
    const indice = examenes.findIndex((ex) => ex.codigo === codigoEditando);
    examenes[indice] = examen;
    console.log("Examen actualizado:", examen.codigo);
  }

  guardarExamenes(examenes);
  formularioExamen.limpiar();
  formularioExamen.mostrarMensaje(
    `Examen "${examen.titulo}" ${codigoEditando === null ? "creado" : "actualizado"} con ${examen.preguntas.length} pregunta(s).`,
    "exito"
  );
  actualizarTabla();
});

// R4: Editar: la tabla avisa qué examen se eligió y el formulario se llena con sus datos y preguntas.
tablaExamenes.addEventListener("editar-examen", (e) => {
  const examen = examenes.find((ex) => ex.codigo === e.detail.codigo);
  formularioExamen.editar(examen);
  actualizarTabla();
});

// R5: Eliminar, con confirmación.
tablaExamenes.addEventListener("eliminar-examen", (e) => {
  const { codigo } = e.detail;
  const examen = examenes.find((ex) => ex.codigo === codigo);
  if (!confirm(`¿Eliminar el examen "${examen.titulo}"? Esta acción no se puede deshacer.`)) return;

  examenes = examenes.filter((ex) => ex.codigo !== codigo);
  guardarExamenes(examenes);
  if (formularioExamen.codigoEditando === codigo) formularioExamen.limpiar();
  formularioExamen.mostrarMensaje(`Examen "${examen.titulo}" eliminado.`, "exito");
  console.log("Examen eliminado:", codigo);
  actualizarTabla();
});

// Al cancelar la edición se quita el resaltado de la fila
formularioExamen.addEventListener("cancelar-edicion", () => {
  formularioExamen.mostrarMensaje("", "");
  actualizarTabla();
});

actualizarTabla();
