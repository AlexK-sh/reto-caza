// 🔹 VARIABLES DE ESTADO
let gatoX = 0;
let gatoY = 0;
let comidaX = 0;
let comidaY = 0;
let puntaje = 0;
let tiempo = 15;
let intervaloTiempo;
let timeRest = 15;
let juegoTerminado = false;
let hintMostrada = false; // Controla si el mensaje de ayuda ya se ocultó

// 🔹 SPRITES
let gatoSprites = {};
let comidaSprite;
let gatoSpriteActual = 'idle';

// 🔹 CONSTANTES
const ANCHO_GATO = 50;
const ALTO_GATO = 50;
const ANCHO_COMIDA = 20;
const ALTO_COMIDA = 20;
const MOVER_GATO = 10;

// 🔹 REFERENCIAS AL DOM
const CANVAS = document.getElementById("areaJuego");
const CTX = CANVAS.getContext("2d");

// 🔹 CARGAR SPRITES
function cargarSprites() {
    return new Promise((resolve) => {
        let loaded = 0;
        const total = 6; // 5 sprites del gato + 1 comida

        const checkLoaded = () => {
            loaded++;
            if (loaded === total) resolve();
        };

        gatoSprites.idle = new Image();
        gatoSprites.idle.onload = checkLoaded;
        gatoSprites.idle.src = 'assets/gato_idle.png';

        gatoSprites.up = new Image();
        gatoSprites.up.onload = checkLoaded;
        gatoSprites.up.src = 'assets/gato_up.png';

        gatoSprites.down = new Image();
        gatoSprites.down.onload = checkLoaded;
        gatoSprites.down.src = 'assets/gato_down.png';

        gatoSprites.left = new Image();
        gatoSprites.left.onload = checkLoaded;
        gatoSprites.left.src = 'assets/gato_left.png';

        gatoSprites.right = new Image();
        gatoSprites.right.onload = checkLoaded;
        gatoSprites.right.src = 'assets/gato_right.png';

        comidaSprite = new Image();
        comidaSprite.onload = checkLoaded;
        comidaSprite.src = 'assets/comida.png';
    });
}

// 🔹 FUNCIONES DE DIBUJO
function graficarRectangulo(x, y, ancho, alto, color) {
    CTX.fillStyle = color;
    CTX.fillRect(x, y, ancho, alto);
}

function graficarGato() {
    if (gatoSprites[gatoSpriteActual]) {
        CTX.drawImage(gatoSprites[gatoSpriteActual], gatoX, gatoY, ANCHO_GATO, ALTO_GATO);
    } else {
        // Fallback a rectángulo si no se carga
        graficarRectangulo(gatoX, gatoY, ANCHO_GATO, ALTO_GATO, "orange");
    }
}

function graficarComida() {
    if (comidaSprite) {
        CTX.drawImage(comidaSprite, comidaX, comidaY, ANCHO_COMIDA, ALTO_COMIDA);
    } else {
        graficarRectangulo(comidaX, comidaY, ANCHO_COMIDA, ALTO_COMIDA, "green");
    }
}

// 🔹 INICIALIZACIÓN
async function iniciarJuego() {
    await cargarSprites();

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
    gatoSpriteActual = 'left';
    gatoX -= MOVER_GATO;
    limpiarCanvas();
    graficarGato();
    graficarComida();
    detectarColision();
}
function moverDerecha() {
    gatoSpriteActual = 'right';
    gatoX += MOVER_GATO;
    limpiarCanvas();
    graficarGato();
    graficarComida();
    detectarColision();
}
function moverArriba() {
    gatoSpriteActual = 'up';
    gatoY -= MOVER_GATO;
    limpiarCanvas();
    graficarGato();
    graficarComida();
    detectarColision();
}
function moverAbajo() {
    gatoSpriteActual = 'down';
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
        tiempo = timeRest;
        timeRest = timeRest - 1
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
    gatoSpriteActual = 'idle'; // 🔄 Reinicia sprite del gato

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