// =========================================================
// Web Component <formulario-login>
// Pide correo y contraseña y valida el formato.
// No revisa si el usuario existe: eso lo hace la página.
// Plantilla: <template id="tpl-formulario-login"> en index.html
// Evento que emite: "login-enviar" con detail { email, contrasena }
// =========================================================

class FormularioLogin extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // Se clona el <template> de la página dentro del Shadow DOM
    const plantilla = document.getElementById("tpl-formulario-login");
    this.shadowRoot.appendChild(plantilla.content.cloneNode(true));

    this.formulario = this.shadowRoot.getElementById("formulario");
    this.mensaje = this.shadowRoot.getElementById("mensaje");
    this.btnIngresar = this.shadowRoot.getElementById("btnIngresar");
  }

  connectedCallback() {
    this.formulario.addEventListener("submit", this.enviar);
  }

  disconnectedCallback() {
    this.formulario.removeEventListener("submit", this.enviar);
  }

  // Muestra el error de un campo y marca el input en rojo
  marcarCampo(nombreCampo, error) {
    this.shadowRoot.getElementById(`error-${nombreCampo}`).textContent = error;
    this.shadowRoot.getElementById(nombreCampo).classList.toggle("incorrecto", error !== "");
  }

  enviar = (e) => {
    e.preventDefault();
    const email = this.shadowRoot.getElementById("email").value.trim().toLowerCase();
    const contrasena = this.shadowRoot.getElementById("contrasena").value;

    const errorEmail = EXPRESION_CORREO.test(email) ? "" : "Escribe un correo válido.";
    const errorContrasena = contrasena === "" ? "Escribe tu contraseña." : "";
    this.marcarCampo("email", errorEmail);
    this.marcarCampo("contrasena", errorContrasena);
    if (errorEmail !== "" || errorContrasena !== "") return;

    // Se avisa a la página con un evento personalizado
    this.dispatchEvent(new CustomEvent("login-enviar", {
      detail: { email, contrasena },
      bubbles: true
    }));
  };

  // La página llama este método para mostrar el resultado
  mostrarMensaje(texto, tipo) {
    mostrarMensaje(this.mensaje, texto, tipo);
  }

  bloquear() {
    this.btnIngresar.disabled = true;
    this.btnIngresar.textContent = "Ingresando...";
  }
}

customElements.define("formulario-login", FormularioLogin);
