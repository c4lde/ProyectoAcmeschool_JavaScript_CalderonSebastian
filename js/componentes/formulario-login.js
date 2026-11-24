// =========================================================
// Web Component <formulario-login>
// Pide correo y contraseña y valida el formato.
// No revisa si el usuario existe: eso lo hace la página.
// Evento que emite: "login-enviar" con detail { email, contrasena }
// =========================================================

const plantillaLogin = document.createElement("template");
plantillaLogin.innerHTML = `
  <link rel="stylesheet" href="${RUTA_BASE}css/style.css">
  <style>
    :host {
      display: block;
    }
    form {
      display: grid;
      gap: 16px;
    }
  </style>
  <section class="panel">
    <div>
      <h2>Iniciar sesión</h2>
      <p class="subtitulo">Acceso para administrativos y docentes.</p>
    </div>
    <form id="formulario" novalidate>
      <div class="campo">
        <label for="email">Correo electrónico</label>
        <input type="email" id="email" name="email" placeholder="usuario@acme.edu.co" autocomplete="username">
        <p id="error-email" class="error"></p>
      </div>
      <div class="campo">
        <label for="contrasena">Contraseña</label>
        <input type="password" id="contrasena" name="contrasena" placeholder="Tu contraseña" autocomplete="current-password">
        <p id="error-contrasena" class="error"></p>
      </div>
      <p id="mensaje" class="mensaje" role="alert"></p>
      <button type="submit" id="btnIngresar" class="btn btn-primario">Ingresar</button>
    </form>
  </section>
`;

class FormularioLogin extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(plantillaLogin.content.cloneNode(true));
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
    this.formulario.elements[nombreCampo].classList.toggle("incorrecto", error !== "");
  }

  enviar = (e) => {
    e.preventDefault();
    const email = this.formulario.elements.email.value.trim().toLowerCase();
    const contrasena = this.formulario.elements.contrasena.value;

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
