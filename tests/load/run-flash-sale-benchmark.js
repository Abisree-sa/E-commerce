const http = require('http');

const TOTAL_REQUESTS = 10000;
const CONCURRENCY = 100;

console.log('=================================================================');
console.log('      SALESTORM NODE.JS HIGH-CONCURRENCY BENCHMARK RUNNER        ');
console.log('=================================================================');
console.log(`Firing ${TOTAL_REQUESTS} simultaneous HTTP POST /reservations requests...`);

let completed = 0;
let successCount = 0;
let outOfStockCount = 0;
let errorCount = 0;

const startTime = Date.now();

function sendReservation(index) {
  const data = JSON.stringify({
    productId: 'prod_flash_1',
    customerId: `user_cli_${index}`,
    quantity: 1,
  });

  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/reservations',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': `cli_idem_${index}_${Math.random().toString(36).substring(2, 6)}`,
      'Content-Length': Buffer.byteLength(data),
    },
  };

  const req = http.request(options, (res) => {
    if (res.statusCode === 201) successCount++;
    else if (res.statusCode === 409) outOfStockCount++;
    else errorCount++;

    completed++;
    if (completed === TOTAL_REQUESTS) {
      const duration = Date.now() - startTime;
      console.log('=================================================================');
      console.log('                  BENCHMARK RESULTS REPORT                       ');
      console.log('=================================================================');
      console.log(`Total Requests:            ${TOTAL_REQUESTS}`);
      console.log(`Successful Reservations:   ${successCount}`);
      console.log(`Out of Stock (409):        ${outOfStockCount}`);
      console.log(`Errors:                    ${errorCount}`);
      console.log(`Total Time:                ${duration} ms`);
      console.log(`Throughput:                ${Math.round((TOTAL_REQUESTS / duration) * 1000)} req/sec`);
      console.log(`Oversold Count:            ${successCount > 100 ? successCount - 100 : 0}`);
      console.log('=================================================================');
    }
  });

  req.on('error', (e) => {
    errorCount++;
    completed++;
  });

  req.write(data);
  req.end();
}

for (let i = 0; i < TOTAL_REQUESTS; i++) {
  sendReservation(i);
}
