// ===== PRODUCTOS =====
const productos = [
  {
    id: 1,
    nombre: "Body Bebé",
    categoria: "Moda Infantil",
    precio: 12,
    imagen: "img/Body.jpg",
    tallas: ["0-3M", "3-6M", "6-9M"],
    colores: ["Azul", "Rosa"],
    ref: "BB001"
  },
  {
    id: 2,
    nombre: "Pijama Niño",
    categoria: "Moda Infantil",
    precio: 18,
    imagen: "img/Pijama.png",
    tallas: ["2A", "3A", "4A"],
    colores: ["Azul", "Verde"],
    ref: "PN001"
  },
  {
    id: 3,
    nombre: "Zapatos bebé",
    categoria: "Moda Infantil",
    precio: 15,
    imagen: "img/Zapatos.webp",
    tallas: ["16", "17", "18", "19"],
    colores: ["Azul", "Verde", "Rosa"],
    ref: "ZB001"
  },
  {
    id: 4,
    nombre: "Pelele bebé",
    categoria: "Moda Infantil",
    precio: 18,
    imagen: "img/Pelele.png",
    tallas: ["2A", "3A", "4A"],
    colores: ["Azul", "Verde"],
    ref: "P001"
  },
  {
    id: 5,
    nombre: "Pelele bebé",
    categoria: "Ropa Íntima",
    precio: 18,
    imagen: "img/Pelele.png",
    tallas: ["2A", "3A", "4A"],
    colores: ["Azul", "Verde"],
    ref: "P002"
  },
  {
    id: 6,
    nombre: "Zapatos bebé",
    categoria: "Regalos",
    precio: 18,
    imagen: "img/Pelele.png",
    tallas: ["2A", "3A", "4A"],
    colores: ["Azul", "Verde"],
    ref: "ZB002"
  },
  {
    id: 7,
    nombre: "Manta bebé",
    categoria: "Textil Hogar",
    precio: 18,
    imagen: "img/Pijama.png",
    tallas: ["Única"],
    colores: ["Beige", "Rosa"],
    ref: "TH001"
  }
];

// ===== SELECTORES =====
const productosGrid = document.getElementById("productos");
const botonesCategoria = document.querySelectorAll(".cat-btn");

// ===== CONFIGURACIÓN =====
const WHATSAPP = "34600000000";
const CESTA_TTL = 60 * 60 * 1000;
const STORAGE_KEY = "TD_cesta";

// ===== ESTADO =====
let categoriaActiva = "Todas";
const selecciones = {};
let carrito = [];
let carritoAbierto = false;
let toastTimer = null;

// ===== RENDER PRODUCTOS =====
function renderProductos() {
  const filtrados =
    categoriaActiva === "Todas"
      ? productos
      : productos.filter(producto => producto.categoria === categoriaActiva);

  productosGrid.innerHTML = filtrados.map(producto => {
    const tallaSeleccionada = selecciones[producto.id]?.talla || null;
    const colorSeleccionado = selecciones[producto.id]?.color || null;

    return `
      <article class="producto" data-id="${producto.id}">
        <div class="producto-img-wrap">
          <img
            src="${producto.imagen}"
            alt="${producto.nombre}"
            loading="lazy"
            decoding="async"
            onerror="this.onerror=null;this.src='img/fallback.png'">
        </div>

        <div class="producto-body">
          <p class="producto-ref">${producto.ref}</p>
          <h3>${producto.nombre}</h3>
          <span class="producto-cat">${producto.categoria}</span>
          <p class="producto-precio">${producto.precio}€</p>

          <div class="opciones">
            <div>
              <p class="opcion-label">Talla</p>
              <div class="chips">
                ${producto.tallas.map((talla) => `
                  <button
                    type="button"
                    class="chip ${talla === tallaSeleccionada ? "activa" : ""}"
                    data-talla="${talla}">
                    ${talla}
                  </button>
                `).join("")}
              </div>
            </div>

            <div>
              <p class="opcion-label">Color</p>
              <div class="chips">
                ${producto.colores.map((color) => `
                  <button
                    type="button"
                    class="chip ${color === colorSeleccionado ? "activo" : ""}"
                    data-color="${color}">
                    ${color}
                  </button>
                `).join("")}
              </div>
            </div>
          </div>

          <button type="button" class="btn-add">Añadir a cesta</button>
        </div>
      </article>
    `;
  }).join("");
}

