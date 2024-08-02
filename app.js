const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const SerialPort = require('serialport');
const parsers = SerialPort.parsers;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const parser = new parsers.Readline({ delimiter: '\r\n' });

let port;
try {
  port = new SerialPort('/dev/cu.usbmodem1301', {
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false
  });

  port.pipe(parser);

  port.on('open', () => {
    console.log('Serial Port Opened');
  });

  port.on('error', function (err) {
    console.error('Serial port error:', err.message);
  });

} catch (err) {
  console.error('Failed to open serial port:', err.message);
}

io.on('connection', (socket) => {
  console.log('A client connected.');

  socket.on('toggle', (data) => {
    console.log('Received toggle command:', data);
    if (data === '1') {
      port.write(data, (err) => {
        if (err) {
          console.error('Error writing to serial port:', err.message);
        }
      }); // Turn on the LED immediately
      setTimeout(() => {
        port.write('0', (err) => {
          if (err) {
            console.error('Error writing to serial port:', err.message);
          }
        }); // Turn off the LED after 10 seconds
      }, 10000);
    } else if (data === '0') {
      port.write(data, (err) => {
        if (err) {
          console.error('Error writing to serial port:', err.message);
        }
      }); // Turn off the LED immediately
    }
  });

  socket.on('disconnect', () => {
    console.log('A client disconnected.');
  });
});

app.use(express.static(__dirname)); // Serve static files

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});