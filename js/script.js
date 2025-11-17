// script.js

// Instancias globales
const carrito = new Carrito();

// Variables para filtros
let filtroCarrito = "";
let filtroRecetas = "";

// Claves para localStorage
const STORAGE_KEYS = {
  RECETAS: 'gestor_comidas_recetas',
  CARRITO: 'gestor_comidas_carrito',
  FILTROS: 'gestor_comidas_filtros',
  PLANIFICADOR: 'gestor_comidas_planificador'
};

// Planificador semanal
let planificadorSemanal = {
  lunes: [],
  martes: [],
  miercoles: [],
  jueves: [],
  viernes: [],
  sabado: [],
  domingo: []
};

// Datos de recetas (se cargarán desde localStorage o datos por defecto)
let listaRecetas = [];

function cargarRecetas(filtro = "") {
  const ulRecetas = document.getElementById("lista-recetas");
  ulRecetas.innerHTML = ""; // limpiar por las dudas

  // Filtrar recetas
  const recetasFiltradas = listaRecetas.filter(receta => {
    if (!filtro) return true;
    
    const filtroLower = filtro.toLowerCase();
    const nombreCoincide = receta.nombre.toLowerCase().includes(filtroLower);
    const ingredientesCoincide = receta.ingredientes.some(ingrediente => 
      ingrediente.toLowerCase().includes(filtroLower)
    );
    
    return nombreCoincide || ingredientesCoincide;
  });

  if (recetasFiltradas.length === 0) {
    ulRecetas.innerHTML = `
      <li class="list-group-item text-center text-muted py-4">
        <i class="fas fa-search fa-2x mb-2"></i>
        <p class="mb-0">No se encontraron recetas</p>
        <small>Intenta con otros términos de búsqueda</small>
      </li>
    `;
    return;
  }

  recetasFiltradas.forEach((receta) => {
    const li = document.createElement("li");
    li.classList.add("list-group-item", "mb-2", "p-2", "border", "d-flex", "justify-content-between", "align-items-center");

    // Verificar si la receta ya está en el carrito
    const yaEnCarrito = carrito.recetas.some(recetaCarrito => 
      recetaCarrito.nombre.toLowerCase() === receta.nombre.toLowerCase()
    );

    // Resaltar términos de búsqueda
    let nombreResaltado = receta.nombre;
    let ingredientesTexto = receta.ingredientes.join(", ");
    
    if (filtro) {
      const regex = new RegExp(`(${filtro})`, 'gi');
      nombreResaltado = receta.nombre.replace(regex, '<mark>$1</mark>');
      ingredientesTexto = ingredientesTexto.replace(regex, '<mark>$1</mark>');
    }

    li.innerHTML = `
      <div>
        <strong>${nombreResaltado}</strong>
        <small class="text-muted d-block">${receta.ingredientes.length} ingredientes</small>
        ${filtro ? `<small class="text-info">${ingredientesTexto}</small>` : ''}
        ${yaEnCarrito ? '<small class="text-success"><i class="fas fa-check"></i> En el carrito</small>' : ''}
      </div>
      <div>
        <button class="btn btn-sm btn-outline-primary me-2 ver-receta" data-id="${receta.id}">
          Ver
        </button>
        <button class="btn btn-sm ${yaEnCarrito ? 'btn-success disabled' : 'btn-primary'} agregar-receta" 
                data-id="${receta.id}" 
                ${yaEnCarrito ? 'disabled' : ''}>
          ${yaEnCarrito ? '<i class="fas fa-check me-1"></i>Agregada' : '+ Carrito'}
        </button>
      </div>
    `;

    ulRecetas.appendChild(li);
  });
}

