// =========================================================
// Web Component <reloj-examen>
// Cuenta regresiva desde los minutos del examen hasta 0.
// Atributo: minutos
// Evento que emite: "tiempo-agotado" cuando llega a 0
// Métodos: iniciar(), detener()   Propiedad: segundosRestantes
// =========================================================

const plantillaReloj = document.createElement("template");
plantillaReloj.innerHTML = `
  <style>
    :host {
      display: block;
    }
    .reloj {
      display: grid;
      justify-items: center;
      gap: 2px;
      padding: 10px 18px;
      border-radius: var(--radio);
      border: 2px solid var(--color-primario);
      background: var(--color-campo);
      font-family: var(--fuente);
      transition: border-color 0.3s, background 0.3s;
    }
    .etiqueta {
      font-size: 0.75rem;
      color: var(--color-texto-suave);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    #tiempo {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--color-primario);
      /* Todos los números ocupan el mismo ancho: el reloj no "salta" */
      font-variant-numeric: tabular-nums;
    }
    /* Último minuto: el reloj se pone rojo y late */
    .reloj.alerta {
      border-color: var(--color-peligro);
      background: var(--color-peligro-claro);
      animation: latir 1s ease-in-out infinite;
    }
    .reloj.alerta #tiempo {
      color: var(--color-peligro);
    }
    @media (max-width: 700px) {
      .reloj {
        padding: 6px 12px;
      }
      #tiempo {
        font-size: 1.3rem;
      }
      .etiqueta {
        font-size: 0.65rem;
      }
    }
    @keyframes latir {
      50% {
        transform: scale(1.04);
      }
    }
  </style>
  <div class="reloj" role="timer" aria-label="Tiempo restante">
    <span class="etiqueta">Tiempo restante</span>
    <span id="tiempo">00:00</span>
  </div>
`;

class RelojExamen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(plantillaReloj.content.cloneNode(true));
    this.caja = this.shadowRoot.querySelector(".reloj");
    this.textoTiempo = this.shadowRoot.getElementById("tiempo");

    this.intervalo = null;
    this.fin = 0;               // momento (en milisegundos) en que se acaba el tiempo
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

  iniciar() {
    this.detener();
    const minutos = Number(this.getAttribute("minutos"));
    // Se guarda la hora de fin y en cada tic se calcula cuánto falta.
    // Así el reloj no se atrasa aunque el navegador demore algún tic.
    this.fin = Date.now() + minutos * 60 * 1000;
    this.caja.classList.remove("alerta");
    this.tic();
    this.intervalo = setInterval(this.tic, 250);
  }

  detener() {
    if (this.intervalo !== null) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }
  }

  // Función flecha: setInterval la llama sin perder el "this" del componente
  tic = () => {
    this.segundosRestantes = Math.max(0, Math.ceil((this.fin - Date.now()) / 1000));
    this.pintar();
    this.caja.classList.toggle("alerta", this.segundosRestantes <= 60 && this.segundosRestantes > 0);

    if (this.segundosRestantes === 0) {
      this.detener();
      this.dispatchEvent(new CustomEvent("tiempo-agotado", { bubbles: true }));
    }
  };

  // Formato mm:ss con padStart (5 minutos y 3 segundos → "05:03")
  pintar() {
    const minutos = Math.floor(this.segundosRestantes / 60);
    const segundos = this.segundosRestantes % 60;
    this.textoTiempo.textContent = `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
  }
}

customElements.define("reloj-examen", RelojExamen);
