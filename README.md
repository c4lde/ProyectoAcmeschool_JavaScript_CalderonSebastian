# Plataforma de exámenes · Acme School

Aplicación web para que la escuela Acme administre usuarios y exámenes, y para que los estudiantes presenten exámenes en línea con tiempo límite.

Está hecha con **HTML, CSS y JavaScript puro** (sin frameworks). Usa **Web Components** (Custom Elements, Shadow DOM y Templates), y los datos se guardan en **localStorage** con formato **JSON**.

**Autor:** Sebastian Calderon

---

## Cómo ejecutar el proyecto

1. Abre la carpeta del proyecto en VS Code.
2. Clic derecho en `index.html` → **Open with Live Server**.
3. Inicia sesión con el usuario administrador de prueba:

| Correo | Contraseña | Cargo |
|---|---|---|
| `admin@acme.edu.co` | `Admin123` | Administrativo |
| `kevin.jimenez@acme.edu.co` | `Docente123` | Docente |

### Datos de prueba incluidos

La primera vez que se abre la aplicación se cargan automáticamente:

| Examen | Tiempo | Preguntas | Para qué sirve |
|---|---|---|---|
| WEB-001 · Repaso rápido: eventos y Web Components | **1 minuto** | 4 | Ver que el reloj llega a 0 y el examen termina solo |
| JS-001 · Fundamentos de JavaScript | 5 min | 3 | Examen normal |
| DOM-001 · Manipulación del DOM | 10 min | 3 | Examen normal |
| ARR-001 · Arreglos y objetos | 8 min | 4 | Examen normal |
| ASY-001 · Asincronía y promesas | 10 min | 4 | Examen normal |

Cada pregunta tiene una sola respuesta correcta. Los datos guardados se pueden ver en **DevTools → Application → Local Storage**.

> La primera vez, los datos de ejemplo se cargan desde `json/datos-iniciales.json` con `fetch`. Si el proyecto se abre sin Live Server (doble clic), el `fetch` falla y se crea solo el administrador por defecto, así que el login siempre funciona.
>
> Para volver a los datos de ejemplo, escribe en la consola del navegador: `localStorage.clear()`.

---

## Módulos

### 1. Login (`index.html`) — entrada de la aplicación
- Inicio de sesión con **correo y contraseña**.
- Valida el formato del correo y que la contraseña no esté vacía.
- Si los datos no coinciden, muestra *"Correo o contraseña incorrectos"* sin decir cuál de los dos falló.
- La sesión se guarda en **sessionStorage** (se cierra al cerrar el navegador) y **nunca guarda la contraseña**.
- Desde aquí también hay un acceso al módulo público para presentar exámenes.

### 2. Gestión de usuarios (`html/usuarios.html`) — privado
- **Tabla** con los usuarios registrados, **formulario** para crear y actualizar, y botones **Editar** y **Eliminar**.
- Datos: número de identificación, nombre completo, email, teléfono, cargo (Administrativo o Docente) y contraseña.
- Validaciones en vivo; no permite identificaciones ni correos repetidos.
- La identificación no se puede cambiar al editar, porque es la llave del usuario.
- Para eliminar se pide un segundo clic de confirmación ("¿Seguro?").
- No permite eliminar el usuario con el que se inició sesión.

### 3. Gestión de exámenes (`html/examenes.html`) — privado
- **Tabla** con los exámenes registrados, **formulario** para crear y actualizar, y botones **Editar** y **Eliminar**.
- Datos: código, título, tiempo (minutos), porcentaje de aprobación y descripción.
- Dentro de cada examen se crean **preguntas**, cada una con **respuestas** (descripción y si es la correcta).
- **Cada pregunta solo puede tener una respuesta correcta.** Se marca con un radio y, como cada pregunta tiene su propio Shadow DOM, los radios de una pregunta no se mezclan con los de otra.
- Validaciones: código único, mínimo una pregunta, mínimo dos respuestas por pregunta, ninguna vacía y una marcada como correcta.

