const { generarMenuServicios, obtenerTodosLosServicios, recargarServicios } = require('./servicios');

// ─── ESTADO DE CONVERSACIÓN POR USUARIO ─────────────────────────────────────
// Guarda en qué paso del flujo está cada usuario
const estados = new Map();

// Estados posibles
const ESTADO = {
    INICIO: 'inicio',
    ESPERANDO_SELECCION: 'esperando_seleccion',
    ESPERANDO_CONFIRMACION: 'esperando_confirmacion',
};

// Número de la consultora (para reenviar pedidos) — cambia por el tuyo
const NUMERO_CONSULTORA = process.env.NUMERO_CONSULTORA || '593XXXXXXXXX@c.us';

// ─── MENSAJES FIJOS ──────────────────────────────────────────────────────────
const MSG_BIENVENIDA = (nombre) =>
    `🌟 ¡Bienvenid@ ${nombre}! 🌟\n\n` +
    `Soy tu guía espiritual en el mundo del esoterismo. ✨\n\n` +
    `Aquí encontrarás:\n` +
    `🃏 Lecturas de Tarot\n` +
    `🔮 Servicios Esotéricos\n` +
    `💫 Consultas Espirituales\n\n` +
    `Escribe *"menu"* para ver todos mis servicios\n` +
    `o simplemente cuéntame qué necesitas. 🙏`;

const MSG_CONTACTO =
    `📞 *CONTACTO DIRECTO*\n\n` +
    `Para consultas personalizadas o pagos, puedes contactarme directamente.\n\n` +
    `💳 *Formas de pago:*\n` +
    `• Transferencia bancaria\n` +
    `• PayPal\n` +
    `• Nequi / Daviplata\n` +
    `• Western Union\n\n` +
    `Una vez realizado el pago, envíame el comprobante y coordinaremos tu sesión. 🌙`;

const MSG_NO_ENTIENDO =
    `🌙 No entendí bien tu mensaje.\n\n` +
    `Puedes escribir:\n` +
    `• *"menu"* → Ver todos los servicios\n` +
    `• *"contacto"* → Información de pago\n` +
    `• *"hola"* → Iniciar de nuevo\n\n` +
    `¿En qué puedo ayudarte? ✨`;

