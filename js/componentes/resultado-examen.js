// =========================================================
// Web Component <resultado-examen>
// Muestra el porcentaje de respuestas acertadas y si aprobó o no.
// Evento que emite: "volver-lista"
// Método para la página: mostrar(resultado, examen)
// =========================================================

const plantillaResultado = document.createElement("template");
plantillaResultado.innerHTML = `
  <link rel="stylesheet" href="${RUTA_BASE}css/style.css">
  <style>
    :host {
      display: block;
      max-width: 620px;
      width: 100%;
      /* Se centra con justify-self: la regla * { margin: 0 } de la página le gana a :host */
      justify-self: center;
    }
    .resultado {
      text-align: center;
      justify-items: center;
      border-top: 6px solid var(--color-primario);
    }
    .resultado.reprobado {
      border-top-color: var(--color-peligro);
    }
    /* Círculo con el porcentaje: conic-gradient dibuja el avance */
    .circulo {
      --avance: 0%;
      width: 170px;
      height: 170px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: conic-gradient(var(--color-primario) var(--avance), var(--color-borde) 0);
      animation: aparecer 0.5s ease;
    }
    .reprobado .circulo {
      background: conic-gradient(var(--color-peligro) var(--avance), var(--color-borde) 0);
    }
    .circulo span {
      width: 136px;
      height: 136px;
      border-radius: 50%;
      background: var(--color-superficie);
      display: grid;
      place-items: center;
      font-size: 2.2rem;
      font-weight: 700;
      color: var(--color-titulo);
    }
    #veredicto {
      font-size: 1.6rem;
    }
    .detalle {
      list-style: none;
      display: grid;
      gap: 6px;
      width: 100%;
      text-align: left;
      padding: 12px 0;
      border-top: 1px solid var(--color-borde);
    }
    .detalle li {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      color: var(--color-texto-suave);
    }
    .detalle strong {
      color: var(--color-texto);
      text-align: right;
    }
  </style>
  <section class="panel resultado aparecer" id="caja">
    <p id="motivo" class="subtitulo"></p>
    <div class="circulo" id="circulo"><span id="porcentaje">0 %</span></div>
    <h2 id="veredicto"></h2>
    <p id="mensaje" class="subtitulo"></p>
    <ul class="detalle">
      <li>Estudiante <strong id="estudiante"></strong></li>
      <li>Examen <strong id="examen"></strong></li>
      <li>Respuestas correctas <strong id="aciertos"></strong></li>
      <li>Porcentaje para aprobar <strong id="minimo"></strong></li>
      <li>Tiempo usado <strong id="tiempoUsado"></strong></li>
    </ul>
    <button type="button" id="btnVolver" class="btn btn-primario">Volver a los exámenes</button>
  </section>
`;

class ResultadoExamen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(plantillaResultado.content.cloneNode(true));
    this.btnVolver = this.shadowRoot.getElementById("btnVolver");
  }

  connectedCallback() {
    this.btnVolver.addEventListener("click", this.volver);
  }

  disconnectedCallback() {
    this.btnVolver.removeEventListener("click", this.volver);
  }

  volver = () => {
    this.dispatchEvent(new CustomEvent("volver-lista", { bubbles: true }));
  };

  mostrar(resultado, examen) {
    const raiz = this.shadowRoot;
    const { aprobado, porcentaje, aciertos, total, nombre, identificacion, segundosUsados, finalizadoPor } = resultado;

    raiz.getElementById("caja").classList.toggle("reprobado", !aprobado);
    raiz.getElementById("circulo").style.setProperty("--avance", `${porcentaje}%`);
    raiz.getElementById("porcentaje").textContent = `${porcentaje} %`;
    raiz.getElementById("motivo").textContent = finalizadoPor === "tiempo"
      ? "Se acabó el tiempo: el examen se terminó automáticamente."
      : "Terminaste el examen.";
    raiz.getElementById("veredicto").textContent = aprobado ? "¡Aprobaste!" : "No aprobaste";
    raiz.getElementById("mensaje").textContent = aprobado
      ? `Superaste el ${examen.porcentaje} % requerido. ¡Buen trabajo!`
      : `Necesitabas mínimo el ${examen.porcentaje} %. Repasa los temas e inténtalo de nuevo.`;
    raiz.getElementById("estudiante").textContent = `${nombre} (${identificacion})`;
    raiz.getElementById("examen").textContent = examen.titulo;
    raiz.getElementById("aciertos").textContent = `${aciertos} de ${total}`;
    raiz.getElementById("minimo").textContent = `${examen.porcentaje} %`;

    const minutos = Math.floor(segundosUsados / 60);
    const segundos = segundosUsados % 60;
    raiz.getElementById("tiempoUsado").textContent =
      `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")} de ${examen.tiempo} min`;
  }
}

customElements.define("resultado-examen", ResultadoExamen);
