import {handler} from './build/handler.js';
import express from 'express';
import https from 'https';
import fs from 'node:fs';
import * as http from 'node:http';

const privateKey = fs.readFileSync('./certs/privkey1.pem', 'utf8');
const certificate = fs.readFileSync('./certs/fullchain1.pem', 'utf8');
const credentials = {key: privateKey, cert: certificate};

const app = express();

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

const PORT = 80;
const SSLPORT = 443;

httpServer.listen(PORT, function() {
	console.log('HTTP Server is running on port', PORT)
})

httpsServer.listen(SSLPORT, function () {
	console.log('HTTPS Server is running on port', SSLPORT);
});

// add a route that lives separately from the SvelteKit app
app.get('/healthcheck', (req, res) => {
	res.end('ok');
});

// let SvelteKit handle everything else, including serving prerendered pages and static assets
app.use(handler);