// eventos para clicks
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("ver-receta")) {
    const id = Number(e.target.dataset.id);
    const receta = listaRecetas.find((r) => r.id === id);
    mostrarReceta(receta);
  }
  
  if (e.target.classList.contains("agregar-receta")) {
    const id = Number(e.target.dataset.id);
    const recetaData = listaRecetas.find((r) => r.id === id);
    agregarRecetaAlCarrito(recetaData);
  }
  
  if (e.target.id === "limpiar-carrito") {
    limpiarCarrito();
  }
  
  if (e.target.classList.contains("eliminar-receta")) {
    const id = Number(e.target.dataset.id);
    eliminarReceta(id);
  }
  
  if (e.target.classList.contains("quitar-del-carrito")) {
    const nombreReceta = e.target.dataset.nombre;
    quitarRecetaDelCarrito(nombreReceta);
  }
  
  if (e.target.id === "exportar-lista") {
    exportarListaIngredientes();
  }
  
  if (e.target.id === "limpiar-datos") {
    limpiarDatosGuardados();
  }
  
  if (e.target.classList.contains("agregar-a-dia")) {
    const recetaNombre = e.target.dataset.receta;
    const dia = e.target.dataset.dia;
    agregarRecetaADia(recetaNombre, dia);
  }
  
  if (e.target.classList.contains("quitar-de-dia")) {
    const index = Number(e.target.dataset.index);
    const dia = e.target.dataset.dia;
    quitarRecetaDeDia(dia, index);
  }
  
  if (e.target.id === "limpiar-planificador") {
    limpiarPlanificador();
  }
  
  if (e.target.id === "exportar-planificador") {
    exportarPlanificador();
  }
  
  if (e.target.id === "limpiar-buscar-carrito") {
    document.getElementById("buscar-carrito").value = "";
    filtroCarrito = "";
    cargarRecetas();
  }
  
  if (e.target.id === "limpiar-buscar-recetas") {
    document.getElementById("buscar-recetas").value = "";
    filtroRecetas = "";
    cargarTodasLasRecetas();
  }
});

// eventos para búsqueda en tiempo real
document.addEventListener("input", (e) => {
  if (e.target.id === "buscar-carrito") {
    filtroCarrito = e.target.value.trim();
    guardarDatos(); // Guardar filtros
    cargarRecetas(filtroCarrito);
  }
  
  if (e.target.id === "buscar-recetas") {
    filtroRecetas = e.target.value.trim();
    guardarDatos(); // Guardar filtros
    cargarTodasLasRecetas(filtroRecetas);
  }
});

// eventos para cambio de pestañas
document.addEventListener("shown.bs.tab", (e) => {
  if (e.target.id === "carrito-tab") {
    actualizarVistaCarrito();
  }
  if (e.target.id === "recetas-tab") {
    cargarTodasLasRecetas();
  }
  
  if (e.target.id === "planificador-tab") {
    cargarPlanificador();
  }
});

// evento para formulario de nueva receta
document.addEventListener("submit", (e) => {
  if (e.target.id === "form-nueva-receta") {
    e.preventDefault();
    crearNuevaReceta();
  }
});

// muestra la receta en el <aside>
function mostrarReceta(receta) {
  const cont = document.getElementById("receta-seleccionada");

  // Verificar si la receta ya está en el carrito
  const yaEnCarrito = carrito.recetas.some(recetaCarrito => 
    recetaCarrito.nombre.toLowerCase() === receta.nombre.toLowerCase()
  );

  cont.innerHTML = `
    <div class="card">
      <div class="card-body">
        <h3 class="card-title">${receta.nombre}</h3>
        <h5>Ingredientes:</h5>
        <ul class="list-unstyled">
          ${receta.ingredientes.map((i) => `<li>• ${i}</li>`).join("")}
        </ul>
        <h5>Pasos:</h5>
        <p class="card-text">${receta.pasos}</p>
      </div>
    </div>
  `;
  
  // Actualizar botones del carrito
  const botonesCarrito = document.getElementById("botones-carrito");
  botonesCarrito.innerHTML = `
    <button class="btn ${yaEnCarrito ? 'btn-success disabled' : 'btn-primary'} w-100 agregar-receta" 
            data-id="${receta.id}" 
            ${yaEnCarrito ? 'disabled' : ''}>
      ${yaEnCarrito ? '<i class="fas fa-check me-2"></i>Ya está en el carrito' : 'Agregar al Carrito'}
    </button>
  `;
}

