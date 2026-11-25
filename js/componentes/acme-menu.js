// =========================================================
// Web Component <acme-menu>
// Barra de navegación común. Los enlaces privados solo se
// muestran si hay una sesión iniciada.
// Uso: <acme-menu activo="usuarios"></acme-menu>
// =========================================================

const plantillaMenu = document.createElement("template");
plantillaMenu.innerHTML = `
  <style>
    :host {
      display: block;
    }
    nav {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px 20px;
      padding: 14px 24px;
      background: var(--color-menu);
      border-bottom: 2px solid var(--color-primario);
      color: #fff;
      font-family: var(--fuente);
    }
    .marca {
      font-weight: 700;
      font-size: 1.2rem;
      margin-right: auto;
      opacity: 1;
    }
    .marca span {
      color: var(--color-primario);
    }
    a {
      color: #fff;
      text-decoration: none;
      opacity: 0.85;
      padding: 4px 0;
      border-bottom: 2px solid transparent;
      transition: opacity 0.2s, border-color 0.2s;
    }
    a:hover,
    a.activo {
      opacity: 1;
      border-color: var(--color-primario);
    }
    .marca:hover {
      border-color: transparent;
    }
    /* El contenedor no ocupa espacio: sus hijos se acomodan como hijos del nav */
    #enlaces {
      display: contents;
    }
    .usuario {
      font-size: 0.85rem;
      opacity: 0.85;
    }
    button {
      font: inherit;
      background: var(--color-primario);
      color: var(--color-texto-sobre-primario);
      border: none;
      border-radius: 8px;
      padding: 6px 14px;
      cursor: pointer;
    }
    a:focus-visible,
    button:focus-visible {
      outline: 3px solid var(--color-acento);
      outline-offset: 2px;
    }
    @media (max-width: 600px) {
      nav {
        padding: 12px 16px;
      }
      .marca {
        width: 100%;
      }
    }
  </style>
  <nav aria-label="Menú principal">
    <a class="marca" id="marca">Acme<span>School</span></a>
    <span id="enlaces"></span>
  </nav>
`;

class AcmeMenu extends HTMLElement {
  constructor() {
    super();
    // Shadow DOM: los estilos del menú no chocan con los de la página
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(plantillaMenu.content.cloneNode(true));
    this.botonSalir = null;
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    // Limpieza: se quita el listener cuando el menú sale del DOM
    if (this.botonSalir !== null) {
      this.botonSalir.removeEventListener("click", this.salir);
    }
  }

  // Función flecha para que "this" siga siendo el componente dentro del listener
  salir = () => {
    cerrarSesion();
  };

  crearEnlace(texto, ruta, pagina) {
    const enlace = document.createElement("a");
    enlace.href = `${RUTA_BASE}${ruta}`;
    enlace.textContent = texto;
    if (this.getAttribute("activo") === pagina) {
      enlace.classList.add("activo");
      enlace.setAttribute("aria-current", "page");
    }
    return enlace;
  }

  render() {
    const sesion = obtenerSesion();
    this.shadowRoot.getElementById("marca").href = `${RUTA_BASE}index.html`;

    const elementos = [];
    if (sesion === null) {
      elementos.push(
        this.crearEnlace("Presentar examen", "html/presentar.html", "presentar"),
        this.crearEnlace("Iniciar sesión", "index.html", "login")
      );
    } else {
      const nombreUsuario = document.createElement("span");
      nombreUsuario.className = "usuario";
      // textContent: el nombre se muestra como texto, nunca como HTML
      nombreUsuario.textContent = `${sesion.nombre} · ${sesion.cargo}`;

      this.botonSalir = document.createElement("button");
      this.botonSalir.textContent = "Cerrar sesión";
      this.botonSalir.addEventListener("click", this.salir);

      elementos.push(
        this.crearEnlace("Usuarios", "html/usuarios.html", "usuarios"),
        this.crearEnlace("Exámenes", "html/examenes.html", "examenes"),
        this.crearEnlace("Presentar examen", "html/presentar.html", "presentar"),
        nombreUsuario,
        this.botonSalir
      );
    }

    this.shadowRoot.getElementById("enlaces").replaceChildren(...elementos);
  }
}

customElements.define("acme-menu", AcmeMenu);
