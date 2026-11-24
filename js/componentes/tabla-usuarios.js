// =========================================================
// Web Component <tabla-usuarios>
// Muestra los usuarios registrados con botones Editar y Eliminar.
// Eventos que emite: "editar-usuario" y "eliminar-usuario" con detail { identificacion }
// Método para la página: renderizar(usuarios, identificacionEditando)
// =========================================================

const plantillaTablaUsuarios = document.createElement("template");
plantillaTablaUsuarios.innerHTML = `
  <link rel="stylesheet" href="${RUTA_BASE}css/style.css">
  <style>
    :host {
      display: block;
    }
  </style>
  <section class="panel">
    <div class="encabezado-pagina">
      <h2>Usuarios registrados</h2>
      <p id="resumen" class="subtitulo"></p>
    </div>
    <div class="contenedor-tabla">
      <table>
        <thead>
          <tr>
            <th>Identificación</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Cargo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="cuerpo"></tbody>
      </table>
    </div>
  </section>
`;

class TablaUsuarios extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(plantillaTablaUsuarios.content.cloneNode(true));
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
    const accion = e.target.dataset.accion;
    if (accion === undefined) return; // el clic no fue en un botón

    const identificacion = e.target.closest("tr").dataset.id;
    this.dispatchEvent(new CustomEvent(`${accion}-usuario`, {
      detail: { identificacion },
      bubbles: true
    }));
  };

  // Pinta una fila por usuario. La fila del usuario en edición se resalta.
  renderizar(usuarios, identificacionEditando) {
    const filas = usuarios.map((usuario) => {
      const fila = document.createElement("tr");
      fila.dataset.id = usuario.identificacion;
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
