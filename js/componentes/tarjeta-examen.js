// =========================================================
// Web Component <tarjeta-examen>
// Muestra un examen disponible en la lista pública.
// Atributos: codigo, titulo, descripcion, tiempo, porcentaje, preguntas
// Evento que emite: "elegir-examen" con detail { codigo }
// =========================================================

const plantillaTarjetaExamen = document.createElement("template");
plantillaTarjetaExamen.innerHTML = `
  <link rel="stylesheet" href="${RUTA_BASE}css/style.css">
  <style>
    :host {
      display: block;
    }
    .tarjeta {
      height: 100%;
      grid-template-rows: auto auto 1fr auto auto;
      transition: transform var(--transicion), border-color var(--transicion);
    }
    .tarjeta:hover {
      transform: translateY(-4px);
      border-color: var(--color-primario);
    }
    .datos {
      list-style: none;
      display: grid;
      gap: 6px;
      padding: 12px 0;
      border-top: 1px solid var(--color-borde);
    }
    .datos li {
      display: flex;
      justify-content: space-between;
      color: var(--color-texto-suave);
    }
    .datos strong {
      color: var(--color-texto);
    }
  </style>
  <article class="panel tarjeta">
    <span><span id="codigo" class="etiqueta"></span></span>
    <h2 id="titulo"></h2>
    <p id="descripcion" class="subtitulo"></p>
    <ul class="datos">
      <li>Tiempo para resolverlo <strong id="tiempo"></strong></li>
      <li>Porcentaje para aprobar <strong id="porcentaje"></strong></li>
      <li>Preguntas <strong id="preguntas"></strong></li>
    </ul>
    <button type="button" id="btnPresentar" class="btn btn-primario">Presentar examen</button>
  </article>
`;

class TarjetaExamen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(plantillaTarjetaExamen.content.cloneNode(true));
    this.btnPresentar = this.shadowRoot.getElementById("btnPresentar");
  }

  static get observedAttributes() {
    return ["codigo", "titulo", "descripcion", "tiempo", "porcentaje", "preguntas"];
  }

  // Cada atributo se muestra en el elemento con el mismo id (con su unidad si la tiene)
  attributeChangedCallback(nombre, valorAnterior, valorNuevo) {
    const unidades = { tiempo: " min", porcentaje: " %" };
    const sufijo = unidades[nombre] !== undefined ? unidades[nombre] : "";
    this.shadowRoot.getElementById(nombre).textContent = `${valorNuevo}${sufijo}`;
    if (nombre === "titulo") this.btnPresentar.setAttribute("aria-label", `Presentar el examen ${valorNuevo}`);
  }

  connectedCallback() {
    this.btnPresentar.addEventListener("click", this.elegir);
  }

  disconnectedCallback() {
    this.btnPresentar.removeEventListener("click", this.elegir);
  }

  elegir = () => {
    this.dispatchEvent(new CustomEvent("elegir-examen", {
      detail: { codigo: this.getAttribute("codigo") },
      bubbles: true
    }));
  };
}

customElements.define("tarjeta-examen", TarjetaExamen);
