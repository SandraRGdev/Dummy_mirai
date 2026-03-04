import http from 'http';

http.get('http://localhost:3000/api/img/800x600.png', (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk.length} bytes`);
  });
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});
