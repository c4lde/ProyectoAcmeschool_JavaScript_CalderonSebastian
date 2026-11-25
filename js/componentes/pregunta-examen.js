// =========================================================
// Web Component <pregunta-examen>
// Muestra UNA pregunta numerada con sus respuestas para elegir una.
// Solo recibe el texto de las respuestas, nunca cuál es la correcta:
// así no se puede descubrir la respuesta inspeccionando la página.
// Evento que emite: "respondida" cuando se elige una respuesta
// Métodos: cargar(pregunta, numero), respuestaElegida(), bloquear()
// =========================================================

const plantillaPreguntaExamen = document.createElement("template");
plantillaPreguntaExamen.innerHTML = `
  <link rel="stylesheet" href="${RUTA_BASE}css/style.css">
  <style>
    :host {
      display: block;
    }
    fieldset {
      border: none;
      display: grid;
      gap: 12px;
    }
    legend {
      font-weight: 600;
      font-size: 1.05rem;
      color: var(--color-titulo);
      margin-bottom: 12px;
    }
    legend span {
      color: var(--color-primario);
      margin-right: 6px;
    }
    #opciones {
      display: grid;
      gap: 10px;
    }
    .opcion {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border: 1px solid var(--color-borde);
      border-radius: var(--radio);
      background: var(--color-campo);
      cursor: pointer;
      font-weight: 400;
      font-size: 1rem;
      transition: border-color var(--transicion), background var(--transicion);
    }
    .opcion:hover {
      border-color: var(--color-acento);
    }
    /* :has() resalta la opción cuyo radio está marcado */
    .opcion:has(input:checked) {
      border-color: var(--color-primario);
      background: var(--color-exito-claro);
    }
    .opcion input {
      width: 20px;
      height: 20px;
      accent-color: var(--color-primario);
      cursor: pointer;
    }
    fieldset:disabled .opcion {
      cursor: not-allowed;
      opacity: 0.7;
    }
  </style>
  <section class="panel">
    <fieldset id="grupo">
      <legend id="enunciado"></legend>
      <div id="opciones"></div>
    </fieldset>
  </section>
`;

class PreguntaExamen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(plantillaPreguntaExamen.content.cloneNode(true));
    this.grupo = this.shadowRoot.getElementById("grupo");
    this.enunciado = this.shadowRoot.getElementById("enunciado");
    this.opciones = this.shadowRoot.getElementById("opciones");
  }

  connectedCallback() {
    this.opciones.addEventListener("change", this.avisarRespuesta);
  }

  disconnectedCallback() {
    this.opciones.removeEventListener("change", this.avisarRespuesta);
  }

  avisarRespuesta = () => {
    this.dispatchEvent(new CustomEvent("respondida", { bubbles: true }));
  };

  // Pinta el enunciado numerado y una opción (label + radio) por respuesta
  cargar(pregunta, numero) {
    const numeroPregunta = document.createElement("span");
    numeroPregunta.textContent = `${numero}.`;
    this.enunciado.replaceChildren(numeroPregunta, pregunta.enunciado);

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

  // Índice de la respuesta elegida, o null si no respondió
  respuestaElegida() {
    const marcada = this.opciones.querySelector("input:checked");
    return marcada === null ? null : Number(marcada.value);
  }

  // Al terminar el examen ya no se pueden cambiar las respuestas
  bloquear() {
    this.grupo.disabled = true;
  }
}

customElements.define("pregunta-examen", PreguntaExamen);
