// =========================================================
// Web Component <editor-pregunta>
// Edita UNA pregunta: su enunciado y sus respuestas. La respuesta
// correcta se marca con un radio, así solo puede haber una.
// Plantilla: <template id="tpl-editor-pregunta"> en html/examenes.html
// Atributo: numero (se muestra como "Pregunta 1", "Pregunta 2"...)
// Evento que emite: "eliminar-pregunta"
// Métodos: cargar(pregunta), obtenerDatos(), validar()
// =========================================================

const MINIMO_RESPUESTAS = 2;

class EditorPregunta extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // Se clona el <template> de la página dentro del Shadow DOM
    const plantilla = document.getElementById("tpl-editor-pregunta");
    this.shadowRoot.appendChild(plantilla.content.cloneNode(true));

    this.titulo = this.shadowRoot.getElementById("titulo");
    this.enunciado = this.shadowRoot.getElementById("enunciado");
    this.respuestas = this.shadowRoot.getElementById("respuestas");
    this.error = this.shadowRoot.getElementById("error");
    this.btnEliminar = this.shadowRoot.getElementById("btnEliminar");
    this.btnAgregarRespuesta = this.shadowRoot.getElementById("btnAgregarRespuesta");
  }

  static get observedAttributes() {
    return ["numero"];
  }

  // Cuando cambia el atributo numero se actualiza el título
  attributeChangedCallback(nombre, valorAnterior, valorNuevo) {
    this.titulo.textContent = `Pregunta ${valorNuevo}`;
  }

  connectedCallback() {
    // Una pregunta nueva empieza con el mínimo de respuestas vacías
    if (this.respuestas.children.length === 0) {
      for (let i = 0; i < MINIMO_RESPUESTAS; i++) this.agregarRespuesta("", false);
    }
    this.btnEliminar.addEventListener("click", this.pedirEliminar);
    this.btnAgregarRespuesta.addEventListener("click", this.clicAgregar);
    this.respuestas.addEventListener("click", this.clicEnRespuestas);
  }

  disconnectedCallback() {
    this.btnEliminar.removeEventListener("click", this.pedirEliminar);
    this.btnAgregarRespuesta.removeEventListener("click", this.clicAgregar);
    this.respuestas.removeEventListener("click", this.clicEnRespuestas);
  }

  // El formulario decide si la pregunta se puede eliminar (debe quedar al menos una)
  pedirEliminar = () => {
    this.dispatchEvent(new CustomEvent("eliminar-pregunta", { bubbles: true }));
  };

  clicAgregar = () => {
    this.agregarRespuesta("", false);
  };

  // UN solo listener para los botones "Quitar" de todas las respuestas
  clicEnRespuestas = (e) => {
    if (e.target.getAttribute("data-accion") !== "quitar") return;
    // botón → div.respuesta
    e.target.parentElement.remove();
    this.actualizarRespuestas();
  };

  // Crea una fila: radio (¿es la correcta?) + texto de la respuesta + botón Quitar
  agregarRespuesta(descripcion, correcta) {
    const fila = document.createElement("div");
    fila.className = "respuesta";

    const radio = document.createElement("input");
    radio.type = "radio";
    // Todos los radios tienen el mismo name: el navegador solo deja marcar uno.
    // Como cada pregunta tiene su propio Shadow DOM, no se mezclan con los de otras preguntas.
    radio.name = "correcta";
    radio.checked = correcta;

    const texto = document.createElement("input");
    texto.type = "text";
    texto.value = descripcion;

    const btnQuitar = crearBoton("Quitar", "btn btn-secundario btn-pequeno", "quitar");

    fila.append(radio, texto, btnQuitar);
    this.respuestas.append(fila);
    this.actualizarRespuestas();
  }

  // Numera los placeholders y no deja quitar respuestas por debajo del mínimo
  actualizarRespuestas() {
    const filas = [...this.respuestas.children];
    filas.forEach((fila, indice) => {
      const texto = fila.querySelector('input[type="text"]');
      const radio = fila.querySelector('input[type="radio"]');
      texto.placeholder = `Respuesta ${indice + 1}`;
      texto.setAttribute("aria-label", `Respuesta ${indice + 1}`);
      radio.setAttribute("aria-label", `Marcar la respuesta ${indice + 1} como correcta`);
      fila.querySelector('[data-accion="quitar"]').disabled = filas.length <= MINIMO_RESPUESTAS;
    });
  }

  // Llena el editor con una pregunta guardada
  cargar(pregunta) {
    this.enunciado.value = pregunta.enunciado;
    this.respuestas.replaceChildren();
    pregunta.respuestas.forEach((r) => this.agregarRespuesta(r.descripcion, r.correcta));
  }

  // Devuelve la pregunta como objeto, lista para guardarse en JSON
  obtenerDatos() {
    const respuestas = [...this.respuestas.children].map((fila) => ({
      descripcion: fila.querySelector('input[type="text"]').value.trim(),
      correcta: fila.querySelector('input[type="radio"]').checked
    }));
    return { enunciado: this.enunciado.value.trim(), respuestas };
  }

  // Revisa la pregunta y muestra el primer problema que encuentre
  validar() {
    const { enunciado, respuestas } = this.obtenerDatos();
    const vacias = respuestas.filter((r) => r.descripcion === "").length;
    const correctas = respuestas.filter((r) => r.correcta).length;
    let error = "";

    if (enunciado.length < 5) {
      error = "Escribe el enunciado de la pregunta (mínimo 5 caracteres).";
    } else if (respuestas.length < MINIMO_RESPUESTAS) {
      error = `La pregunta debe tener mínimo ${MINIMO_RESPUESTAS} respuestas.`;
    } else if (vacias > 0) {
      error = "Ninguna respuesta puede quedar vacía.";
    } else if (correctas !== 1) {
      error = "Marca cuál es la respuesta correcta.";
    }

    this.error.textContent = error;
    this.enunciado.classList.toggle("incorrecto", enunciado.length < 5);
    return error === "";
  }
}

customElements.define("editor-pregunta", EditorPregunta);
