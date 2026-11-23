// =========================================================
// Web Component <acme-menu>
// Barra de navegación común. Los enlaces privados solo se
// muestran si hay una sesión iniciada.
// Uso: <acme-menu activo="usuarios"></acme-menu>
// =========================================================

class AcmeMenu extends HTMLElement {
  constructor() {
    super();
    // Shadow DOM: los estilos del menú no chocan con los de la página
    this.attachShadow({ mode: "open" });
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

  render() {
    const sesion = obtenerSesion();
    const activo = this.getAttribute("activo");

    this.shadowRoot.innerHTML = `
      <style>
        nav {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px 20px;
          padding: 14px 24px;
          background: var(--color-primario);
          color: #fff;
        }
        .marca {
          font-weight: 700;
          font-size: 1.2rem;
          color: #fff;
          text-decoration: none;
          margin-right: auto;
        }
        .marca span {
          color: var(--color-acento);
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
          border-color: var(--color-acento);
        }
        .usuario {
          font-size: 0.85rem;
          opacity: 0.85;
        }
        button {
          font: inherit;
          background: var(--color-acento);
          color: var(--color-texto);
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
      </style>
      <nav>
        <a class="marca" href="${RUTA_BASE}index.html">Acme<span>School</span></a>
        <a href="${RUTA_BASE}index.html" data-pagina="inicio">Exámenes disponibles</a>
        <span id="zonaPrivada"></span>
      </nav>
    `;

    const zonaPrivada = this.shadowRoot.getElementById("zonaPrivada");

    if (sesion === null) {
      const enlaceLogin = document.createElement("a");
      enlaceLogin.href = `${RUTA_BASE}html/login.html`;
      enlaceLogin.dataset.pagina = "login";
      enlaceLogin.textContent = "Iniciar sesión";
      zonaPrivada.replaceWith(enlaceLogin);
    } else {
      const enlaceUsuarios = document.createElement("a");
      enlaceUsuarios.href = `${RUTA_BASE}html/usuarios.html`;
      enlaceUsuarios.dataset.pagina = "usuarios";
      enlaceUsuarios.textContent = "Usuarios";

      const enlaceExamenes = document.createElement("a");
      enlaceExamenes.href = `${RUTA_BASE}html/examenes.html`;
      enlaceExamenes.dataset.pagina = "examenes";
      enlaceExamenes.textContent = "Gestión de exámenes";

      const nombreUsuario = document.createElement("span");
      nombreUsuario.className = "usuario";
      nombreUsuario.textContent = `${sesion.nombre} · ${sesion.cargo}`;

      this.botonSalir = document.createElement("button");
      this.botonSalir.textContent = "Cerrar sesión";
      this.botonSalir.addEventListener("click", this.salir);

      zonaPrivada.replaceWith(enlaceUsuarios, enlaceExamenes, nombreUsuario, this.botonSalir);
    }

    // Marca el enlace de la página actual
    const enlaceActivo = this.shadowRoot.querySelector(`[data-pagina="${activo}"]`);
    if (enlaceActivo !== null) enlaceActivo.classList.add("activo");
  }
}

customElements.define("acme-menu", AcmeMenu);
