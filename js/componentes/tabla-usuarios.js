// =========================================================
// Web Component <tabla-usuarios>
// Muestra los usuarios registrados con botones Editar y Eliminar.
// Plantilla: <template id="tpl-tabla-usuarios"> en html/usuarios.html
// Eventos que emite: "editar-usuario" y "eliminar-usuario" con detail { identificacion }
// Método para la página: renderizar(usuarios, identificacionEditando)
// =========================================================

class TablaUsuarios extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // Se clona el <template> de la página dentro del Shadow DOM
    const plantilla = document.getElementById("tpl-tabla-usuarios");
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

  // UN solo listener para todos los botones (delegación de eventos):
  // se lee data-accion del botón y se sube hasta la fila para saber qué usuario es.
  clicEnTabla = (e) => {
    const boton = e.target;
    const accion = boton.getAttribute("data-accion");
    if (accion === null) return; // el clic no fue en un botón

    // Eliminar pide un segundo clic para confirmar
    if (accion === "eliminar" && !confirmarConDobleClic(boton)) return;

    // botón → div.celda-acciones → td → tr
    const fila = boton.parentElement.parentElement.parentElement;
    this.dispatchEvent(new CustomEvent(`${accion}-usuario`, {
      detail: { identificacion: fila.getAttribute("data-id") },
      bubbles: true
    }));
  };

  // Pinta una fila por usuario. La fila del usuario en edición se resalta.
  renderizar(usuarios, identificacionEditando) {
    const filas = usuarios.map((usuario) => {
      const fila = document.createElement("tr");
      fila.setAttribute("data-id", usuario.identificacion);
      fila.classList.toggle("editando", usuario.identificacion === identificacionEditando);

      const celdaCargo = crearCelda("", "Cargo");
      const etiqueta = document.createElement("span");
      etiqueta.className = usuario.cargo === "Docente" ? "etiqueta etiqueta-docente" : "etiqueta";
      etiqueta.textContent = usuario.cargo;
      celdaCargo.append(etiqueta);

      const celdaAcciones = crearCelda("", "Acciones");
      const botones = document.createElement("div");
      botones.className = "celda-acciones";
      botones.append(
        crearBoton("Editar", "btn btn-secundario btn-pequeno", "editar"),
        crearBoton("Eliminar", "btn btn-peligro btn-pequeno", "eliminar")
      );
      celdaAcciones.append(botones);

      fila.append(
        crearCelda(usuario.identificacion, "Identificación"),
        crearCelda(usuario.nombre, "Nombre"),
        crearCelda(usuario.email, "Email"),
        crearCelda(usuario.telefono, "Teléfono"),
        celdaCargo,
        celdaAcciones
      );
      return fila;
    });

    if (filas.length === 0) {
      const fila = document.createElement("tr");
      const celda = document.createElement("td");
      celda.colSpan = 6;
      celda.className = "vacio";
      celda.textContent = "No hay usuarios registrados.";
      fila.append(celda);
      filas.push(fila);
    }

    this.cuerpo.replaceChildren(...filas);

    const docentes = usuarios.filter((u) => u.cargo === "Docente").length;
    this.resumen.textContent = `Total: ${usuarios.length} | Docentes: ${docentes} | Administrativos: ${usuarios.length - docentes}`;
  }
}

customElements.define("tabla-usuarios", TablaUsuarios);
