// =========================================================
// Web Component <formulario-usuario>
// Formulario para crear y actualizar usuarios. Valida cada campo.
// Evento que emite: "guardar-usuario" con detail { usuario, identificacionEditando }
// Métodos para la página: editar(usuario), limpiar(), mostrarMensaje(texto, tipo)
// =========================================================

const plantillaFormularioUsuario = document.createElement("template");
plantillaFormularioUsuario.innerHTML = `
  <link rel="stylesheet" href="${RUTA_BASE}css/style.css">
  <style>
    :host {
      display: block;
    }
  </style>
  <section class="panel">
    <h2 id="titulo">Nuevo usuario</h2>
    <form id="formulario" class="formulario" novalidate>
      <div class="campo">
        <label for="identificacion">Número de identificación</label>
        <input type="text" id="identificacion" name="identificacion" inputmode="numeric" placeholder="1012345678">
        <p id="error-identificacion" class="error"></p>
      </div>
      <div class="campo">
        <label for="nombre">Nombre completo</label>
        <input type="text" id="nombre" name="nombre" placeholder="Ana María Pérez">
        <p id="error-nombre" class="error"></p>
      </div>
      <div class="campo">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" placeholder="ana.perez@acme.edu.co">
        <p id="error-email" class="error"></p>
      </div>
      <div class="campo">
        <label for="telefono">Teléfono</label>
        <input type="tel" id="telefono" name="telefono" inputmode="numeric" placeholder="3001234567">
        <p id="error-telefono" class="error"></p>
      </div>
      <div class="campo">
        <label for="cargo">Cargo</label>
        <select id="cargo" name="cargo">
          <option value="">Selecciona un cargo</option>
          <option value="Administrativo">Administrativo</option>
          <option value="Docente">Docente</option>
        </select>
        <p id="error-cargo" class="error"></p>
      </div>
      <div class="campo">
        <label for="contrasena">Contraseña</label>
        <input type="password" id="contrasena" name="contrasena" placeholder="Mínimo 6 caracteres" autocomplete="new-password">
        <p id="error-contrasena" class="error"></p>
      </div>

      <p id="mensaje" class="mensaje campo-completo" role="alert"></p>

      <div class="acciones">
        <button type="submit" id="btnGuardar" class="btn btn-primario">Crear usuario</button>
        <button type="button" id="btnCancelar" class="btn btn-secundario oculto">Cancelar edición</button>
      </div>
    </form>
  </section>
`;

// Reglas de validación: cada campo devuelve un mensaje de error o "" si está bien
const REGLAS_USUARIO = {
  identificacion: (valor) =>
    EXPRESION_IDENTIFICACION.test(valor) ? "" : "Solo números, entre 6 y 12 dígitos.",
  nombre: (valor) =>
    valor.length >= 3 ? "" : "Escribe el nombre completo (mínimo 3 letras).",
  email: (valor) =>
    EXPRESION_CORREO.test(valor) ? "" : "Escribe un correo válido.",
  telefono: (valor) =>
    EXPRESION_TELEFONO.test(valor) ? "" : "Solo números, entre 7 y 10 dígitos.",
  cargo: (valor) =>
    valor === "Administrativo" || valor === "Docente" ? "" : "Elige un cargo.",
  contrasena: (valor) =>
    valor.length >= 6 ? "" : "La contraseña debe tener mínimo 6 caracteres."
};

