// =========================================================
// Web Component <reloj-examen>
// Cuenta regresiva desde los minutos del examen hasta 0.
// Plantilla: <template id="tpl-reloj-examen"> en html/presentar.html
// Atributo: minutos
// Eventos que emite: "tic" cada segundo (detail { segundosRestantes })
//                    y "tiempo-agotado" cuando llega a 0
// Métodos: iniciar(segundos), detener()   Propiedad: segundosRestantes
// =========================================================

class RelojExamen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // Se clona el <template> de la página dentro del Shadow DOM
    const plantilla = document.getElementById("tpl-reloj-examen");
    this.shadowRoot.appendChild(plantilla.content.cloneNode(true));
    this.caja = this.shadowRoot.getElementById("caja");
    this.textoTiempo = this.shadowRoot.getElementById("tiempo");

    this.intervalo = null;
    this.segundosRestantes = 0;
  }

  static get observedAttributes() {
    return ["minutos"];
  }

  // Al cambiar los minutos (antes de iniciar) se muestra el tiempo completo
  attributeChangedCallback(nombre, valorAnterior, valorNuevo) {
    if (this.intervalo === null) {
      this.segundosRestantes = Number(valorNuevo) * 60;
      this.pintar();
    }
  }

  disconnectedCallback() {
    // Limpieza: si el reloj sale de la página, el intervalo no debe seguir corriendo
    this.detener();
  }

  // Arranca la cuenta. Si recibe segundos, continúa desde ahí (examen recuperado);
  // si no, empieza con los minutos del atributo.
  iniciar(segundos) {
    this.detener();
    this.segundosRestantes = segundos !== undefined
      ? segundos
      : Number(this.getAttribute("minutos")) * 60;
    this.pintar();
    this.intervalo = setInterval(this.tic, 1000);
  }

  detener() {
    if (this.intervalo !== null) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }
  }

  // Función flecha: setInterval la llama sin perder el "this" del componente
  tic = () => {
    this.segundosRestantes--;
    this.pintar();
    this.dispatchEvent(new CustomEvent("tic", {
      detail: { segundosRestantes: this.segundosRestantes },
      bubbles: true
    }));

    if (this.segundosRestantes <= 0) {
      this.detener();
      this.dispatchEvent(new CustomEvent("tiempo-agotado", { bubbles: true }));
    }
  };

  // Muestra mm:ss. En el último minuto el reloj se pone en alerta (rojo).
  pintar() {
    this.textoTiempo.textContent = formatoTiempo(this.segundosRestantes);
    this.caja.classList.toggle("alerta", this.segundosRestantes <= 60 && this.segundosRestantes > 0);
  }
}

customElements.define("reloj-examen", RelojExamen);
