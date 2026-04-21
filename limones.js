// 🔹 VARIABLES DE ESTADO
let gatoX = 0;
let gatoY = 0;
let comidaX = 0;
let comidaY = 0;
let puntaje = 0;
let tiempo = 15;
let intervaloTiempo;
let juegoTerminado = false;
let hintMostrada = false; // Controla si el mensaje de ayuda ya se ocultó

// 🔹 CONSTANTES
const ANCHO_GATO = 50;
const ALTO_GATO = 50;
const ANCHO_COMIDA = 20;
const ALTO_COMIDA = 20;
const MOVER_GATO = 10;

// 🔹 REFERENCIAS AL DOM
const CANVAS = document.getElementById("areaJuego");
const CTX = CANVAS.getContext("2d");

// 🔹 FUNCIONES DE DIBUJO
function graficarRectangulo(x, y, ancho, alto, color) {
    CTX.fillStyle = color;
    CTX.fillRect(x, y, ancho, alto);
}

function graficarGato() {
    graficarRectangulo(gatoX, gatoY, ANCHO_GATO, ALTO_GATO, "orange");
}

function graficarComida() {
    graficarRectangulo(comidaX, comidaY, ANCHO_COMIDA, ALTO_COMIDA, "green");
}

// 🔹 INICIALIZACIÓN
function iniciarJuego() {
    // 1. Posicionar gato
    gatoX = generarAleatorio(0, CANVAS.width - ANCHO_GATO);
    gatoY = generarAleatorio(0, CANVAS.height - ALTO_GATO);

    // 2. Posicionar comida ASEGURANDO que no esté sobre el gato desde el inicio
    validarEspacioComida();

    // 3. Dibujar inmediatamente
    limpiarCanvas();
    graficarGato();
    graficarComida();

    // 4. Iniciar tiempo
    intervaloTiempo = setInterval(restarTiempo, 1000);
}

function limpiarCanvas() {
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
}

// 🔹 MOVIMIENTO
function moverIzquierda() {
    gatoX -= MOVER_GATO;
    limpiarCanvas();
    graficarGato();
    graficarComida();
    detectarColision();
}
function moverDerecha() {
    gatoX += MOVER_GATO;
    limpiarCanvas();
    graficarGato();
    graficarComida();
    detectarColision();
}
function moverArriba() {
    gatoY -= MOVER_GATO;
    limpiarCanvas();
    graficarGato();
    graficarComida();
    detectarColision();
}
function moverAbajo() {
    gatoY += MOVER_GATO;
    limpiarCanvas();
    graficarGato();
    graficarComida();
    detectarColision();
}

// 🔹 COLISIÓN Y LÓGICA PRINCIPAL
function detectarColision() {
    if (juegoTerminado) return; // 🚫 Bloquea lógica si ya ganó o perdió

    if (
        gatoX < comidaX + ANCHO_COMIDA &&
        gatoX + ANCHO_GATO > comidaX &&
        gatoY < comidaY + ALTO_COMIDA &&
        gatoY + ALTO_GATO > comidaY
    ) {
        mostrarNotificacion("🐱 ¡ÑAM! +1 punto");
        puntaje++;
        mostrarEnSpan("puntos", puntaje);

        // ✅ Condición de victoria exacta
        if (puntaje === 6) {
            juegoTerminado = true;
            clearInterval(intervaloTiempo);
            mostrarFinJuego(
                "🏆 ¡Felicidades, Ganaste!",
                `Puntaje final: ${puntaje}\n¡Eres un cazador experto!`
            );
            return;
        }

        // ✅ Reiniciar tiempo al comer
        tiempo = 15;
        mostrarEnSpan("tiempo", tiempo);

        // 🔄 Generar comida en posición VÁLIDA (nunca encima del gato)
        validarEspacioComida();

        limpiarCanvas();
        graficarGato();
        graficarComida();
    }
}

// 🔹 TEMPORIZADOR
function restarTiempo() {
    tiempo--;
    mostrarEnSpan("tiempo", tiempo);
    
    if (tiempo <= 0) {
        clearInterval(intervaloTiempo);
        juegoTerminado = true; // 🔒 Activa candado para evitar más colisiones
        mostrarFinJuego(
            "⏰ ¡Se acabó el tiempo!",
            `Puntaje final: ${puntaje}\n¡Inténtalo de nuevo!`
        );
    }
}

// 🔹 REINICIAR PARTIDA
function reiniciarJuego() {
    clearInterval(intervaloTiempo);
    juegoTerminado = false;
    hintMostrada = false; // 🔄 Reinicia estado del hint visual

    // Restaurar mensaje de ayuda
    const mensaje = document.getElementById("mensaje");
    if (mensaje) mensaje.classList.remove("hint-oculta");

    puntaje = 0;
    tiempo = 15;
    mostrarEnSpan("puntos", puntaje);
    mostrarEnSpan("tiempo", tiempo);

    limpiarCanvas();
    iniciarJuego();
}

// 🔹 CONTROLES DE TECLADO
document.addEventListener('keydown', (evento) => {
    // 💡 Ocultar hint en la primera pulsación de flecha
    if (!hintMostrada && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(evento.key)) {
        const mensaje = document.getElementById("mensaje");
        if (mensaje) mensaje.classList.add("hint-oculta");
        hintMostrada = true;
    }

    // Evitar scroll del navegador
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(evento.key)) {
        evento.preventDefault();
    }

    // Ejecutar movimiento
    switch (evento.key) {
        case 'ArrowLeft':  moverIzquierda(); break;
        case 'ArrowRight': moverDerecha();   break;
        case 'ArrowUp':    moverArriba();    break;
        case 'ArrowDown':  moverAbajo();     break;
    }
});

// 🔹 UI: NOTIFICACIÓN FLOTANTE
function mostrarNotificacion(mensaje) {
    const notif = document.getElementById("notificacion");
    notif.textContent = mensaje;
    notif.classList.add("mostrar");
    setTimeout(() => notif.classList.remove("mostrar"), 2000);
}

// 🔹 UI: MODAL DE FIN DE JUEGO
function mostrarFinJuego(titulo, mensaje) {
    document.getElementById("tituloModal").textContent = titulo;
    document.getElementById("mensajeModal").textContent = mensaje;
    document.getElementById("modalFinJuego").classList.add("activo");
}

// 🔹 UI: CERRAR MODAL Y REINICIAR
function cerrarModalYReiniciar() {
    document.getElementById("modalFinJuego").classList.remove("activo");
    reiniciarJuego();
}

function validarEspacioComida() {
    // Verificar que la comida no se genere sobre el gato
    do {
            comidaX = generarAleatorio(0, CANVAS.width - ANCHO_COMIDA);
            comidaY = generarAleatorio(0, CANVAS.height - ALTO_COMIDA);
        } while (
            comidaX < gatoX + ANCHO_GATO &&
            comidaX + ANCHO_COMIDA > gatoX &&
            comidaY < gatoY + ALTO_GATO &&
            comidaY + ALTO_COMIDA > gatoY
        );
}