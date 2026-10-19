const tragosMaximos = 2

class Trago {
    constructor(id, nombre, precio, stock){
        this.id=id
        this.nombre=nombre
        this.precio=precio
        this.stock=stock
    }
    vender(cantidad) {
        this.stock = this.stock - cantidad
    }
    hayStock() {
        return this.stock > 0
    }
}

function crearCartaInicial() {
    const margarita= new Trago ("T-006", "Margarita", 1000, 5)
    const fernet= new Trago ("T-001", "Fernet", 1200, 7)
    const mojito= new Trago("T-002", "Mojito", 900, 4)
    const ginTonic= new Trago( "T-004", "Gin Tonic", 1400,8)
    const caipirinha= new Trago ("T-005", "Caipirinha", 1500, 6)
    const cubaLibre= new Trago ("T-007", "Cuba Libre", 1000, 7)
    const daiquiri= new Trago ("T-008", "Daiquiri", 1300, 3)
    const negroni= new Trago ("T-009","Negroni", 1200, 4 )
    const aperol= new Trago ("T-010", "Aperol Spritz", 1000, 8)
    const carta = [margarita, fernet, mojito, ginTonic, caipirinha, cubaLibre]

    carta.push(daiquiri)
    carta.unshift(negroni)

    const indiceCubaLibre = carta.indexOf(cubaLibre)
    carta.splice(indiceCubaLibre, 1, aperol)

    return carta
}

function guardar(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor))
}

function leer(clave) {
    return JSON.parse(localStorage.getItem(clave))
}

let tragosStock = leer("tragos")?.map(({ id, nombre, precio, stock }) => new Trago(id, nombre, precio, stock)) ?? crearCartaInicial()
let pedidos = leer("pedidos") ?? []
let ingreso = leer("ingreso") ?? false
let proximoId = leer("proximoId") ?? 11

const inputNombre = document.getElementById("inputNombre")
const inputPrecio = document.getElementById("inputPrecio")
const inputStock = document.getElementById("inputStock")
const botonAgregar = document.getElementById("botonAgregar")
const botonRestablecer = document.getElementById("botonRestablecer")
const contenedorItems = document.querySelector("#contenedor-items")
const inputBuscar = document.getElementById("inputBuscar")
const formIngreso = document.getElementById("formIngreso")
const inputEdad = document.getElementById("inputEdad")
const botonIngresar = document.getElementById("botonIngresar")
const mensajeIngreso = document.getElementById("mensajeIngreso")
const contenedorPedidos = document.getElementById("contenedor-pedidos")
const contenedorCuenta = document.getElementById("contenedor-cuenta")
const mensajeAdmin = document.getElementById("mensajeAdmin")

function mostrarMensaje(elemento, texto, tipo) {
    elemento.textContent = texto
    elemento.className = `mensaje ${tipo}`
}

function renderizarTragos() {
    const texto = inputBuscar.value.trim().toLowerCase()
    const tragosFiltrados = tragosStock.filter((trago) => trago.nombre.toLowerCase().includes(texto))

    contenedorItems.innerHTML = tragosFiltrados.length === 0 ? `<p>No hay tragos en la carta</p>` : ""
    for (const { id, nombre, precio, stock } of tragosFiltrados) {
        contenedorItems.innerHTML += `
            <div class="item">
                <h3>${nombre}</h3>
                <p>Precio: $${precio} - Stock: ${stock}</p>
                <button class="botonEliminar" data-id="${id}">Eliminar</button>
            </div>
        `
    }
}

function agregarTrago() {
    const nombre = inputNombre.value.trim()
    const precio = Number(inputPrecio.value)
    const stock = Number(inputStock.value)

    if (nombre === "" || inputPrecio.value === "" || inputStock.value === "") {
        mostrarMensaje(mensajeAdmin, "Completá nombre, precio y stock", "error")
        return
    }

    if (precio <= 0 || stock < 0) {
        mostrarMensaje(mensajeAdmin, "El precio tiene que ser mayor a 0 y el stock no puede ser negativo", "error")
        return
    }

    const nuevoTrago = new Trago(`T-${String(proximoId).padStart(3, "0")}`, nombre, precio, stock)
    proximoId++
    tragosStock.push(nuevoTrago)
    guardar("tragos", tragosStock)
    guardar("proximoId", proximoId)

    inputNombre.value = ""
    inputPrecio.value = ""
    inputStock.value = ""

    mostrarMensaje(mensajeAdmin, `Se agregó ${nuevoTrago.nombre} a la carta`, "exito")
    renderizarTragos()
    renderizarMenu()
}