// función para agregar receta al carrito
function agregarRecetaAlCarrito(recetaData) {
  // Verificar si la receta ya está en el carrito
  const yaEnCarrito = carrito.recetas.some(receta => 
    receta.nombre.toLowerCase() === recetaData.nombre.toLowerCase()
  );
  
  if (yaEnCarrito) {
    mostrarNotificacion(`"${recetaData.nombre}" ya está en el carrito`, "warning");
    return;
  }
  
  // Crear instancia de Receta
  const receta = new Receta(recetaData.nombre, recetaData.ingredientes.join(", "));
  
  // Agregar al carrito
  carrito.agregarReceta(receta);
  
  // Guardar cambios
  guardarDatos();
  
  // Mostrar confirmación
  mostrarNotificacion(`"${receta.nombre}" agregada al carrito`);
  
  // Actualizar vista del carrito si está activa
  if (document.getElementById("carrito").classList.contains("active")) {
    actualizarVistaCarrito();
  }
  
  // Recargar la lista de recetas para actualizar el estado de los botones
  cargarRecetas(filtroCarrito);
  
  console.log("Carrito actual:", carrito);
}

// función para mostrar la vista del carrito
function actualizarVistaCarrito() {
  const listaIngredientes = document.getElementById("lista-ingredientes");
  const resumenCarrito = document.getElementById("resumen-carrito");
  const btnLimpiar = document.getElementById("limpiar-carrito");
  const btnExportar = document.getElementById("exportar-lista");
  
  if (carrito.ingredientes.length === 0) {
    // Carrito vacío
    listaIngredientes.innerHTML = `
      <div class="text-muted text-center p-5">
        <i class="fas fa-shopping-cart fa-3x mb-3"></i>
        <h4>Carrito vacío</h4>
        <p>Agrega recetas desde "Armar Carrito" para ver la lista de ingredientes aquí</p>
      </div>
    `;
    resumenCarrito.innerHTML = `
      <p class="text-muted mb-0">0 recetas seleccionadas</p>
      <p class="text-muted mb-0">0 ingredientes únicos</p>
    `;
    btnLimpiar.disabled = true;
    btnExportar.disabled = true;
  } else {
    // Mostrar ingredientes ordenados por cantidad (más frecuentes primero)
    const ingredientesOrdenados = [...carrito.ingredientes].sort((a, b) => b.cantidad - a.cantidad);
    
    listaIngredientes.innerHTML = `
      <h4 class="mb-3">Lista de Ingredientes</h4>
      <div class="list-group">
        ${ingredientesOrdenados.map(ingrediente => `
          <div class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>${ingrediente.nombre}</strong>
              <small class="text-muted d-block">Para ${ingrediente.cantidad} receta${ingrediente.cantidad > 1 ? 's' : ''}</small>
            </div>
            <span class="badge bg-primary rounded-pill">${ingrediente.cantidad}</span>
          </div>
        `).join("")}
      </div>
      
      <div class="mt-4">
        <h5>Recetas en el carrito:</h5>
        <div class="row">
          ${carrito.recetas.map(receta => `
            <div class="col-md-6 mb-2">
              <div class="card card-body py-2">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="mb-1">${receta.nombre}</h6>
                    <small class="text-muted">${receta.ingredientes.length} ingredientes</small>
                  </div>
                  <button class="btn btn-outline-danger btn-sm quitar-del-carrito" 
                          data-nombre="${receta.nombre}"
                          title="Quitar del carrito">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
    
    resumenCarrito.innerHTML = `
      <p class="mb-1"><strong>${carrito.recetas.length}</strong> recetas seleccionadas</p>
      <p class="mb-0"><strong>${carrito.ingredientes.length}</strong> ingredientes únicos</p>
    `;
    btnLimpiar.disabled = false;
    btnExportar.disabled = false;
  }
}

