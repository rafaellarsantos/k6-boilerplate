/**
 * 01. INICIALIZAÇÃO
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3333';
const P95_MS = Number(__ENV.P95_MS || 500);   // limite do p(95) em ms; endureça com P95_MS=50

/**
 * 02. CONFIGURAÇÕES
 */
export const options = {
  stages: [
    { duration: '30s', target: 10 },          // rampa de subida até 10 usuários
    { duration: '1m', target: 10 },           // platô: carga normal esperada
    { duration: '30s', target: 0 },           // rampa de descida
  ],
  thresholds: {                               // os critérios de aprovação do teste
    http_req_duration: [`p(95)<${P95_MS}`],   // 95% das requisições abaixo do limite
    http_req_failed: ['rate<0.01'],           // menos de 1% das requisições pode falhar
    checks: ['rate>0.99'],                    // mais de 99% das verificações precisam passar
  },
};

/**
 * 03. EXECUÇÃO
 */
export function setup() {
  return { inicio: new Date().toISOString() };
}

export default function () {
  const home = http.get(`${BASE_URL}/`);
  check(home, {
    'home: status 200': (r) => r.status === 200,
  });

  const res = http.post(`${BASE_URL}/api/pizza`,
    JSON.stringify({ maxCaloriesPerSlice: 1000 }),
    { headers: { 'Content-Type': 'application/json',
                 Authorization: 'token abcdef0123456789' } });
  check(res, {
    'pizza: status 200': (r) => r.status === 200,
    'pizza: tem nome': (r) => !!r.json('pizza.name'),
  });

  sleep(1);
}

/**
 * 04. DESMONTAGEM
 */
export function teardown(data) {
  console.log(`Teste iniciado em ${data.inicio}`);
}