// ===== EVENTOS CATÁLOGO =====
productosGrid.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  const botonAdd = e.target.closest(".btn-add");
  const card = e.target.closest(".producto");

  if (!card) return;

  const productoId = Number(card.dataset.id);
  const producto = productos.find(p => p.id === productoId);
  if (!producto) return;

  if (!selecciones[productoId]) {
    selecciones[productoId] = {
      talla: null,
      color: null
    };
  }

  if (chip) {
    if (chip.dataset.talla) {
      selecciones[productoId].talla = chip.dataset.talla;
    }

    if (chip.dataset.color) {
      selecciones[productoId].color = chip.dataset.color;
    }

    renderProductos();
    return;
  }

  if (botonAdd) {
    const tallaElegida = selecciones[productoId]?.talla;
    const colorElegido = selecciones[productoId]?.color;

    if (!tallaElegida || !colorElegido) {
      mostrarToast("Selecciona talla y color");
      return;
    }

    agregarAlCarrito({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      ref: producto.ref,
      categoria: producto.categoria,
      talla: tallaElegida,
      color: colorElegido
    });

    selecciones[productoId] = {
      talla: null,
      color: null
    };

    renderProductos();
  }
});

// ===== FILTROS CATEGORÍA =====
botonesCategoria.forEach((boton) => {
  boton.addEventListener("click", () => {
    botonesCategoria.forEach(b => b.classList.remove("active"));
    boton.classList.add("active");
    categoriaActiva = boton.dataset.categoria;
    renderProductos();
  });
});

// ===== PERSISTENCIA DE CESTA =====
function guardarCesta() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      items: carrito,
      expira: Date.now() + CESTA_TTL
    }));
  } catch (e) {}
}

function cargarCesta() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;

    const datos = JSON.parse(raw);
    if (Date.now() > datos.expira) {
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }

    carrito = datos.items || [];
    return carrito.length > 0;
  } catch (e) {
    return false;
  }
}

function borrarCesta() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
}

function mostrarBannerCesta() {
  const b = document.getElementById("banner-guardada");
  if (b) b.classList.add("visible");
}

// ===== CARRITO =====
function agregarAlCarrito(productoSeleccionado) {
  const existente = carrito.find((item) =>
    item.id === productoSeleccionado.id &&
    item.talla === productoSeleccionado.talla &&
    item.color === productoSeleccionado.color
  );

  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({
      id: productoSeleccionado.id,
      nombre: productoSeleccionado.nombre,
      precio: productoSeleccionado.precio,
      talla: productoSeleccionado.talla,
      color: productoSeleccionado.color,
      cantidad: 1
    });
  }

  actualizarCarrito();
  guardarCesta();
  mostrarToast(productoSeleccionado.nombre + " añadido ✓");
  animarBadge();
}

function eliminar(id, talla, color) {
  carrito = carrito.filter(function(item) {
    return !(item.id === id && item.talla === talla && item.color === color);
  });
  actualizarCarrito();
  guardarCesta();
}

function actualizarCarrito() {
  let total = 0;
  let totalItems = 0;

  for (let i = 0; i < carrito.length; i++) {
    total += carrito[i].precio * carrito[i].cantidad;
    totalItems += carrito[i].cantidad;
  }

  document.getElementById("contador").textContent = totalItems;

  const lista = document.getElementById("lista-carrito");
  const pie = document.getElementById("carrito-foot");

  if (!carrito.length) {
    lista.innerHTML =
      '<div class="empty-cart">' +
        '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".3">' +
          '<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>' +
          'e x1="3" y1="6" x2="21" y2="6"/>' +
          '<path d="M16 10a4 4 0 01-8 0"/>' +
        '</svg>' +
        '<p>Tu cesta está vacía</p>' +
      '</div>';
    pie.style.display = "none";
    return;
  }

  let html = "";
  for (let j = 0; j < carrito.length; j++) {
    const p = carrito[j];
    html +=
      '<div class="item-carrito">' +
        '<div class="item-info">' +
          '<p class="item-nombre">' + p.nombre + '</p>' +
          '<p class="item-detalle">' + p.talla + ' · ' + p.color + ' · ×' + p.cantidad + '</p>' +
        '</div>' +
        '<div class="item-derecha">' +
          '<span class="item-precio">' + (p.precio * p.cantidad) + '€</span>' +
          '<button class="item-eliminar" onclick="eliminar(' + p.id + ', \'' + p.talla + '\', \'' + p.color + '\')" aria-label="Eliminar">×</button>' +
        '</div>' +
      '</div>';
  }

  lista.innerHTML = html;
  document.getElementById("total").textContent = total + "€";
  pie.style.display = "block";
}

// ===== TOGGLE CARRITO =====
function toggleCarrito() {
  carritoAbierto = !carritoAbierto;
  document.getElementById("carrito").classList.toggle("abierto", carritoAbierto);
  document.getElementById("overlay").classList.toggle("visible", carritoAbierto);
  document.body.style.overflow = carritoAbierto ? "hidden" : "";
}

