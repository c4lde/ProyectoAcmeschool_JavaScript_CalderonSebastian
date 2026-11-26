// =========================================================
// Web Component <formulario-usuario>
// Formulario para crear y actualizar usuarios. Valida cada campo.
// Plantilla: <template id="tpl-formulario-usuario"> en html/usuarios.html
// Evento que emite: "guardar-usuario" con detail { usuario, identificacionEditando }
// Métodos para la página: editar(usuario), limpiar(), mostrarMensaje(texto, tipo)
// =========================================================

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
    // Se clona el <template> de la página dentro del Shadow DOM
    const plantilla = document.getElementById("tpl-formulario-usuario");
    this.shadowRoot.appendChild(plantilla.content.cloneNode(true));

    this.formulario = this.shadowRoot.getElementById("formulario");
    this.titulo = this.shadowRoot.getElementById("tituloFormulario");
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

  // Devuelve el campo del formulario (cada input tiene como id el nombre del dato)
  campo(nombreCampo) {
    return this.shadowRoot.getElementById(nombreCampo);
  }

  // Valida un campo con REGLAS_USUARIO, muestra el error debajo y marca el input
  validarCampo(nombreCampo) {
    const input = this.campo(nombreCampo);
    const error = REGLAS_USUARIO[nombreCampo](input.value.trim());
    this.shadowRoot.getElementById(`error-${nombreCampo}`).textContent = error;
    input.classList.toggle("incorrecto", error !== "");
    return error === "";
  }

  // UN solo listener para todo el formulario: el evento input burbujea desde cada campo
  validarEnVivo = (e) => {
    if (REGLAS_USUARIO[e.target.id] !== undefined) this.validarCampo(e.target.id);
  };

  enviar = (e) => {
    e.preventDefault();

    // Se validan TODOS los campos (sin detenerse en el primero) para mostrar todos los errores
    let errores = 0;
    for (const nombreCampo in REGLAS_USUARIO) {
      if (!this.validarCampo(nombreCampo)) errores++;
    }
    if (errores > 0) {
      this.mostrarMensaje(`Revisa el formulario: hay ${errores} campo(s) con error.`, "fallo");
      return;
    }

    const usuario = {
      // En edición la identificación no cambia (el input está deshabilitado)
      identificacion: this.identificacionEditando !== null
        ? this.identificacionEditando
        : this.campo("identificacion").value.trim(),
      nombre: this.campo("nombre").value.trim(),
      email: this.campo("email").value.trim().toLowerCase(),
      telefono: this.campo("telefono").value.trim(),
      cargo: this.campo("cargo").value,
      contrasena: this.campo("contrasena").value
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
    this.campo("identificacion").value = identificacion;
    this.campo("nombre").value = nombre;
    this.campo("email").value = email;
    this.campo("telefono").value = telefono;
    this.campo("cargo").value = cargo;
    this.campo("contrasena").value = contrasena;

    this.identificacionEditando = identificacion;
    this.campo("identificacion").disabled = true; // la identificación es la llave, no se cambia
    this.titulo.textContent = `Editando a ${nombre}`;
    this.btnGuardar.textContent = "Guardar cambios";
    this.btnCancelar.classList.remove("oculto");
    this.limpiarErrores();
    this.mostrarMensaje("", "");
  }

  // Deja el formulario vacío y en modo crear
  limpiar() {
    limpiarCampos(this.formulario);
    this.identificacionEditando = null;
    this.campo("identificacion").disabled = false;
    this.titulo.textContent = "Nuevo usuario";
    this.btnGuardar.textContent = "Crear usuario";
    this.btnCancelar.classList.add("oculto");
    this.limpiarErrores();
  }

  limpiarErrores() {
    for (const nombreCampo in REGLAS_USUARIO) {
      this.shadowRoot.getElementById(`error-${nombreCampo}`).textContent = "";
      this.campo(nombreCampo).classList.remove("incorrecto");
    }
  }

  mostrarMensaje(texto, tipo) {
    mostrarMensaje(this.mensaje, texto, tipo);
  }
}

customElements.define("formulario-usuario", FormularioUsuario);
