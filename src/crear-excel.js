/**
 * Ejecuta este script UNA VEZ para crear el archivo servicios.xlsx de ejemplo.
 * Luego edítalo con Excel/LibreOffice con tus servicios reales.
 * 
 * Uso: node crear-excel.js
 */

const XLSX = require('xlsx');

const serviciosEjemplo = [
    { Servicio: 'Amarre de amor',                 Precio: 300  },
    { Servicio: 'Corte de amarres',               Precio: 150  },
    { Servicio: 'Limpia energética',              Precio: 80   },
    { Servicio: 'Ritual de prosperidad',          Precio: 120  },
    { Servicio: 'Hechizo de protección',          Precio: 100  },
    { Servicio: 'Endulzamiento',                  Precio: 90   },
    { Servicio: 'Aleja personas negativas',       Precio: 130  },
    { Servicio: 'Unión de parejas',               Precio: 250  },
    { Servicio: 'Dominio y sometimiento',         Precio: 200  },
    { Servicio: 'Apertura de caminos',            Precio: 110  },
];

const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(serviciosEjemplo);

// Ajustar ancho de columnas
worksheet['!cols'] = [{ wch: 35 }, { wch: 10 }];

XLSX.utils.book_append_sheet(workbook, worksheet, 'Servicios');
XLSX.writeFile(workbook, 'servicios.xlsx');

console.log('✅ Archivo servicios.xlsx creado con éxito.');
console.log('📝 Ábrelo con Excel o LibreOffice y edita los servicios y precios a tu gusto.');
console.log('⚠️  Las columnas deben llamarse exactamente "Servicio" y "Precio".');