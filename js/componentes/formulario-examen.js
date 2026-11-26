// =========================================================
// Web Component <formulario-examen>
// Formulario para crear y actualizar exámenes con sus preguntas.
// Cada pregunta es un <editor-pregunta>.
// Plantilla: <template id="tpl-formulario-examen"> en html/examenes.html
// Evento que emite: "guardar-examen" con detail { examen, codigoEditando }
// Métodos para la página: editar(examen), limpiar(), mostrarMensaje(texto, tipo)
// =========================================================

// Reglas de validación: cada campo devuelve un mensaje de error o "" si está bien
const REGLAS_EXAMEN = {
  codigo: (valor) =>
    /^[A-Z0-9-]{3,12}$/.test(valor.toUpperCase()) ? "" : "Entre 3 y 12 caracteres: letras, números o guion.",
  titulo: (valor) =>
    valor.length >= 3 ? "" : "Escribe el título (mínimo 3 caracteres).",
  // /^\d+$/ exige solo dígitos (un número entero); después se revisa el rango
  tiempo: (valor) =>
    /^\d+$/.test(valor) && Number(valor) >= 1 && Number(valor) <= 180 ? "" : "Minutos enteros entre 1 y 180.",
  porcentaje: (valor) =>
    /^\d+$/.test(valor) && Number(valor) >= 1 && Number(valor) <= 100 ? "" : "Número entero entre 1 y 100.",
  descripcion: (valor) =>
    valor.length >= 10 ? "" : "Describe el examen (mínimo 10 caracteres)."
};