### 4. Presentar examen (`html/presentar.html`) — público
1. Lista de **exámenes disponibles** con título, tiempo para resolverlo y porcentaje para aprobar.
2. Al elegir uno, pide **número de identificación y nombre completo**.
3. Muestra un **encabezado** con el título, el total de preguntas y el porcentaje para aprobar, y debajo las **preguntas numeradas**, donde solo se puede elegir una respuesta.
4. Un **reloj** muestra el tiempo restante en tiempo real, desde los minutos del examen hasta `00:00`. En el último minuto se pone rojo.
   - El examen en curso (tiempo restante y respuestas) se guarda en localStorage cada segundo. **Si se recarga la página, el examen continúa donde iba**: el reloj no vuelve a empezar, así nadie puede tomar más tiempo del establecido.
5. El botón **Terminar** permite acabar antes. Si hay preguntas sin responder, pide confirmar con un segundo clic.
6. **Cuando el reloj llega a 0, el examen se termina automáticamente**: se bloquean las respuestas y se califica.
7. Muestra el **porcentaje de respuestas acertadas** y si **aprobó o no** según el porcentaje del examen. El resultado queda guardado con los datos del estudiante.

---

## Estructura del proyecto

```
├── index.html                  Login (entrada de la aplicación)
├── html/
│   ├── usuarios.html           Gestión de usuarios (privado)
│   ├── examenes.html           Gestión de exámenes (privado)
│   └── presentar.html          Presentar examen (público)
├── css/
│   └── style.css               Identidad visual, variables de color y diseño responsive
├── js/
│   ├── script.js               Código común: localStorage, sesión, datos iniciales, utilidades
│   ├── login.js                Lógica de la página de login
│   ├── usuarios.js             Lógica de la gestión de usuarios
│   ├── examenes.js             Lógica de la gestión de exámenes
│   ├── presentar.js            Flujo para presentar un examen y calificarlo
│   └── componentes/            Web Components (uno por archivo)
├── json/
│   └── datos-iniciales.json    Usuarios y exámenes de ejemplo
└── imagenes/
    └── logo.svg                Ícono de la aplicación
```

Cada página carga primero `script.js`, después sus componentes y al final su propio script, todos con `defer`.

**Responsabilidades separadas:**
- Los **componentes** manejan la interfaz y las validaciones de formato, y avisan a la página con eventos personalizados (`CustomEvent`).
- Los **scripts de página** aplican las reglas del negocio (por ejemplo, que no se repita un correo) y guardan en localStorage.

---

## Web Components

Cada componente es una clase que extiende `HTMLElement`, crea su Shadow DOM con `attachShadow({ mode: "open" })`, se registra con `customElements.define()` y quita sus listeners en `disconnectedCallback()`.

- **Plantillas:** cada componente tiene su `<template id="tpl-...">` escrito en el HTML de la página donde se usa. El componente lo clona en su Shadow DOM con `content.cloneNode(true)`.
- **Excepción:** `<acme-menu>` está en todas las páginas, así que su HTML se escribe con `shadowRoot.innerHTML` dentro del componente.
- **Atributos:** `<editor-pregunta>`, `<tarjeta-examen>` y `<reloj-examen>` usan `observedAttributes` y `attributeChangedCallback`.

| Componente | Uso | Eventos que emite |
|---|---|---|
| `<acme-menu>` | Menú; los enlaces privados solo se ven con sesión iniciada | — |
| `<formulario-login>` | Formulario de inicio de sesión | `login-enviar` |
| `<formulario-usuario>` | Crear y editar usuarios | `guardar-usuario`, `cancelar-edicion` |
| `<tabla-usuarios>` | Tabla de usuarios | `editar-usuario`, `eliminar-usuario` |
| `<formulario-examen>` | Crear y editar exámenes con sus preguntas | `guardar-examen`, `cancelar-edicion` |
| `<editor-pregunta>` | Una pregunta con sus respuestas (atributo `numero`) | `eliminar-pregunta` |
| `<tabla-examenes>` | Tabla de exámenes | `editar-examen`, `eliminar-examen` |
| `<tarjeta-examen>` | Examen disponible en la lista pública (datos por atributos) | `elegir-examen` |
| `<registro-estudiante>` | Datos de quien presenta el examen | `comenzar-examen`, `volver` |
| `<reloj-examen>` | Cuenta regresiva (atributo `minutos`) | `tic` (cada segundo), `tiempo-agotado` |
| `<pregunta-examen>` | Una pregunta para responder | `respondida` |
| `<resultado-examen>` | Porcentaje de aciertos y aprobación | `volver-lista` |

