// =========================================================
// Web Component <formulario-examen>
// Formulario para crear y actualizar exámenes con sus preguntas.
// Cada pregunta es un <editor-pregunta>.
// Evento que emite: "guardar-examen" con detail { examen, codigoEditando }
// Métodos para la página: editar(examen), limpiar(), mostrarMensaje(texto, tipo)
// =========================================================

const plantillaFormularioExamen = document.createElement("template");
plantillaFormularioExamen.innerHTML = `
  <link rel="stylesheet" href="${RUTA_BASE}css/style.css">
  <style>
    :host {
      display: block;
    }
    .seccion-preguntas {
      display: grid;
      gap: 16px;
      grid-column: 1 / -1;
      padding-top: 8px;
      border-top: 1px solid var(--color-borde);
    }
    #preguntas {
      display: grid;
      gap: 16px;
    }
  </style>
  <section class="panel">
    <h2 id="titulo">Nuevo examen</h2>
    <form id="formulario" class="formulario" novalidate>
      <div class="campo">
        <label for="codigo">Código</label>
        <input type="text" id="codigo" name="codigo" placeholder="JS-002">
        <p id="error-codigo" class="error"></p>
      </div>
      <div class="campo">
        <label for="titulo-examen">Título</label>
        <input type="text" id="titulo-examen" name="titulo" placeholder="Arreglos y objetos">
        <p id="error-titulo" class="error"></p>
      </div>
      <div class="campo">
        <label for="tiempo">Tiempo (minutos)</label>
        <input type="number" id="tiempo" name="tiempo" min="1" max="180" placeholder="30">
        <p id="error-tiempo" class="error"></p>
      </div>
      <div class="campo">
        <label for="porcentaje">Porcentaje de aprobación (%)</label>
        <input type="number" id="porcentaje" name="porcentaje" min="1" max="100" placeholder="60">
        <p id="error-porcentaje" class="error"></p>
      </div>
      <div class="campo campo-completo">
        <label for="descripcion">Descripción del examen</label>
        <textarea id="descripcion" name="descripcion" rows="2" placeholder="Temas que evalúa el examen"></textarea>
        <p id="error-descripcion" class="error"></p>
      </div>

      <div class="seccion-preguntas">
        <div class="encabezado-pagina">
          <h3 id="contadorPreguntas">Preguntas</h3>
          <button type="button" id="btnAgregarPregunta" class="btn btn-acento btn-pequeno">+ Agregar pregunta</button>
        </div>
        <div id="preguntas"></div>
      </div>

      <p id="mensaje" class="mensaje campo-completo" role="alert"></p>

      <div class="acciones">
        <button type="submit" id="btnGuardar" class="btn btn-primario">Crear examen</button>
        <button type="button" id="btnCancelar" class="btn btn-secundario oculto">Cancelar edición</button>
      </div>
    </form>
  </section>
`;

// Reglas de validación: cada campo devuelve un mensaje de error o "" si está bien
const REGLAS_EXAMEN = {
  codigo: (valor) =>
    /^[A-Z0-9-]{3,12}$/.test(valor.toUpperCase()) ? "" : "Entre 3 y 12 caracteres: letras, números o guion.",
  titulo: (valor) =>
    valor.length >= 3 ? "" : "Escribe el título (mínimo 3 caracteres).",
  tiempo: (valor) =>
    Number.isInteger(Number(valor)) && Number(valor) >= 1 && Number(valor) <= 180 && valor !== ""
      ? "" : "Minutos enteros entre 1 y 180.",
  porcentaje: (valor) =>
    Number.isInteger(Number(valor)) && Number(valor) >= 1 && Number(valor) <= 100 && valor !== ""
      ? "" : "Número entero entre 1 y 100.",
  descripcion: (valor) =>
    valor.length >= 10 ? "" : "Describe el examen (mínimo 10 caracteres)."
};

class FormularioExamen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(plantillaFormularioExamen.content.cloneNode(true));

    this.formulario = this.shadowRoot.getElementById("formulario");
    this.titulo = this.shadowRoot.getElementById("titulo");
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

  // ---------- Preguntas ----------

  // Agrega un <editor-pregunta>; si recibe una pregunta guardada, la carga
  agregarPregunta(pregunta) {
    const editor = document.createElement("editor-pregunta");
    if (pregunta !== undefined) editor.cargar(pregunta);
    this.preguntas.append(editor);
    this.numerarPreguntas();
    return editor;
  }

  clicAgregarPregunta = () => {
    const editor = this.agregarPregunta();
    editor.scrollIntoView({ behavior: "smooth", block: "center" });
    editor.shadowRoot.getElementById("enunciado").focus();
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
    const input = this.formulario.elements[nombreCampo];
    const error = REGLAS_EXAMEN[nombreCampo](input.value.trim());
    this.shadowRoot.getElementById(`error-${nombreCampo}`).textContent = error;
    input.classList.toggle("incorrecto", error !== "");
    return error === "";
  }

  // UN solo listener para todo el formulario (el evento input burbujea)
  validarEnVivo = (e) => {
    if (REGLAS_EXAMEN[e.target.name] !== undefined) this.validarCampo(e.target.name);
  };

  enviar = (e) => {
    e.preventDefault();

    // Se validan TODOS los campos y TODAS las preguntas para mostrar todos los errores
    const erroresCampos = Object.keys(REGLAS_EXAMEN)
      .map((campo) => this.validarCampo(campo))
      .filter((valido) => !valido).length;
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

    const datos = new FormData(this.formulario);
    const examen = {
      // El input deshabilitado no viaja en FormData, por eso en edición se usa el código guardado
      codigo: this.codigoEditando !== null
        ? this.codigoEditando
        : datos.get("codigo").trim().toUpperCase(),
      titulo: datos.get("titulo").trim(),
      tiempo: Number(datos.get("tiempo")),
      porcentaje: Number(datos.get("porcentaje")),
      descripcion: datos.get("descripcion").trim(),
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
    const campos = this.formulario.elements;
    campos.codigo.value = codigo;
    campos.titulo.value = titulo;
    campos.tiempo.value = tiempo;
    campos.porcentaje.value = porcentaje;
    campos.descripcion.value = descripcion;

    this.preguntas.replaceChildren();
    preguntas.forEach((pregunta) => this.agregarPregunta(pregunta));

    this.codigoEditando = codigo;
    campos.codigo.disabled = true; // el código es la llave, no se cambia
    this.titulo.textContent = `Editando: ${titulo}`;
    this.btnGuardar.textContent = "Guardar cambios";
    this.btnCancelar.classList.remove("oculto");
    this.limpiarErrores();
    this.mostrarMensaje("", "");
    this.scrollIntoView({ behavior: "smooth" });
    campos.titulo.focus();
  }

  // Deja el formulario vacío, con una pregunta en blanco y en modo crear
  limpiar() {
    this.formulario.reset();
    this.codigoEditando = null;
    this.formulario.elements.codigo.disabled = false;
    this.titulo.textContent = "Nuevo examen";
    this.btnGuardar.textContent = "Crear examen";
    this.btnCancelar.classList.add("oculto");
    this.preguntas.replaceChildren();
    this.agregarPregunta();
    this.limpiarErrores();
  }

  limpiarErrores() {
    Object.keys(REGLAS_EXAMEN).forEach((campo) => {
      this.shadowRoot.getElementById(`error-${campo}`).textContent = "";
      this.formulario.elements[campo].classList.remove("incorrecto");
    });
  }

  mostrarMensaje(texto, tipo) {
    mostrarMensaje(this.mensaje, texto, tipo);
  }
}

customElements.define("formulario-examen", FormularioExamen);
