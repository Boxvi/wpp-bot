const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Create a new client instance
const client = new Client();

// Cuando el cliente esté listo
client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});


// Detectar cuando se envía un mensaje
client.on('message', async (message) => {
    const messageBody = message.body.toLowerCase(); // Convertir el mensaje a minúsculas

    if(messageBody.includes('hola')){
        message.reply('¡Hola, te habla Boris! En este momento no me encuentro disponible, pero dime ¿Qué te gustaría hacer?');
    }

    
    if (message.body === 'ping') {
        message.reply('pong');
    }

});


client.initialize();


/*

    // Manejo de estado
    const userId = message.from;
    if (!userStates[userId]) {
        userStates[userId] = 'waiting_for_options';
    }

    if (messageBody.includes('hola')) {
        // Crear los botones interactivos usando un template de mensaje
        const buttons = {
            buttonText: 'Selecciona una opción',
            buttons: [
                { id: 'option1', text: 'Opción 1' },
                { id: 'option2', text: 'Opción 2' },
                { id: 'option3', text: 'Opción 3' }
            ]
        };

        // Enviar el mensaje con botones al contacto que envió el mensaje
        await client.sendMessage(message.from, {
            body: '¡Hola, te habla Boris! En este momento no me encuentro disponible, pero dime ¿Qué te gustaría hacer?',
            ...buttons
        });
    }

// Detectar cuando se envía un mensaje
client.on('message', async (message) => {
    const messageBody = message.body.toLowerCase(); // Convertir el mensaje a minúsculas

    // Manejo de estado
    const userId = message.from;
    if (!userStates[userId]) {
        userStates[userId] = 'waiting_for_options';
    }

    switch (userStates[userId]) {
        case 'waiting_for_options':
            if (messageBody.includes('hola')) {
                const response = `
¡Hola, te habla Boris! En este momento no me encuentro disponible, pero dime ¿Qué te gustaría hacer?

1. Opción 1
2. Opción 2
3. Opción 3

Responde con el número de tu opción.
        `;
        await client.sendMessage(message.from, response);
            }



            break;

        case 'waiting_for_selection':
            break;
    }


    // Si el usuario envía "hola", responder con un mensaje que simula botones
    if (messageBody === 'hola') {
        const response = `
¡Hola, te habla Boris! En este momento no me encuentro disponible, pero dime ¿Qué te gustaría hacer?
1. Opción 1
2. Opción 2
3. Opción 3
Responde con el número de tu opción.
        `;
        await client.sendMessage(message.from, response);
    }

    // Manejar las respuestas del usuario
    if (messageBody === '1') {
        message.reply('Has seleccionado la Opción 1');
    } else if (messageBody === '2') {
        message.reply('Has seleccionado la Opción 2');
    } else if (messageBody === '3') {
        message.reply('Has seleccionado la Opción 3');
    }


    if (message.body === 'ping') {
        message.reply('pong');
    }

    console.log('Client is ready!');
});

// When the client received QR-Code

*/
// Start your client