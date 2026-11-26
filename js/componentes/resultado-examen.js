// =========================================================
// Web Component <resultado-examen>
// Muestra el porcentaje de respuestas acertadas y si aprobó o no.
// Plantilla: <template id="tpl-resultado-examen"> en html/presentar.html
// Evento que emite: "volver-lista"
// Método para la página: mostrar(resultado, examen)
// =========================================================

class ResultadoExamen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // Se clona el <template> de la página dentro del Shadow DOM
    const plantilla = document.getElementById("tpl-resultado-examen");
    this.shadowRoot.appendChild(plantilla.content.cloneNode(true));
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

  // Escribe un texto en el elemento con ese id
  escribir(id, texto) {
    this.shadowRoot.getElementById(id).textContent = texto;
  }

  mostrar(resultado, examen) {
    const { aprobado, porcentaje, aciertos, total, nombre, identificacion, segundosUsados, finalizadoPor } = resultado;

    this.shadowRoot.getElementById("caja").classList.toggle("reprobado", !aprobado);
    // La barra se llena según el porcentaje obtenido
    this.shadowRoot.getElementById("relleno").style.width = `${porcentaje}%`;

    this.escribir("porcentaje", `${porcentaje} %`);
    this.escribir("motivo", finalizadoPor === "tiempo"
      ? "Se acabó el tiempo: el examen se terminó automáticamente."
      : "Terminaste el examen.");
    this.escribir("veredicto", aprobado ? "¡Aprobaste!" : "No aprobaste");
    this.escribir("mensaje", aprobado
      ? `Alcanzaste el ${examen.porcentaje} % requerido. ¡Buen trabajo!`
      : `Necesitabas mínimo el ${examen.porcentaje} %. Repasa los temas e inténtalo de nuevo.`);
    this.escribir("estudiante", `${nombre} (${identificacion})`);
    this.escribir("examen", examen.titulo);
    this.escribir("aciertos", `${aciertos} de ${total}`);
    this.escribir("minimo", `${examen.porcentaje} %`);
    this.escribir("tiempoUsado", `${formatoTiempo(segundosUsados)} de ${examen.tiempo} min`);
  }
}

customElements.define("resultado-examen", ResultadoExamen);
