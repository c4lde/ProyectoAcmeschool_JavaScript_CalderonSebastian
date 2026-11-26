// =========================================================
// Web Component <pregunta-examen>
// Muestra UNA pregunta numerada con sus respuestas para elegir una.
// Solo recibe el texto de las respuestas, nunca cuál es la correcta:
// así no se puede descubrir la respuesta inspeccionando la página.
// Plantilla: <template id="tpl-pregunta-examen"> en html/presentar.html
// Evento que emite: "respondida" cuando se elige una respuesta
// Métodos: cargar(pregunta, numero), respuestaElegida(), marcar(indice), bloquear()
// =========================================================

class PreguntaExamen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // Se clona el <template> de la página dentro del Shadow DOM
    const plantilla = document.getElementById("tpl-pregunta-examen");
    this.shadowRoot.appendChild(plantilla.content.cloneNode(true));
    this.enunciado = this.shadowRoot.getElementById("enunciado");
    this.opciones = this.shadowRoot.getElementById("opciones");
  }

  connectedCallback() {
    this.opciones.addEventListener("change", this.alResponder);
  }

  disconnectedCallback() {
    this.opciones.removeEventListener("change", this.alResponder);
  }

  alResponder = () => {
    this.resaltarElegida();
    this.dispatchEvent(new CustomEvent("respondida", { bubbles: true }));
  };

  // La opción elegida lleva la clase "elegida" (borde y fondo verde)
  resaltarElegida() {
    this.opciones.querySelectorAll("label").forEach((opcion) => {
      opcion.classList.toggle("elegida", opcion.querySelector("input").checked);
    });
  }

  // Pinta el enunciado numerado y una opción (label + radio) por respuesta
  cargar(pregunta, numero) {
    const numeroPregunta = document.createElement("span");
    numeroPregunta.textContent = `${numero}. `;
    const textoPregunta = document.createElement("span");
    textoPregunta.textContent = pregunta.enunciado;
    this.enunciado.replaceChildren(numeroPregunta, textoPregunta);

    const opciones = pregunta.respuestas.map((respuesta, indice) => {
      const opcion = document.createElement("label");
      opcion.className = "opcion";

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "respuesta"; // mismo name: solo se puede elegir una
      radio.value = indice;

      const texto = document.createElement("span");
      texto.textContent = respuesta.descripcion;

      opcion.append(radio, texto);
      return opcion;
    });
    this.opciones.replaceChildren(...opciones);
  }

  // Posición de la respuesta elegida, o null si no respondió
  respuestaElegida() {
    const marcada = this.opciones.querySelector("input:checked");
    return marcada === null ? null : Number(marcada.value);
  }

  // Marca una respuesta (se usa al recuperar un examen en curso)
  marcar(indice) {
    const radio = this.opciones.querySelectorAll("input")[indice];
    if (radio === undefined) return; // esa opción ya no existe
    radio.checked = true;
    this.resaltarElegida();
  }

  // Al terminar el examen ya no se pueden cambiar las respuestas
  bloquear() {
    this.opciones.querySelectorAll("input").forEach((radio) => {
      radio.disabled = true;
    });
    this.opciones.classList.add("bloqueado");
  }
}

customElements.define("pregunta-examen", PreguntaExamen);
