// =========================================================
// Web Component <registro-estudiante>
// Pide el número de identificación y el nombre completo de quien
// va a presentar el examen. A estos datos quedan asociadas las respuestas.
// Plantilla: <template id="tpl-registro-estudiante"> en html/presentar.html
// Eventos que emite: "comenzar-examen" con detail { identificacion, nombre } y "volver"
// Método para la página: preparar(examen)
// =========================================================

// Reglas de validación: cada campo devuelve un mensaje de error o "" si está bien
const REGLAS_ESTUDIANTE = {
  identificacion: (valor) =>
    EXPRESION_IDENTIFICACION.test(valor) ? "" : "Solo números, entre 6 y 12 dígitos.",
  // Solo letras y espacios, con al menos un espacio (nombre y apellido)
  nombre: (valor) =>
    /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+( [A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)+$/.test(valor)
      ? "" : "Escribe tu nombre y apellido (solo letras)."
};

class RegistroEstudiante extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // Se clona el <template> de la página dentro del Shadow DOM
    const plantilla = document.getElementById("tpl-registro-estudiante");
    this.shadowRoot.appendChild(plantilla.content.cloneNode(true));
    this.formulario = this.shadowRoot.getElementById("formulario");
    this.btnVolver = this.shadowRoot.getElementById("btnVolver");
  }

  connectedCallback() {
    this.formulario.addEventListener("input", this.validarEnVivo);
    this.formulario.addEventListener("submit", this.enviar);
    this.btnVolver.addEventListener("click", this.volver);
  }

  disconnectedCallback() {
    this.formulario.removeEventListener("input", this.validarEnVivo);
    this.formulario.removeEventListener("submit", this.enviar);
    this.btnVolver.removeEventListener("click", this.volver);
  }

  // Valor del campo sin espacios al inicio ni al final, y sin espacios repetidos
  // ("  ana   pérez " → "ana pérez")
  valor(nombreCampo) {
    return this.shadowRoot.getElementById(nombreCampo).value.trim().replace(/\s+/g, " ");
  }

  validarCampo(nombreCampo) {
    const error = REGLAS_ESTUDIANTE[nombreCampo](this.valor(nombreCampo));
    this.shadowRoot.getElementById(`error-${nombreCampo}`).textContent = error;
    this.shadowRoot.getElementById(nombreCampo).classList.toggle("incorrecto", error !== "");
    return error === "";
  }

  validarEnVivo = (e) => {
    if (REGLAS_ESTUDIANTE[e.target.id] !== undefined) this.validarCampo(e.target.id);
  };

  enviar = (e) => {
    e.preventDefault();
    let errores = 0;
    for (const nombreCampo in REGLAS_ESTUDIANTE) {
      if (!this.validarCampo(nombreCampo)) errores++;
    }
    if (errores > 0) return;

    this.dispatchEvent(new CustomEvent("comenzar-examen", {
      detail: { identificacion: this.valor("identificacion"), nombre: this.valor("nombre") },
      bubbles: true
    }));
  };

  volver = () => {
    this.dispatchEvent(new CustomEvent("volver", { bubbles: true }));
  };

  // Muestra el resumen del examen elegido y deja el formulario limpio
  preparar(examen) {
    this.shadowRoot.getElementById("titulo").textContent = examen.titulo;
    this.shadowRoot.getElementById("tiempo").textContent = `${examen.tiempo} min`;
    this.shadowRoot.getElementById("porcentaje").textContent = `Aprueba con ${examen.porcentaje} %`;
    this.shadowRoot.getElementById("preguntas").textContent = `${examen.preguntas.length} preguntas`;
    limpiarCampos(this.formulario);
    for (const nombreCampo in REGLAS_ESTUDIANTE) {
      this.shadowRoot.getElementById(`error-${nombreCampo}`).textContent = "";
      this.shadowRoot.getElementById(nombreCampo).classList.remove("incorrecto");
    }
  }
}

customElements.define("registro-estudiante", RegistroEstudiante);
