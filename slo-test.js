import http from 'k6/http';
import { check, sleep } from 'k6';

const base = 'http://127.0.0.1:3203';

export function settings(reportLimit, duration = '1m') {
  return {
    vus: 20,
    duration,
    summaryTrendStats: ['avg', 'min', 'max', 'p(95)', 'p(99)'],
    thresholds: {
      'http_req_duration{name:cart}': ['p(95)<20'],
      'http_req_duration{name:report}': ['p(95)<' + reportLimit],
      'http_req_failed{name:pay}': ['rate<0.075'],
      checks: ['rate>=0.90'],
    },
  };
}

export default function () {
  const cart = http.post(base + '/cart/add', null, { tags: { name: 'cart' } });
  const report = http.get(base + '/report', { tags: { name: 'report' } });
  const pay = http.post(base + '/pay', null, { tags: { name: 'pay' } });

  check(cart, { 'cart returns 200': (response) => response.status === 200 });
  check(report, { 'report returns 200': (response) => response.status === 200 });
  check(pay, { 'payment returns 200': (response) => response.status === 200 });
  sleep(1);
}

export const options = settings(430, __ENV.MODE === 'chaos' ? '2m' : '1m');
