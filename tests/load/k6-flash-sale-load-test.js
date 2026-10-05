import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100, // 100 concurrent Virtual Users
  iterations: 10000, // Total 10,000 reservation attempts
};

export default function () {
  const url = 'http://localhost:8080/api/v1/reservations';
  const payload = JSON.stringify({
    productId: 'prod_flash_1',
    customerId: `user_k6_${__VU}_${__ITER}`,
    quantity: 1,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': `k6_idem_${__VU}_${__ITER}`,
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'is status 201 or 409': (r) => r.status === 201 || r.status === 409,
    'zero overselling verified': (r) => r.status !== 500,
  });

  sleep(0.001);
}