class FormularioUsuario extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(plantillaFormularioUsuario.content.cloneNode(true));

    this.formulario = this.shadowRoot.getElementById("formulario");
    this.titulo = this.shadowRoot.getElementById("titulo");
    this.mensaje = this.shadowRoot.getElementById("mensaje");
    this.btnGuardar = this.shadowRoot.getElementById("btnGuardar");
    this.btnCancelar = this.shadowRoot.getElementById("btnCancelar");

    // null = modo crear; con valor = identificación del usuario que se está editando
    this.identificacionEditando = null;
  }

  connectedCallback() {
    this.formulario.addEventListener("input", this.validarEnVivo);
    this.formulario.addEventListener("submit", this.enviar);
    this.btnCancelar.addEventListener("click", this.cancelar);
  }

  disconnectedCallback() {
    this.formulario.removeEventListener("input", this.validarEnVivo);
    this.formulario.removeEventListener("submit", this.enviar);
    this.btnCancelar.removeEventListener("click", this.cancelar);
  }

  // Valida un campo con REGLAS_USUARIO, muestra el error debajo y marca el input
  validarCampo(nombreCampo) {
    const input = this.formulario.elements[nombreCampo];
    const error = REGLAS_USUARIO[nombreCampo](input.value.trim());
    this.shadowRoot.getElementById(`error-${nombreCampo}`).textContent = error;
    input.classList.toggle("incorrecto", error !== "");
    return error === "";
  }

  // UN solo listener para todo el formulario: el evento input burbujea desde cada campo
  validarEnVivo = (e) => {
    if (REGLAS_USUARIO[e.target.name] !== undefined) this.validarCampo(e.target.name);
  };

  enviar = (e) => {
    e.preventDefault();

    // map (y no every) para que se muestren los errores de TODOS los campos a la vez
    const errores = Object.keys(REGLAS_USUARIO)
      .map((campo) => this.validarCampo(campo))
      .filter((valido) => !valido).length;

    if (errores > 0) {
      this.mostrarMensaje(`Revisa el formulario: hay ${errores} campo(s) con error.`, "fallo");
      return;
    }

    const datos = new FormData(this.formulario);
    const usuario = {
      // El input deshabilitado no viaja en FormData, por eso en edición se usa la identificación guardada
      identificacion: this.identificacionEditando !== null
        ? this.identificacionEditando
        : datos.get("identificacion").trim(),
      nombre: datos.get("nombre").trim(),
      email: datos.get("email").trim().toLowerCase(),
      telefono: datos.get("telefono").trim(),
      cargo: datos.get("cargo"),
      contrasena: datos.get("contrasena")
    };

    this.dispatchEvent(new CustomEvent("guardar-usuario", {
      detail: { usuario, identificacionEditando: this.identificacionEditando },
      bubbles: true
    }));
  };

  cancelar = () => {
    this.limpiar();
    this.dispatchEvent(new CustomEvent("cancelar-edicion", { bubbles: true }));
  };

  // Llena el formulario con un usuario y lo pasa a modo editar
  editar(usuario) {
    const { identificacion, nombre, email, telefono, cargo, contrasena } = usuario;
    const campos = this.formulario.elements;
    campos.identificacion.value = identificacion;
    campos.nombre.value = nombre;
    campos.email.value = email;
    campos.telefono.value = telefono;
    campos.cargo.value = cargo;
    campos.contrasena.value = contrasena;

    this.identificacionEditando = identificacion;
    campos.identificacion.disabled = true; // la identificación es la llave, no se cambia
    this.titulo.textContent = `Editando a ${nombre}`;
    this.btnGuardar.textContent = "Guardar cambios";
    this.btnCancelar.classList.remove("oculto");
    this.limpiarErrores();
    this.mostrarMensaje("", "");
    this.scrollIntoView({ behavior: "smooth" });
    campos.nombre.focus();
  }

  // Deja el formulario vacío y en modo crear
  limpiar() {
    this.formulario.reset();
    this.identificacionEditando = null;
    this.formulario.elements.identificacion.disabled = false;
    this.titulo.textContent = "Nuevo usuario";
    this.btnGuardar.textContent = "Crear usuario";
    this.btnCancelar.classList.add("oculto");
    this.limpiarErrores();
  }

  limpiarErrores() {
    Object.keys(REGLAS_USUARIO).forEach((campo) => {
      this.shadowRoot.getElementById(`error-${campo}`).textContent = "";
      this.formulario.elements[campo].classList.remove("incorrecto");
    });
  }

  mostrarMensaje(texto, tipo) {
    mostrarMensaje(this.mensaje, texto, tipo);
  }
}

customElements.define("formulario-usuario", FormularioUsuario);
