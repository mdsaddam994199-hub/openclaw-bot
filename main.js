const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');

const OWNER_NUMBER = '8801831519941';

async function startSock() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const sock = makeWASocket({ auth: state, printQRInTerminal: true });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) console.log('QR CODE: Scan this with WhatsApp > Linked Devices');
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode!== DisconnectReason.loggedOut;
            if (shouldReconnect) startSock();
        } else if (connection === 'open') {
            console.log('✅ Open Crow Bot Connected!');
            sock.sendMessage(OWNER_NUMBER + '@s.whatsapp.net', { text: 'ওপেন ক্রো বট অনলাইন ✅' });
        }
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('messages.up', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        if (text === '!ping') {
            await sock.sendMessage(from, { text: 'Pong! ওপেন ক্রো জেগে আছে 🐦‍⬛' });
        }
    });
}
startSock();