// función para limpiar el carrito
function limpiarCarrito() {
  carrito.recetas = [];
  carrito.ingredientes = [];
  
  // Guardar cambios
  guardarDatos();
  
  actualizarVistaCarrito();
  
  // Recargar las listas para actualizar el estado de los botones
  cargarRecetas(filtroCarrito);
  
  mostrarNotificacion("Carrito limpiado");
}

// función para quitar una receta específica del carrito
function quitarRecetaDelCarrito(nombreReceta) {
  // Encontrar y eliminar la receta
  const indiceReceta = carrito.recetas.findIndex(receta => 
    receta.nombre.toLowerCase() === nombreReceta.toLowerCase()
  );
  
  if (indiceReceta === -1) {
    mostrarNotificacion("Receta no encontrada en el carrito", "error");
    return;
  }
  
  // Obtener la receta antes de eliminarla
  const recetaEliminada = carrito.recetas[indiceReceta];
  
  // Eliminar la receta del carrito
  carrito.recetas.splice(indiceReceta, 1);
  
  // Recalcular ingredientes
  recalcularIngredientes();
  
  // Guardar cambios
  guardarDatos();
  
  // Actualizar vistas
  actualizarVistaCarrito();
  cargarRecetas(filtroCarrito);
  
  mostrarNotificacion(`"${recetaEliminada.nombre}" removida del carrito`, "info");
}

// función para recalcular ingredientes después de quitar una receta
function recalcularIngredientes() {
  carrito.ingredientes = [];
  
  carrito.recetas.forEach(receta => {
    receta.ingredientes.forEach(ingrediente => {
      const ingredienteExistente = carrito.ingredientes.find(
        item => item.nombre.toLowerCase() === ingrediente.toLowerCase()
      );
      
      if (ingredienteExistente) {
        ingredienteExistente.cantidad++;
      } else {
        carrito.ingredientes.push({
          nombre: ingrediente,
          cantidad: 1
        });
      }
    });
  });
}

