const XLSX = require('xlsx');
const path = require('path');

// Servicios fijos de tarot (definidos en código)
const SERVICIOS_TAROT = [
    { nombre: '1 Pregunta de Tarot',    precio: 3,   clave: 'tarot_1' },
    { nombre: '2 Preguntas de Tarot',   precio: 5,   clave: 'tarot_2' },
    { nombre: '4 Preguntas de Tarot',   precio: 10,  clave: 'tarot_4' },
    { nombre: 'Video Llamada (Tarot)',   precio: 20,  clave: 'videollamada' },
];

// Servicios esotéricos adicionales (se cargan del Excel)
let serviciosEsotericos = [];

/**
 * Carga los servicios esotéricos desde el archivo Excel.
 * El Excel debe tener columnas: "Servicio" y "Precio"
 */
async function cargarServicios() {
    const archivoExcel = path.join(__dirname, 'servicios.xlsx');
    try {
        const workbook = XLSX.readFile(archivoExcel);
        const hoja = workbook.Sheets[workbook.SheetNames[0]];
        const filas = XLSX.utils.sheet_to_json(hoja);

        serviciosEsotericos = filas
            .filter(f => f['Servicio'] && f['Precio'])
            .map((f, i) => ({
                nombre: String(f['Servicio']).trim(),
                precio: parseFloat(f['Precio']),
                clave: `esoterico_${i}`
            }));

        console.log(`📊 Excel cargado: ${serviciosEsotericos.length} servicios esotéricos encontrados`);
        serviciosEsotericos.forEach(s => console.log(`   • ${s.nombre} → $${s.precio} USD`));
    } catch (err) {
        console.warn('⚠️  No se pudo cargar servicios.xlsx. Solo estarán disponibles los servicios de tarot.');
        console.warn('   Asegúrate de que el archivo exista con columnas "Servicio" y "Precio".');
    }
}

/**
 * Recarga el Excel en caliente (útil si actualizas precios sin reiniciar el bot)
 */
async function recargarServicios() {
    await cargarServicios();
}

/**
 * Devuelve todos los servicios disponibles (tarot + esotéricos del Excel)
 */
function obtenerTodosLosServicios() {
    return [...SERVICIOS_TAROT, ...serviciosEsotericos];
}

/**
 * Genera el texto del menú de servicios
 */
function generarMenuServicios() {
    let menu = '🔮 *SERVICIOS DISPONIBLES* 🔮\n\n';

    menu += '✨ *LECTURA DE TAROT*\n';
    SERVICIOS_TAROT.forEach((s, i) => {
        menu += `   ${i + 1}. ${s.nombre} → *$${s.precio} USD*\n`;
    });

    if (serviciosEsotericos.length > 0) {
        menu += '\n🌙 *SERVICIOS ESOTÉRICOS*\n';
        serviciosEsotericos.forEach((s, i) => {
            menu += `   ${SERVICIOS_TAROT.length + i + 1}. ${s.nombre} → *$${s.precio} USD*\n`;
        });
    }

    menu += '\n💫 Para contratar un servicio escribe su *número* o el *nombre del servicio*.\n';
    menu += '📞 Para más información escribe *"contacto"*.';
    return menu;
}

module.exports = { cargarServicios, recargarServicios, obtenerTodosLosServicios, generarMenuServicios };