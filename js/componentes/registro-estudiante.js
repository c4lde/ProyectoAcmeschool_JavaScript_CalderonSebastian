// =========================================================
// Web Component <registro-estudiante>
// Pide el número de identificación y el nombre completo de quien
// va a presentar el examen. A estos datos quedan asociadas las respuestas.
// Eventos que emite: "comenzar-examen" con detail { identificacion, nombre } y "volver"
// Método para la página: preparar(examen)
// =========================================================

const plantillaRegistro = document.createElement("template");
plantillaRegistro.innerHTML = `
  <link rel="stylesheet" href="${RUTA_BASE}css/style.css">
  <style>
    :host {
      display: block;
      max-width: 560px;
      width: 100%;
      /* Se centra con justify-self: la regla * { margin: 0 } de la página le gana a :host */
      justify-self: center;
    }
    form {
      display: grid;
      gap: 16px;
    }
    .resumen {
      list-style: none;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  </style>
  <section class="panel aparecer">
    <div>
      <p class="subtitulo">Vas a presentar</p>
      <h2 id="titulo"></h2>
    </div>
    <ul class="resumen">
      <li class="etiqueta" id="tiempo"></li>
      <li class="etiqueta" id="porcentaje"></li>
      <li class="etiqueta" id="preguntas"></li>
    </ul>
    <p class="subtitulo">Escribe tus datos. El tiempo empieza a correr cuando presiones "Comenzar examen".</p>
    <form id="formulario" novalidate>
      <div class="campo">
        <label for="identificacion">Número de identificación</label>
        <input type="text" id="identificacion" name="identificacion" inputmode="numeric" placeholder="1012345678" autocomplete="off">
        <p id="error-identificacion" class="error"></p>
      </div>
      <div class="campo">
        <label for="nombre">Nombre completo</label>
        <input type="text" id="nombre" name="nombre" placeholder="Ana María Pérez" autocomplete="name">
        <p id="error-nombre" class="error"></p>
      </div>
      <div class="acciones">
        <button type="submit" class="btn btn-primario">Comenzar examen</button>
        <button type="button" id="btnVolver" class="btn btn-secundario">Volver a la lista</button>
      </div>
    </form>
  </section>
`;

// Reglas de validación: cada campo devuelve un mensaje de error o "" si está bien
const REGLAS_ESTUDIANTE = {
  identificacion: (valor) =>
    EXPRESION_IDENTIFICACION.test(valor) ? "" : "Solo números, entre 6 y 12 dígitos.",
  nombre: (valor) =>
    /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]{3,}$/.test(valor) && valor.includes(" ")
      ? "" : "Escribe tu nombre y apellido (solo letras)."
};

class RegistroEstudiante extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(plantillaRegistro.content.cloneNode(true));
    this.formulario = this.shadowRoot.getElementById("formulario");
    this.btnVolver = this.shadowRoot.getElementById("btnVolver");
  }

  connectedCallback() {
    this.formulario.addEventListener("input", this.validarEnVivo);
    this.formulario.addEventListener("submit", this.enviar);
    this.btnVolver.addEventListener("click", this.volver);
  }

  disconnectedCallback() {
    this.formulario.removeEventListener("input", this.validarEnVivo);
    this.formulario.removeEventListener("submit", this.enviar);
    this.btnVolver.removeEventListener("click", this.volver);
  }

  validarCampo(nombreCampo) {
    const input = this.formulario.elements[nombreCampo];
    const error = REGLAS_ESTUDIANTE[nombreCampo](input.value.trim());
    this.shadowRoot.getElementById(`error-${nombreCampo}`).textContent = error;
    input.classList.toggle("incorrecto", error !== "");
    return error === "";
  }

  validarEnVivo = (e) => {
    if (REGLAS_ESTUDIANTE[e.target.name] !== undefined) this.validarCampo(e.target.name);
  };

  enviar = (e) => {
    e.preventDefault();
    const validos = Object.keys(REGLAS_ESTUDIANTE).map((campo) => this.validarCampo(campo));
    if (validos.includes(false)) return;

    this.dispatchEvent(new CustomEvent("comenzar-examen", {
      detail: {
        identificacion: this.formulario.elements.identificacion.value.trim(),
        // Se quitan los espacios repetidos: "ana   pérez" → "ana pérez"
        nombre: this.formulario.elements.nombre.value.trim().replace(/\s+/g, " ")
      },
      bubbles: true
    }));
  };

  volver = () => {
    this.dispatchEvent(new CustomEvent("volver", { bubbles: true }));
  };

  // Muestra el resumen del examen elegido y deja el formulario limpio
  preparar(examen) {
    this.shadowRoot.getElementById("titulo").textContent = examen.titulo;
    this.shadowRoot.getElementById("tiempo").textContent = `${examen.tiempo} min`;
    this.shadowRoot.getElementById("porcentaje").textContent = `Aprueba con ${examen.porcentaje} %`;
    this.shadowRoot.getElementById("preguntas").textContent = `${examen.preguntas.length} preguntas`;
    this.formulario.reset();
    Object.keys(REGLAS_ESTUDIANTE).forEach((campo) => {
      this.shadowRoot.getElementById(`error-${campo}`).textContent = "";
      this.formulario.elements[campo].classList.remove("incorrecto");
    });
  }

  enfocar() {
    this.formulario.elements.identificacion.focus();
  }
}

customElements.define("registro-estudiante", RegistroEstudiante);