// función para exportar lista de ingredientes
function exportarListaIngredientes() {
  if (carrito.ingredientes.length === 0) {
    mostrarNotificacion("El carrito está vacío", "warning");
    return;
  }
  
  // Crear el contenido del archivo
  let contenido = "LISTA DE COMPRAS\n";
  contenido += "=====================================\n\n";
  
  // Agregar fecha
  const fecha = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  contenido += `Generada el: ${fecha}\n\n`;
  
  carrito.ingredientes
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
    .forEach((ingrediente, index) => {
      contenido += `${index + 1}. ${ingrediente.nombre}`;
      contenido += "\n";
    });
  
  // Crear y descargar el archivo
  const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  
  a.href = url;
  a.download = `lista-ingredientes-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  mostrarNotificacion("Lista de ingredientes exportada exitosamente", "success");
}

// Funciones del Planificador Semanal
function cargarPlanificador() {
  console.log("Cargando planificador...");
  console.log("Recetas en carrito:", carrito.recetas);
  cargarRecetasDisponibles();
  cargarSemana();
}

function cargarRecetasDisponibles() {
  const container = document.getElementById("recetas-disponibles");
  
  if (!container) {
    console.error("No se encontró el elemento recetas-disponibles");
    return;
  }
  
  console.log("Cargando recetas disponibles, carrito tiene:", carrito.recetas.length, "recetas");
  
  if (carrito.recetas.length === 0) {
    container.innerHTML = `
      <div class="text-muted text-center p-3">
        <i class="fas fa-utensils fa-2x mb-2"></i>
        <p class="mb-0">Agrega recetas al carrito primero</p>
        <small>Ve a "Armar Carrito" para seleccionar recetas</small>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="d-flex flex-wrap" style="gap: 0.25rem;">
      ${carrito.recetas.map(receta => `
        <div class="dropdown">
          <button class="btn btn-outline-primary btn-sm dropdown-toggle text-nowrap" type="button" 
                  data-bs-toggle="dropdown" style="font-size: 0.8rem; padding: 0.25rem 0.5rem;">
            ${receta.nombre}
          </button>
          <ul class="dropdown-menu">
            <li><button class="dropdown-item agregar-a-dia" data-receta="${receta.nombre}" data-dia="lunes">
              <i class="fas fa-plus me-2"></i>Lunes
            </button></li>
            <li><button class="dropdown-item agregar-a-dia" data-receta="${receta.nombre}" data-dia="martes">
              <i class="fas fa-plus me-2"></i>Martes
            </button></li>
            <li><button class="dropdown-item agregar-a-dia" data-receta="${receta.nombre}" data-dia="miercoles">
              <i class="fas fa-plus me-2"></i>Miércoles
            </button></li>
            <li><button class="dropdown-item agregar-a-dia" data-receta="${receta.nombre}" data-dia="jueves">
              <i class="fas fa-plus me-2"></i>Jueves
            </button></li>
            <li><button class="dropdown-item agregar-a-dia" data-receta="${receta.nombre}" data-dia="viernes">
              <i class="fas fa-plus me-2"></i>Viernes
            </button></li>
            <li><button class="dropdown-item agregar-a-dia" data-receta="${receta.nombre}" data-dia="sabado">
              <i class="fas fa-plus me-2"></i>Sábado
            </button></li>
            <li><button class="dropdown-item agregar-a-dia" data-receta="${receta.nombre}" data-dia="domingo">
              <i class="fas fa-plus me-2"></i>Domingo
            </button></li>
          </ul>
        </div>
      `).join("")}
    </div>
  `;
}

function cargarSemana() {
  const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  
  dias.forEach(dia => {
    const container = document.querySelector(`.dia-planificador[data-dia="${dia}"]`);
    const recetasDia = planificadorSemanal[dia] || [];
    
    if (recetasDia.length === 0) {
      container.innerHTML = `
        <div class="text-muted text-center p-3">
          <i class="fas fa-plus-circle fa-2x mb-2"></i>
          <p class="mb-0">Agregar comidas</p>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="d-grid gap-2">
          ${recetasDia.map((receta, index) => `
            <div class="card card-body py-2">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="mb-1">${receta}</h6>
                  <small class="text-muted">Comida planificada</small>
                </div>
                <button class="btn btn-outline-danger btn-sm quitar-de-dia" 
                        data-dia="${dia}" data-index="${index}"
                        title="Quitar del día">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          `).join("")}
        </div>
      `;
    }
  });
}

function agregarRecetaADia(recetaNombre, dia) {
  if (!planificadorSemanal[dia]) {
    planificadorSemanal[dia] = [];
  }
  
  planificadorSemanal[dia].push(recetaNombre);
  guardarDatos();
  cargarSemana();
  mostrarNotificacion(`"${recetaNombre}" agregada a ${dia.charAt(0).toUpperCase() + dia.slice(1)}`, "success");
}

function quitarRecetaDeDia(dia, index) {
  const recetaEliminada = planificadorSemanal[dia][index];
  planificadorSemanal[dia].splice(index, 1);
  guardarDatos();
  cargarSemana();
  mostrarNotificacion(`"${recetaEliminada}" removida de ${dia.charAt(0).toUpperCase() + dia.slice(1)}`, "info");
}

function limpiarPlanificador() {
  if (confirm('¿Estás seguro de que quieres limpiar toda la planificación semanal?')) {
    planificadorSemanal = {
      lunes: [],
      martes: [],
      miercoles: [],
      jueves: [],
      viernes: [],
      sabado: [],
      domingo: []
    };
    guardarDatos();
    cargarSemana();
    mostrarNotificacion("Planificación semanal limpiada", "info");
  }
}

function exportarPlanificador() {
  const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  const diasNombres = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  let contenido = "PLANIFICACIÓN SEMANAL DE COMIDAS\n";
  contenido += "=================================\n\n";
  
  const fecha = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  contenido += `Generada el: ${fecha}\n\n`;
  
  let totalComidas = 0;
  
  dias.forEach((dia, index) => {
    const recetasDia = planificadorSemanal[dia] || [];
    totalComidas += recetasDia.length;
    
    contenido += `${diasNombres[index].toUpperCase()}\n`;
    contenido += "=" + "=".repeat(diasNombres[index].length) + "\n";
    
    if (recetasDia.length === 0) {
      contenido += "• Sin comidas planificadas\n\n";
    } else {
      recetasDia.forEach((receta, recetaIndex) => {
        contenido += `• ${receta}\n`;
      });
      contenido += "\n";
    }
  });
  
  
  // Crear y descargar el archivo
  const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  
  a.href = url;
  a.download = `planificacion-semanal-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  mostrarNotificacion("Planificación semanal exportada exitosamente", "success");
}