function eliminarTrago(evento) {
    if (!evento.target.classList.contains("botonEliminar")) return

    const { id } = evento.target.dataset
    const tragoEliminado = tragosStock.find((trago) => trago.id === id)

    tragosStock = tragosStock.filter((trago) => trago.id !== id)
    guardar("tragos", tragosStock)

    mostrarMensaje(mensajeAdmin, `Se eliminó ${tragoEliminado?.nombre ?? "el trago"} de la carta`, "exito")
    renderizarTragos()
    renderizarMenu()
}

function restablecerBar() {
    localStorage.clear()

    tragosStock = crearCartaInicial()
    pedidos = []
    ingreso = false
    proximoId = 11

    inputBuscar.value = ""
    inputEdad.value = ""
    formIngreso.style.display = "flex"
    contenedorPedidos.innerHTML = ""
    contenedorCuenta.innerHTML = ""
    mostrarMensaje(mensajeIngreso, "Para ingresar debes decir tu edad. Hoy hay happy hour.", "")
    mostrarMensaje(mensajeAdmin, "Se restableció el bar", "exito")
    renderizarTragos()
}

botonAgregar.addEventListener("click", agregarTrago)
botonRestablecer.addEventListener("click", restablecerBar)
contenedorItems.addEventListener("click", eliminarTrago)
inputBuscar.addEventListener("keyup", renderizarTragos)


const obtenerDisponibles = () => tragosStock.filter((trago) => trago.hayStock())

const calcularTotal = (lista) => lista.reduce((acumulado, pedido) => acumulado + pedido.precio, 0)

function esMayorDeEdad (edad){
    ingreso = edad >= 18
}

function renderizarMenu() {
    if (!ingreso) return

    const disponibles = obtenerDisponibles()
    contenedorPedidos.innerHTML = ""

    if (disponibles.length === 0) {
        contenedorPedidos.innerHTML = `<p>No quedan tragos disponibles</p>`
        return
    }

    for (const { id, nombre, precio } of disponibles) {
        contenedorPedidos.innerHTML += `
            <div class="item">
                <h3>${nombre}</h3>
                <p>Precio: $${precio}</p>
                <button class="botonPedir" data-id="${id}" ${pedidos.length >= tragosMaximos ? "disabled" : ""}>Pedir</button>
            </div>
        `
    }
}

function renderizarCuenta() {
    const detalle = pedidos.map(({ nombre, precio }) => `<li>${nombre}: $${precio}</li>`).join("")
    contenedorCuenta.innerHTML = `
        <h3>Tu cuenta</h3>
        <ul>${detalle}</ul>
        <p>Total: $${calcularTotal(pedidos)}</p>
    `
}

function pedirTrago(evento) {
    if (!evento.target.classList.contains("botonPedir")) return
    if (pedidos.length >= tragosMaximos) return

    const tragoElegido = tragosStock.find((trago) => trago.id === evento.target.dataset.id)
    const { nombre, precio } = tragoElegido
    tragoElegido.vender(1)
    pedidos.push({ nombre, precio })
    guardar("tragos", tragosStock)
    guardar("pedidos", pedidos)

    const restantes = tragosMaximos - pedidos.length
    const aviso = restantes > 0 ? `Te quedan ${restantes} tragos` : `Ya pediste tus ${tragosMaximos} tragos`
    mostrarMensaje(mensajeIngreso, `Pediste ${nombre} por $${precio}. ${aviso}`, "exito")

    renderizarTragos()
    renderizarMenu()
    renderizarCuenta()
}

function mostrarBarAdentro() {
    formIngreso.style.display = "none"
    renderizarMenu()
    pedidos.length > 0 ? renderizarCuenta() : contenedorCuenta.innerHTML = ""
}

function ingresarAlBar() {
    if (inputEdad.value === "") {
        mostrarMensaje(mensajeIngreso, "Completá tu edad", "error")
        return
    }

    esMayorDeEdad(Number(inputEdad.value))
    guardar("ingreso", ingreso)

    if (!ingreso) {
        mostrarMensaje(mensajeIngreso, "Acceso denegado", "error")
        return
    }

    mostrarMensaje(mensajeIngreso, `Podés ingresar, tenés ${tragosMaximos} tragos.`, "exito")
    mostrarBarAdentro()
}

botonIngresar.addEventListener("click", ingresarAlBar)
contenedorPedidos.addEventListener("click", pedirTrago)

renderizarTragos()
if (ingreso) {
    mostrarMensaje(mensajeIngreso, `Bienvenido de nuevo. Pediste ${pedidos.length} de ${tragosMaximos} tragos.`, "exito")
    mostrarBarAdentro()
}
