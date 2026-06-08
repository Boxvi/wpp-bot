const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { cargarServicios } = require('./servicios');
const { manejarMensaje } = require('./handlers');

// ─── CLIENTE WHATSAPP ────────────────────────────────────────────────────────
const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'bot-esoterismo' }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

// ─── EVENTOS ─────────────────────────────────────────────────────────────────
client.on('qr', (qr) => {
    console.log('\n📱 Escanea este código QR con WhatsApp:\n');
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('✅ Autenticado correctamente');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Error de autenticación:', msg);
});

client.on('ready', async () => {
    console.log('🔮 Bot de Esoterismo listo y escuchando mensajes...');
    await cargarServicios(); // Carga el Excel al iniciar
});

client.on('message', async (msg) => {
    // Ignorar mensajes de grupos y mensajes propios
    if (msg.isGroupMsg || msg.fromMe) return;
    await manejarMensaje(client, msg);
});

client.on('disconnected', (reason) => {
    console.log('⚠️  Bot desconectado:', reason);
    // Reintentar conexión automáticamente
    setTimeout(() => client.initialize(), 5000);
});

// ─── INICIAR ─────────────────────────────────────────────────────────────────
console.log('🌙 Iniciando Bot de Esoterismo...');
client.initialize();