// función para crear nueva receta
function crearNuevaReceta() {
  const nombre = document.getElementById("nombre-receta").value.trim();
  const ingredientesTexto = document.getElementById("ingredientes-receta").value.trim();
  const pasos = document.getElementById("pasos-receta").value.trim();
  
  if (!nombre || !ingredientesTexto || !pasos) {
    mostrarNotificacion("Por favor completa todos los campos", "danger");
    return;
  }
  
  // Procesar ingredientes
  const ingredientes = ingredientesTexto
    .split(",")
    .map(ing => ing.trim())
    .filter(ing => ing.length > 0);
  
  if (ingredientes.length === 0) {
    mostrarNotificacion("Debes agregar al menos un ingrediente", "warning");
    return;
  }
  
  // Crear nueva receta con ID único
  const nuevaReceta = {
    id: Math.max(...listaRecetas.map(r => r.id)) + 1,
    nombre: nombre,
    ingredientes: ingredientes,
    pasos: pasos
  };
  
  // Agregar a la lista
  listaRecetas.push(nuevaReceta);
  
  // Guardar cambios
  guardarDatos();
  
  // Limpiar formulario
  document.getElementById("form-nueva-receta").reset();
  
  // Actualizar vistas
  cargarRecetas(filtroCarrito);
  cargarTodasLasRecetas(filtroRecetas);
  
  mostrarNotificacion(`Receta "${nombre}" creada exitosamente`, "success");
}