---

## Estructura de datos (localStorage)

| Clave | Contenido |
|---|---|
| `acme:usuarios` | Arreglo de usuarios |
| `acme:examenes` | Arreglo de exámenes con sus preguntas y respuestas |
| `acme:resultados` | Arreglo de resultados de los exámenes presentados |
| `acme:examenEnCurso` | Examen que se está presentando (se borra al terminar) |
| `acme:sesion` | Usuario con sesión iniciada (en **sessionStorage**, sin contraseña) |

**Usuario**
```json
{
  "identificacion": "1000000001",
  "nombre": "Administrador Acme",
  "email": "admin@acme.edu.co",
  "telefono": "3001234567",
  "cargo": "Administrativo",
  "contrasena": "Admin123"
}
```

**Examen**
```json
{
  "codigo": "JS-001",
  "titulo": "Fundamentos de JavaScript",
  "tiempo": 5,
  "porcentaje": 60,
  "descripcion": "Examen corto sobre variables, tipos de datos y operadores.",
  "preguntas": [
    {
      "enunciado": "¿Qué palabra clave declara una variable que no se puede reasignar?",
      "respuestas": [
        { "descripcion": "var", "correcta": false },
        { "descripcion": "let", "correcta": false },
        { "descripcion": "const", "correcta": true }
      ]
    }
  ]
}
```

**Resultado**
```json
{
  "codigoExamen": "JS-001",
  "tituloExamen": "Fundamentos de JavaScript",
  "identificacion": "1098765432",
  "nombre": "Ana María Pérez",
  "respuestas": [2, 1, null],
  "aciertos": 2,
  "total": 3,
  "porcentaje": 67,
  "aprobado": true,
  "segundosUsados": 95,
  "finalizadoPor": "estudiante"
}
```
`respuestas` guarda la posición de la respuesta elegida en cada pregunta (`null` si quedó sin responder). `finalizadoPor` es `"estudiante"` (botón Terminar) o `"tiempo"` (el reloj llegó a 0).

---

## Detalles técnicos

- **Temporizador:** `setInterval` resta 1 segundo, actualiza el texto `mm:ss` (con `padStart`) y avisa con el evento `tic`. Al llegar a 0 detiene el intervalo (`clearInterval`) y emite `tiempo-agotado`.
- **Sin bloqueos durante el examen:** para confirmar no se usa `confirm()`, porque detiene la página (y el reloj) mientras está abierto. En su lugar se pide un segundo clic.
- **Seguridad básica:** los datos del usuario se muestran con `textContent` (nunca como HTML), y las preguntas que ve el estudiante no incluyen cuál es la respuesta correcta.
- **Delegación de eventos:** cada tabla tiene un solo listener. Lee `data-accion` con `getAttribute` y sube hasta la fila con `parentElement`.
- **Persistencia robusta:** si localStorage tiene un JSON dañado, `JSON.parse` dentro de `try/catch` devuelve un valor por defecto en lugar de romper la página.

---

## Diseño

- **Identidad visual:** modo oscuro con verde lima (`#98ca3f`), azul marino (`#121f3d`) y celeste (`#33b1ff`). Todos los colores son variables CSS en `:root`. Las variables atraviesan el Shadow DOM, así que los componentes usan la misma paleta.
- **Responsive:** en celular los formularios pasan a una columna, las tablas se muestran como tarjetas y el encabezado del examen se compacta.
- **Accesibilidad:** etiquetas `<label>` en todos los campos, foco visible al navegar con teclado, mensajes con `role="alert"` y reloj con `role="timer"`.
- **Animaciones:** entrada suave de las vistas, transiciones en botones y tarjetas, y el reloj late en el último minuto.