// ─── FUNCIÓN PRINCIPAL ───────────────────────────────────────────────────────
async function manejarMensaje(client, msg) {
    const from = msg.from;
    const texto = msg.body.trim().toLowerCase();
    const contact = await msg.getContact();
    const nombre = contact.pushname || contact.name || 'querida alma';

    // Obtener o crear estado del usuario
    if (!estados.has(from)) {
        estados.set(from, { paso: ESTADO.INICIO, servicioSeleccionado: null });
    }
    const estado = estados.get(from);

    // Simular "escribiendo..." para una experiencia más humana
    const chat = await msg.getChat();
    await chat.sendStateTyping();
    await esperar(800);

    // ─── COMANDOS GLOBALES (funcionan en cualquier estado) ───────────────
    if (['hola', 'hi', 'hello', 'buenas', 'buenos días', 'buenas tardes', 'buenas noches', 'inicio', 'start'].some(s => texto.includes(s))) {
        estados.set(from, { paso: ESTADO.ESPERANDO_SELECCION, servicioSeleccionado: null });
        await msg.reply(MSG_BIENVENIDA(nombre));
        await esperar(500);
        await msg.reply(generarMenuServicios());
        return;
    }

    if (['menu', 'menú', 'servicios', 'ver servicios', 'catalogo', 'catálogo', 'precios'].some(s => texto.includes(s))) {
        estados.set(from, { paso: ESTADO.ESPERANDO_SELECCION, servicioSeleccionado: null });
        await msg.reply(generarMenuServicios());
        return;
    }

    if (['contacto', 'pago', 'pagar', 'como pago', 'cómo pago', 'formas de pago'].some(s => texto.includes(s))) {
        await msg.reply(MSG_CONTACTO);
        return;
    }

    // Comando oculto para recargar el Excel sin reiniciar (útil para el admin)
    if (texto === '!recargar' && from === NUMERO_CONSULTORA) {
        await recargarServicios();
        await msg.reply('✅ Servicios recargados desde el Excel correctamente.');
        return;
    }

    // ─── FLUJO: SELECCIÓN DE SERVICIO ────────────────────────────────────
    if (estado.paso === ESTADO.INICIO || estado.paso === ESTADO.ESPERANDO_SELECCION) {
        const servicios = obtenerTodosLosServicios();

        // Buscar por número
        const numero = parseInt(texto);
        if (!isNaN(numero) && numero >= 1 && numero <= servicios.length) {
            const servicio = servicios[numero - 1];
            estado.servicioSeleccionado = servicio;
            estado.paso = ESTADO.ESPERANDO_CONFIRMACION;
            estados.set(from, estado);

            await msg.reply(
                `✨ Excelente elección!\n\n` +
                `Has seleccionado:\n` +
                `🔮 *${servicio.nombre}*\n` +
                `💰 Precio: *$${servicio.precio} USD*\n\n` +
                `¿Confirmas tu solicitud?\n` +
                `Escribe *"sí"* para confirmar o *"no"* para volver al menú.`
            );
            return;
        }

        // Buscar por nombre parcial
        const servicioEncontrado = servicios.find(s =>
            s.nombre.toLowerCase().includes(texto) ||
            texto.includes(s.nombre.toLowerCase().split(' ')[0])
        );

        if (servicioEncontrado) {
            estado.servicioSeleccionado = servicioEncontrado;
            estado.paso = ESTADO.ESPERANDO_CONFIRMACION;
            estados.set(from, estado);

            await msg.reply(
                `✨ Encontré este servicio para ti:\n\n` +
                `🔮 *${servicioEncontrado.nombre}*\n` +
                `💰 Precio: *$${servicioEncontrado.precio} USD*\n\n` +
                `¿Confirmas tu solicitud?\n` +
                `Escribe *"sí"* para confirmar o *"no"* para volver al menú.`
            );
            return;
        }

        // Si no seleccionó nada concreto, mostrar menú o mensaje de ayuda
        if (estado.paso === ESTADO.INICIO) {
            estados.set(from, { paso: ESTADO.ESPERANDO_SELECCION, servicioSeleccionado: null });
            await msg.reply(MSG_BIENVENIDA(nombre));
            await esperar(500);
            await msg.reply(generarMenuServicios());
        } else {
            await msg.reply(MSG_NO_ENTIENDO);
        }
        return;
    }

    // ─── FLUJO: CONFIRMACIÓN ─────────────────────────────────────────────
    if (estado.paso === ESTADO.ESPERANDO_CONFIRMACION) {
        const servicio = estado.servicioSeleccionado;

        if (['si', 'sí', 'yes', 'confirmo', 'confirmar', 'ok', 'dale', 'quiero'].some(s => texto.includes(s))) {
            // Notificar a la consultora
            await notificarConsultora(client, from, nombre, servicio);

            // Responder al cliente
            await msg.reply(
                `🌟 *¡Solicitud confirmada!* 🌟\n\n` +
                `✅ Has solicitado: *${servicio.nombre}*\n` +
                `💰 Total: *$${servicio.precio} USD*\n\n` +
                `📋 *Pasos a seguir:*\n` +
                `1️⃣ Realiza el pago por cualquiera de nuestros medios\n` +
                `2️⃣ Envíame el comprobante de pago\n` +
                `3️⃣ Coordinaremos tu sesión 🔮\n\n` +
                `Escribe *"contacto"* para ver las formas de pago.\n\n` +
                `¡Gracias por confiar en nosotros! 🙏✨`
            );

            // Resetear estado
            estados.set(from, { paso: ESTADO.ESPERANDO_SELECCION, servicioSeleccionado: null });
            return;
        }

        if (['no', 'cancelar', 'volver', 'atras', 'atrás', 'menu'].some(s => texto.includes(s))) {
            estados.set(from, { paso: ESTADO.ESPERANDO_SELECCION, servicioSeleccionado: null });
            await msg.reply('↩️ De acuerdo, volvemos al menú principal.\n\n' + generarMenuServicios());
            return;
        }

        // No entendió la respuesta de confirmación
        await msg.reply(
            `Por favor responde *"sí"* para confirmar tu solicitud\n` +
            `o *"no"* para volver al menú. 🌙`
        );
        return;
    }

    // ─── FALLBACK ─────────────────────────────────────────────────────────
    await msg.reply(MSG_NO_ENTIENDO);
}

// ─── NOTIFICAR A LA CONSULTORA ───────────────────────────────────────────────
async function notificarConsultora(client, clienteId, nombreCliente, servicio) {
    try {
        const mensaje =
            `🔔 *NUEVA SOLICITUD*\n\n` +
            `👤 Cliente: ${nombreCliente}\n` +
            `📱 Número: ${clienteId.replace('@c.us', '')}\n` +
            `🔮 Servicio: ${servicio.nombre}\n` +
            `💰 Precio: $${servicio.precio} USD\n` +
            `🕐 Hora: ${new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil' })}`;

        await client.sendMessage(NUMERO_CONSULTORA, mensaje);
    } catch (err) {
        console.error('⚠️  No se pudo notificar a la consultora:', err.message);
    }
}

// ─── UTILIDADES ──────────────────────────────────────────────────────────────
function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { manejarMensaje };