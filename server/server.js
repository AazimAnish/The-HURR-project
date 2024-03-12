// Importing required modules
const express = require('express');
const cors = require('cors');
const http = require('http');
const { SocksClient } = require('socks');

// Create an instance of Express
const app = express();
app.use(cors());

// Define a port number
const PORT = 3000;

// Tor SOCKS proxy configuration
const torSocksConfig = {
  proxy: {
    ipaddress: '127.0.0.1', // Tor's default SOCKS proxy IP
    port: 9050, // Tor's default SOCKS proxy port
    type: 5 // SOCKS5
  },
  command: 'connect',
  destination: {
    host: 'localhost', // Replace with the target hostname
    port: 3000 // Replace with the target port
  }
};

// Define a route
app.get('/', async (req, res) => {
  try {
    // Establish a connection through the Tor SOCKS proxy
    const { socket } = await SocksClient.createConnection(torSocksConfig);

    // Send the HTTP request through the SOCKS proxy
    const httpRequest = http.request({
      socket: socket,
      path: '/' // Replace with the target path
    }, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        res.send(data); // Send the response from the target server to the client
      });
    });

    // Handle errors
    httpRequest.on('error', (error) => {
      console.error('Error occurred:', error);
      res.status(500).send('Error occurred');
    });

    httpRequest.end();
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).send('Error occurred');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
