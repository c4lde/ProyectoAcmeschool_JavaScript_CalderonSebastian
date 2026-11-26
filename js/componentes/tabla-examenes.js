// =========================================================
// Web Component <tabla-examenes>
// Muestra los exámenes registrados con botones Editar y Eliminar.
// Plantilla: <template id="tpl-tabla-examenes"> en html/examenes.html
// Eventos que emite: "editar-examen" y "eliminar-examen" con detail { codigo }
// Método para la página: renderizar(examenes, codigoEditando)
// =========================================================

class TablaExamenes extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // Se clona el <template> de la página dentro del Shadow DOM
    const plantilla = document.getElementById("tpl-tabla-examenes");
    this.shadowRoot.appendChild(plantilla.content.cloneNode(true));
    this.cuerpo = this.shadowRoot.getElementById("cuerpo");
    this.resumen = this.shadowRoot.getElementById("resumen");
  }

  connectedCallback() {
    this.cuerpo.addEventListener("click", this.clicEnTabla);
  }

  disconnectedCallback() {
    this.cuerpo.removeEventListener("click", this.clicEnTabla);
  }

  // UN solo listener para todos los botones (delegación de eventos)
  clicEnTabla = (e) => {
    const boton = e.target;
    const accion = boton.getAttribute("data-accion");
    if (accion === null) return;

    // Eliminar pide un segundo clic para confirmar
    if (accion === "eliminar" && !confirmarConDobleClic(boton)) return;

    // botón → div.celda-acciones → td → tr
    const fila = boton.parentElement.parentElement.parentElement;
    this.dispatchEvent(new CustomEvent(`${accion}-examen`, {
      detail: { codigo: fila.getAttribute("data-id") },
      bubbles: true
    }));
  };

  // Pinta una fila por examen. La fila del examen en edición se resalta.
  renderizar(examenes, codigoEditando) {
    const filas = examenes.map((examen) => {
      const fila = document.createElement("tr");
      fila.setAttribute("data-id", examen.codigo);
      fila.classList.toggle("editando", examen.codigo === codigoEditando);

      const celdaCodigo = crearCelda("", "Código");
      const etiqueta = document.createElement("span");
      etiqueta.className = "etiqueta";
      etiqueta.textContent = examen.codigo;
      celdaCodigo.append(etiqueta);

      const celdaAcciones = crearCelda("", "Acciones");
      const botones = document.createElement("div");
      botones.className = "celda-acciones";
      botones.append(
        crearBoton("Editar", "btn btn-secundario btn-pequeno", "editar"),
        crearBoton("Eliminar", "btn btn-peligro btn-pequeno", "eliminar")
      );
      celdaAcciones.append(botones);

      fila.append(
        celdaCodigo,
        crearCelda(examen.titulo, "Título"),
        crearCelda(`${examen.tiempo} min`, "Tiempo"),
        crearCelda(`${examen.porcentaje} %`, "Aprobación"),
        crearCelda(examen.preguntas.length, "Preguntas"),
        celdaAcciones
      );
      return fila;
    });

    if (filas.length === 0) {
      const fila = document.createElement("tr");
      const celda = document.createElement("td");
      celda.colSpan = 6;
      celda.className = "vacio";
      celda.textContent = "No hay exámenes registrados.";
      fila.append(celda);
      filas.push(fila);
    }

    this.cuerpo.replaceChildren(...filas);

    const totalPreguntas = examenes.reduce((suma, examen) => suma + examen.preguntas.length, 0);
    this.resumen.textContent = `Exámenes: ${examenes.length} | Preguntas en total: ${totalPreguntas}`;
  }
}

customElements.define("tabla-examenes", TablaExamenes);
