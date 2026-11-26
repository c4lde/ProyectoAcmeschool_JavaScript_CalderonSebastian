// =========================================================
// Web Component <tarjeta-examen>
// Muestra un examen disponible en la lista pública.
// Plantilla: <template id="tpl-tarjeta-examen"> en html/presentar.html
// Atributos: codigo, titulo, descripcion, tiempo, porcentaje, preguntas
// Evento que emite: "elegir-examen" con detail { codigo }
// =========================================================

class TarjetaExamen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // Se clona el <template> de la página dentro del Shadow DOM
    const plantilla = document.getElementById("tpl-tarjeta-examen");
    this.shadowRoot.appendChild(plantilla.content.cloneNode(true));
    this.btnPresentar = this.shadowRoot.getElementById("btnPresentar");
  }

  static get observedAttributes() {
    return ["codigo", "titulo", "descripcion", "tiempo", "porcentaje", "preguntas"];
  }

  // Cada atributo se muestra en el elemento con el mismo id (con su unidad si la tiene)
  attributeChangedCallback(nombre, valorAnterior, valorNuevo) {
    let texto = valorNuevo;
    if (nombre === "tiempo") texto = `${valorNuevo} min`;
    if (nombre === "porcentaje") texto = `${valorNuevo} %`;
    this.shadowRoot.getElementById(nombre).textContent = texto;
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
