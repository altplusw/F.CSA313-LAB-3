const http = require('node:http');

let payments = 0;

function send(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
}

const handlers = {
  'POST /cart/add': (response) => send(response, 200, { items: 1 }),
  'GET /report': (response) => {
    const delay = 200 + Math.floor(Math.random() * 201);
    setTimeout(() => send(response, 200, { rows: 20000 }), delay);
  },
  'POST /pay': (response) => {
    payments += 1;
    if (payments % 20 === 0) {
      send(response, 500, { error: 'simulated payment failure' });
      return;
    }
    send(response, 200, { paid: true });
  },
};

http.createServer((request, response) => {
  const handle = handlers[request.method + ' ' + request.url];
  if (handle) {
    handle(response);
    return;
  }
  send(response, 404, { error: 'route not found' });
}).listen(3203, '127.0.0.1', () => console.log('Lab 3 API listening on port 3203'));
