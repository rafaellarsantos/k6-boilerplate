# Exercício 1: fumaça no QuickPizza

Data: 24/11/2026. k6 v2.4.0, 1 VU, 30s, script `k6/fumaca.js`.

> Observação: o Docker não subiu nesta máquina (Virtual Machine Platform desativado),
> então o teste rodou com o k6 nativo do Windows contra o QuickPizza público
> (`BASE_URL=https://quickpizza.grafana.com`), sem envio ao Prometheus.

## Execução 1: token correto (`token abcdef0123456789`), APROVADA

| Métrica | Resultado | Threshold |
|---|---|---|
| checks | 100% (66 de 66) | `rate==1`, passou |
| http_req_failed | 0,00% (0 de 44) | `rate<0.01`, passou |
| http_req_duration | avg 188,69ms, med 166,81ms, p(90) 246,75ms, p(95) 259,35ms, max 263,63ms | sem threshold |
| iterações | 22 | |

Relatório: `k6/report.html` (gerado por esta execução).

## Execução 2: token quebrado (`token abc`), REPROVADA

| Métrica | Resultado | Threshold |
|---|---|---|
| checks | 33,33% (23 de 69) | `rate==1`, falhou |
| http_req_failed | 50,00% (23 de 46) | `rate<0.01`, falhou |
| http_req_duration | avg 161,49ms, p(95) 167,78ms | sem threshold |

- `home: status 200` passou em todas as iterações, porque a home não exige token.
- `pizza: status 200` e `pizza: tem nome` falharam em 23 de 23, porque a API recusou o token.
- O k6 saiu com código 99: "thresholds on metrics 'checks, http_req_failed' have been crossed".

## O que aprendi

- Os thresholds são o critério de aprovação: se algum for violado, o k6 sai com código diferente de 0 e o pipeline reprova.
- `http_req_failed` conta respostas de erro (4xx/5xx), não só falhas de rede.
- O tempo de resposta continuou bom no teste quebrado. Ser rápido não significa estar certo; quem pegou o problema foram os checks.