// ===== MODAL CHECKOUT =====
function abrirModal() {
  if (!carrito.length) return;

  let total = 0;
  for (let i = 0; i < carrito.length; i++) {
    total += carrito[i].precio * carrito[i].cantidad;
  }

  document.getElementById("modal-total").textContent = total + "€";
  document.getElementById("modal-error").textContent = "";

  const campos = ["campo-nombre", "campo-telefono", "campo-direccion", "campo-cp", "campo-ciudad"];
  for (let c = 0; c < campos.length; c++) {
    const el = document.getElementById(campos[c]);
    if (el) el.classList.remove("error");
  }

  document.getElementById("modal-overlay").classList.add("visible");
  document.getElementById("modal-checkout").classList.add("visible");
  document.body.style.overflow = "hidden";

  setTimeout(function() {
    const el = document.getElementById("campo-nombre");
    if (el) el.focus();
  }, 300);
}

function cerrarModal() {
  document.getElementById("modal-overlay").classList.remove("visible");
  document.getElementById("modal-checkout").classList.remove("visible");
  document.body.style.overflow = carritoAbierto ? "hidden" : "";
}

function cambiarEntrega(valor) {
  document.getElementById("bloque-direccion").style.display = valor === "envio" ? "block" : "none";
}

function confirmarPedido() {
  const nombre = document.getElementById("campo-nombre").value.trim();
  const telefono = document.getElementById("campo-telefono").value.trim();
  const entrega = document.querySelector('input[name="entrega"]:checked').value;
  const errorEl = document.getElementById("modal-error");
  const errores = [];

  function marcar(id, cond, label) {
    const el = document.getElementById(id);
    if (!cond) {
      el.classList.add("error");
      errores.push(label);
    } else {
      el.classList.remove("error");
    }
  }

  marcar("campo-nombre", nombre, "el nombre");
  marcar("campo-telefono", telefono, "el teléfono");

  let dir = "", cp = "", ciudad = "", piso = "";
  if (entrega === "envio") {
    dir = document.getElementById("campo-direccion").value.trim();
    cp = document.getElementById("campo-cp").value.trim();
    ciudad = document.getElementById("campo-ciudad").value.trim();
    piso = document.getElementById("campo-piso").value.trim();

    marcar("campo-direccion", dir, "la dirección");
    marcar("campo-cp", cp, "el código postal");
    marcar("campo-ciudad", ciudad, "la ciudad");
  }

  if (errores.length) {
    errorEl.textContent = "Faltan datos: " + errores.join(", ") + ".";
    return;
  }

  errorEl.textContent = "";

  let total = 0;
  let msg = "Hola! Quiero hacer este pedido 🛍️%0A%0A";

  for (let i = 0; i < carrito.length; i++) {
    const p = carrito[i];
    msg += "▸ " + p.nombre + " (" + p.talla + ", " + p.color + ") ×" + p.cantidad + " → " + (p.precio * p.cantidad) + "€%0A";
    total += p.precio * p.cantidad;
  }

  msg += "%0A💰 *Total: " + total + "€*%0A%0A";
  msg += "👤 *Mis datos:*%0A";
  msg += "Nombre: " + nombre + "%0A";
  msg += "Teléfono: " + telefono + "%0A";

  if (entrega === "recogida") {
    msg += "Entrega: ✅ Recogida en tienda%0A";
  } else {
    msg += "Entrega: 🚚 Envío a domicilio%0A";
    msg += "Dirección: " + dir + (piso ? ", " + piso : "") + "%0A";
    msg += "CP y ciudad: " + cp + " " + ciudad + "%0A";
  }

  window.open("https://wa.me/" + WHATSAPP + "?text=" + msg, "_blank");
  cerrarModal();
  carrito = [];
  borrarCesta();
  actualizarCarrito();
  if (carritoAbierto) toggleCarrito();
  mostrarToast("¡Pedido enviado! Te llamamos pronto ✓");
}

// ===== TOAST =====
function mostrarToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() {
    toast.classList.remove("visible");
  }, 2800);
}

// ===== ANIMACIÓN BADGE =====
function animarBadge() {
  const badge = document.getElementById("contador");
  if (!badge) return;
  badge.classList.add("bump");
  setTimeout(function() {
    badge.classList.remove("bump");
  }, 300);
}

// ===== INIT =====
renderProductos();
if (cargarCesta()) {
  actualizarCarrito();
  mostrarBannerCesta();
} else {
  actualizarCarrito();
}

// ===== SERVICE WORKER =====
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then((registration) => {
        console.log("Service Worker registrado:", registration.scope);
      })
      .catch((error) => {
        console.log("Error al registrar el Service Worker:", error);
      });
  });
}