class FormularioExamen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // Se clona el <template> de la página dentro del Shadow DOM
    const plantilla = document.getElementById("tpl-formulario-examen");
    this.shadowRoot.appendChild(plantilla.content.cloneNode(true));

    this.formulario = this.shadowRoot.getElementById("formulario");
    this.titulo = this.shadowRoot.getElementById("tituloFormulario");
    this.preguntas = this.shadowRoot.getElementById("preguntas");
    this.contadorPreguntas = this.shadowRoot.getElementById("contadorPreguntas");
    this.mensaje = this.shadowRoot.getElementById("mensaje");
    this.btnGuardar = this.shadowRoot.getElementById("btnGuardar");
    this.btnCancelar = this.shadowRoot.getElementById("btnCancelar");
    this.btnAgregarPregunta = this.shadowRoot.getElementById("btnAgregarPregunta");

    // null = modo crear; con valor = código del examen que se está editando
    this.codigoEditando = null;
  }

  connectedCallback() {
    if (this.preguntas.children.length === 0) this.agregarPregunta();
    this.formulario.addEventListener("input", this.validarEnVivo);
    this.formulario.addEventListener("submit", this.enviar);
    this.btnCancelar.addEventListener("click", this.cancelar);
    this.btnAgregarPregunta.addEventListener("click", this.clicAgregarPregunta);
    this.preguntas.addEventListener("eliminar-pregunta", this.eliminarPregunta);
  }

  disconnectedCallback() {
    this.formulario.removeEventListener("input", this.validarEnVivo);
    this.formulario.removeEventListener("submit", this.enviar);
    this.btnCancelar.removeEventListener("click", this.cancelar);
    this.btnAgregarPregunta.removeEventListener("click", this.clicAgregarPregunta);
    this.preguntas.removeEventListener("eliminar-pregunta", this.eliminarPregunta);
  }

  // Devuelve el campo del formulario (cada input tiene como id el nombre del dato)
  campo(nombreCampo) {
    return this.shadowRoot.getElementById(nombreCampo);
  }

  // ---------- Preguntas ----------

  // Agrega un <editor-pregunta>; si recibe una pregunta guardada, la carga
  agregarPregunta(pregunta) {
    const editor = document.createElement("editor-pregunta");
    if (pregunta !== undefined) editor.cargar(pregunta);
    this.preguntas.append(editor);
    this.numerarPreguntas();
  }

  clicAgregarPregunta = () => {
    this.agregarPregunta();
  };

  // El evento "eliminar-pregunta" sube desde el editor; e.target es la pregunta a quitar
  eliminarPregunta = (e) => {
    if (this.preguntas.children.length === 1) {
      this.mostrarMensaje("El examen debe tener al menos una pregunta.", "fallo");
      return;
    }
    e.target.remove();
    this.numerarPreguntas();
  };

  // Cambia el atributo numero de cada editor (attributeChangedCallback actualiza el título)
  numerarPreguntas() {
    const editores = [...this.preguntas.children];
    editores.forEach((editor, indice) => editor.setAttribute("numero", indice + 1));
    this.contadorPreguntas.textContent = `Preguntas (${editores.length})`;
  }

  // ---------- Validación ----------

  validarCampo(nombreCampo) {
    const input = this.campo(nombreCampo);
    const error = REGLAS_EXAMEN[nombreCampo](input.value.trim());
    this.shadowRoot.getElementById(`error-${nombreCampo}`).textContent = error;
    input.classList.toggle("incorrecto", error !== "");
    return error === "";
  }

  // UN solo listener para todo el formulario (el evento input burbujea)
  validarEnVivo = (e) => {
    if (REGLAS_EXAMEN[e.target.id] !== undefined) this.validarCampo(e.target.id);
  };

  enviar = (e) => {
    e.preventDefault();

    // Se validan TODOS los campos y TODAS las preguntas para mostrar todos los errores
    let erroresCampos = 0;
    for (const nombreCampo in REGLAS_EXAMEN) {
      if (!this.validarCampo(nombreCampo)) erroresCampos++;
    }
    const editores = [...this.preguntas.children];
    const erroresPreguntas = editores
      .map((editor) => editor.validar())
      .filter((valida) => !valida).length;

    if (erroresCampos + erroresPreguntas > 0) {
      this.mostrarMensaje(
        `Revisa el formulario: ${erroresCampos} campo(s) y ${erroresPreguntas} pregunta(s) con error.`,
        "fallo"
      );
      return;
    }

    const examen = {
      // En edición el código no cambia (el input está deshabilitado)
      codigo: this.codigoEditando !== null
        ? this.codigoEditando
        : this.campo("codigo").value.trim().toUpperCase(),
      titulo: this.campo("titulo").value.trim(),
      tiempo: Number(this.campo("tiempo").value),
      porcentaje: Number(this.campo("porcentaje").value),
      descripcion: this.campo("descripcion").value.trim(),
      preguntas: editores.map((editor) => editor.obtenerDatos())
    };

    this.dispatchEvent(new CustomEvent("guardar-examen", {
      detail: { examen, codigoEditando: this.codigoEditando },
      bubbles: true
    }));
  };

  cancelar = () => {
    this.limpiar();
    this.dispatchEvent(new CustomEvent("cancelar-edicion", { bubbles: true }));
  };

  // ---------- Métodos para la página ----------

  // Llena el formulario con un examen y lo pasa a modo editar
  editar(examen) {
    const { codigo, titulo, tiempo, porcentaje, descripcion, preguntas } = examen;
    this.campo("codigo").value = codigo;
    this.campo("titulo").value = titulo;
    this.campo("tiempo").value = tiempo;
    this.campo("porcentaje").value = porcentaje;
    this.campo("descripcion").value = descripcion;

    this.preguntas.replaceChildren();
    preguntas.forEach((pregunta) => this.agregarPregunta(pregunta));

    this.codigoEditando = codigo;
    this.campo("codigo").disabled = true; // el código es la llave, no se cambia
    this.titulo.textContent = `Editando: ${titulo}`;
    this.btnGuardar.textContent = "Guardar cambios";
    this.btnCancelar.classList.remove("oculto");
    this.limpiarErrores();
    this.mostrarMensaje("", "");
  }

  // Deja el formulario vacío, con una pregunta en blanco y en modo crear
  limpiar() {
    limpiarCampos(this.formulario);
    this.codigoEditando = null;
    this.campo("codigo").disabled = false;
    this.titulo.textContent = "Nuevo examen";
    this.btnGuardar.textContent = "Crear examen";
    this.btnCancelar.classList.add("oculto");
    this.preguntas.replaceChildren();
    this.agregarPregunta();
    this.limpiarErrores();
  }

  limpiarErrores() {
    for (const nombreCampo in REGLAS_EXAMEN) {
      this.shadowRoot.getElementById(`error-${nombreCampo}`).textContent = "";
      this.campo(nombreCampo).classList.remove("incorrecto");
    }
  }

  mostrarMensaje(texto, tipo) {
    mostrarMensaje(this.mensaje, texto, tipo);
  }
}

customElements.define("formulario-examen", FormularioExamen);
