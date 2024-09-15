const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const clients = new Map();

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        console.log('Received message:', message);
        ws.send(message)
        try {
            const data = JSON.parse(message);

            if (data.action === 'register') {
                if (data.type === 'ecran' && data.idCentre) {
                    clients.set(ws, { type: 'ecran', idCentre: data.idCentre });
                    ws.send(JSON.stringify({ action: 'register', code: 200, message: 'Client écran enregistré avec idCentre: ' + data.idCentre }));
                } else if (data.type === 'borne' && data.idCentre) {
                    clients.set(ws, { type: 'borne', idCentre: data.idCentre });
                    ws.send(JSON.stringify({ action: 'register', code: 200, message: 'Client borne enregistré avec idCentre: ' + data.idCentre }));
                } else if (data.type === 'appli_med' && data.idCentre && data.idMedecin) {
                    clients.set(ws, { type: 'appli_med', idCentre: data.idCentre, idMedecin: data.idMedecin });
                    ws.send(JSON.stringify({ action: 'register', code: 200, message: `Client appli med enregistré avec idCentre: ${data.idCentre} et idMedecin: ${data.idMedecin}` }));
                } else {
                    ws.send(JSON.stringify({ action: 'register', code: 400, message: 'Erreur: Informations d\'enregistrement incorrectes' }));
                }
            } else if (data.action === 'updateAgenda') {
                if (data.idCentre) {
                    clients.forEach((clientData, clientWs) => {
                        if (clientData.type === 'borne' && clientData.idCentre === data.idCentre) {
                            clientWs.send(JSON.stringify({ action: 'updateAgenda', code: 200, message: 'Agenda mis à jour pour idCentre: ' + data.idCentre }));
                        }
                    });
                } else {
                    ws.send(JSON.stringify({ action: 'updateAgenda', code: 400, message: 'Erreur: idCentre manquant pour la mise à jour' }));
                }
            } else {
                ws.send(JSON.stringify({ action: 'error', code: 400, message: 'Erreur: Action inconnue' }));
            }
        } catch (error) {
            ws.send(JSON.stringify({ action: 'error', code: 500, message: 'Erreur: Message invalide' }));
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected');
    });
});

server.listen(8080, () => {
    console.log('HTTP server is listening on port 8080');
});