// función para cargar todas las recetas en la pestaña de gestión
function cargarTodasLasRecetas(filtro = "") {
  const container = document.getElementById("lista-todas-recetas");
  const contador = document.getElementById("contador-recetas");
  
  // Filtrar recetas
  const recetasFiltradas = listaRecetas.filter(receta => {
    if (!filtro) return true;
    
    const filtroLower = filtro.toLowerCase();
    const nombreCoincide = receta.nombre.toLowerCase().includes(filtroLower);
    const ingredientesCoincide = receta.ingredientes.some(ingrediente => 
      ingrediente.toLowerCase().includes(filtroLower)
    );
    
    return nombreCoincide || ingredientesCoincide;
  });
  
  contador.textContent = `${recetasFiltradas.length}${filtro ? ` de ${listaRecetas.length}` : ''}`;
  
  if (recetasFiltradas.length === 0) {
    container.innerHTML = `
      <div class="text-muted text-center p-4">
        <i class="fas fa-search fa-2x mb-3"></i>
        <p>No se encontraron recetas</p>
        <small>${filtro ? 'Intenta con otros términos de búsqueda' : 'Crea tu primera receta usando el formulario'}</small>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="list-group">
      ${recetasFiltradas.map(receta => {
        // Resaltar términos de búsqueda
        let nombreResaltado = receta.nombre;
        let ingredientesTexto = receta.ingredientes.join(", ");
        
        if (filtro) {
          const regex = new RegExp(`(${filtro})`, 'gi');
          nombreResaltado = receta.nombre.replace(regex, '<mark>$1</mark>');
          ingredientesTexto = ingredientesTexto.replace(regex, '<mark>$1</mark>');
        }
        
        return `
          <div class="list-group-item">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <h6 class="mb-1">${nombreResaltado}</h6>
                <p class="mb-1 text-muted small">${ingredientesTexto}</p>
                <small class="text-muted">${receta.ingredientes.length} ingredientes</small>
              </div>
              <div class="btn-group-vertical btn-group-sm">
                <button class="btn btn-outline-danger btn-sm eliminar-receta" data-id="${receta.id}">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

// función para eliminar receta
function eliminarReceta(id) {
  const receta = listaRecetas.find(r => r.id === id);
  if (!receta) return;
  
  if (confirm(`¿Estás seguro de que quieres eliminar la receta "${receta.nombre}"?`)) {
    // Eliminar de la lista
    const index = listaRecetas.findIndex(r => r.id === id);
    listaRecetas.splice(index, 1);
    
    // Guardar cambios
    guardarDatos();
    
    // Actualizar vistas
    cargarRecetas(filtroCarrito);
    cargarTodasLasRecetas(filtroRecetas);
    
    mostrarNotificación(`Receta "${receta.nombre}" eliminada`, "info");
  }
}

// función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = "success") {
  // Crear elemento de notificación
  const notificacion = document.createElement("div");
  const tipoClase = tipo === "success" ? "alert-success" : 
                   tipo === "danger" ? "alert-danger" :
                   tipo === "warning" ? "alert-warning" : 
                   tipo === "info" ? "alert-info" : "alert-success";
  
  notificacion.className = `alert ${tipoClase} alert-dismissible fade show position-fixed`;
  notificacion.style.cssText = "bottom: 20px; right: 20px; z-index: 1050; min-width: 300px; max-width: 400px;";
  
  notificacion.innerHTML = `
    ${mensaje}
  `;
  
  document.body.appendChild(notificacion);
  
  // Auto-remover después de 3 segundos
  setTimeout(() => {
    if (notificacion.parentNode) {
      notificacion.remove();
    }
  }, 2000);
}

// Funciones de persistencia
function guardarDatos() {
  try {
    localStorage.setItem(STORAGE_KEYS.RECETAS, JSON.stringify(listaRecetas));
    localStorage.setItem(STORAGE_KEYS.CARRITO, JSON.stringify({
      recetas: carrito.recetas,
      ingredientes: carrito.ingredientes
    }));
    localStorage.setItem(STORAGE_KEYS.FILTROS, JSON.stringify({
      filtroCarrito,
      filtroRecetas
    }));
    localStorage.setItem(STORAGE_KEYS.PLANIFICADOR, JSON.stringify(planificadorSemanal));
  } catch (error) {
    console.error('Error al guardar datos:', error);
    mostrarNotificacion('Error al guardar datos localmente', 'danger');
  }
}

function cargarDatos() {
  try {
    // Cargar recetas
    const recetasGuardadas = localStorage.getItem(STORAGE_KEYS.RECETAS);
    if (recetasGuardadas) {
      listaRecetas = JSON.parse(recetasGuardadas);
    } else {
      // Datos por defecto si no hay nada guardado
      listaRecetas = [
        {
          id: 1,
          nombre: "Pasta con salsa",
          ingredientes: ["pasta", "tomate", "aceite", "ajo"],
          pasos: "Hervir la pasta y mezclar con la salsa.",
        },
        {
          id: 2,
          nombre: "Ensalada César",
          ingredientes: ["lechuga", "pollo", "crutones", "aderezo"],
          pasos: "Mezclar todo en un bowl.",
        },
        {
          id: 3,
          nombre: "Tortilla de papa",
          ingredientes: ["papas", "huevos", "sal", "aceite"],
          pasos: "Freír papas y mezclar con huevo.",
        },
      ];
      guardarDatos(); // Guardar datos por defecto
    }

    // Cargar carrito
    const carritoGuardado = localStorage.getItem(STORAGE_KEYS.CARRITO);
    if (carritoGuardado) {
      const datosCarrito = JSON.parse(carritoGuardado);
      carrito.recetas = datosCarrito.recetas || [];
      carrito.ingredientes = datosCarrito.ingredientes || [];
    }

    // Cargar filtros
    const filtrosGuardados = localStorage.getItem(STORAGE_KEYS.FILTROS);
    if (filtrosGuardados) {
      const datosFiltros = JSON.parse(filtrosGuardados);
      filtroCarrito = datosFiltros.filtroCarrito || "";
      filtroRecetas = datosFiltros.filtroRecetas || "";
      
      // Restaurar filtros en los campos de búsqueda
      setTimeout(() => {
        const buscarCarrito = document.getElementById("buscar-carrito");
        const buscarRecetas = document.getElementById("buscar-recetas");
        if (buscarCarrito) buscarCarrito.value = filtroCarrito;
        if (buscarRecetas) buscarRecetas.value = filtroRecetas;
      }, 100);
    }

    // Cargar planificador
    const planificadorGuardado = localStorage.getItem(STORAGE_KEYS.PLANIFICADOR);
    if (planificadorGuardado) {
      planificadorSemanal = JSON.parse(planificadorGuardado);
    }
  } catch (error) {
    console.error('Error al cargar datos:', error);
    mostrarNotificacion('Error al cargar datos guardados', 'warning');
    // Usar datos por defecto en caso de error
    listaRecetas = [
      {
        id: 1,
        nombre: "Pasta con salsa",
        ingredientes: ["pasta", "tomate", "aceite", "ajo"],
        pasos: "Hervir la pasta y mezclar con la salsa.",
      },
      {
        id: 2,
        nombre: "Ensalada César",
        ingredientes: ["lechuga", "pollo", "crutones", "aderezo"],
        pasos: "Mezclar todo en un bowl.",
      },
      {
        id: 3,
        nombre: "Tortilla de papa",
        ingredientes: ["papas", "huevos", "sal", "aceite"],
        pasos: "Freír papas y mezclar con huevo.",
      },
    ];
  }
}

function limpiarDatosGuardados() {
  if (confirm('¿Estás seguro de que quieres eliminar todos los datos guardados? Esta acción no se puede deshacer.')) {
    localStorage.removeItem(STORAGE_KEYS.RECETAS);
    localStorage.removeItem(STORAGE_KEYS.CARRITO);
    localStorage.removeItem(STORAGE_KEYS.FILTROS);
    localStorage.removeItem(STORAGE_KEYS.PLANIFICADOR);
    location.reload(); // Recargar página para empezar desde cero
  }
}

// Asegurar que todo esté disponible
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM cargado, inicializando aplicación");
  
  // Verificar que las clases estén disponibles
  if (typeof Receta === 'undefined') {
    console.error("Clase Receta no está disponible");
  }
  if (typeof Carrito === 'undefined') {
    console.error("Clase Carrito no está disponible");
  }
  
  // Cargar datos y funciones después de que DOM esté listo
  cargarDatos(); // Cargar datos persistentes primero
  cargarRecetas(); // Cargar recetas en "Armar carrito"
  cargarTodasLasRecetas(); // Cargar recetas en "Recetas"
  
  // Si el planificador está activo, cargarlo
  const planificadorTab = document.getElementById("planificador-tab");
  if (planificadorTab && planificadorTab.classList.contains("active")) {
    setTimeout(() => cargarPlanificador(), 100);
  }
});
