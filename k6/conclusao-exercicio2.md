# Exercício 2: carga com critérios

Data: 24/11/2026. k6 v2.4.0, script `k6/carga.js`.

Perfil: rampa de 30s até 10 VUs, platô de 1min com 10 VUs, rampa de 30s até 0 (2min no total).

> Observação: o Docker não subiu nesta máquina (Virtual Machine Platform desativado),
> então o teste rodou com o k6 nativo do Windows contra o QuickPizza público
> (`BASE_URL=https://quickpizza.grafana.com`). Sem Prometheus, o Grafana não recebeu métricas;
> o acompanhamento ficou no painel do k6 e no `report.html`.

## Execução 1: critério normal `p(95)<500`, APROVADA (código de saída 0)

| Métrica | Resultado | Threshold |
|---|---|---|
| http_req_duration p(95) | 264,13ms | `p(95)<500`, passou |
| http_req_failed | 0,00% (0 de 1326) | `rate<0.01`, passou |
| checks | 100% (1989 de 1989) | `rate>0.99`, passou |
| http_req_duration | avg 190,75ms, med 170,77ms, p(90) 252,70ms, max 283,71ms | |
| vazão | 11,0 req/s, 663 iterações | |

Relatório: `k6/report.html` (gerado por esta execução).

## Execução 2: critério endurecido `p(95)<50`, REPROVADA (código de saída 99)

Comando: `P95_MS=50` no ambiente.

| Métrica | Resultado | Threshold |
|---|---|---|
| http_req_duration p(95) | 267,53ms | `p(95)<50`, falhou |
| http_req_failed | 0,00% (0 de 1318) | `rate<0.01`, passou |
| checks | 100% (1977 de 1977) | `rate>0.99`, passou |

O k6 saiu com código 99: "thresholds on metrics 'http_req_duration' have been crossed".

## Conclusão

- Com 10 usuários simultâneos o QuickPizza atendeu tudo sem erro e com p(95) de cerca de 265ms,
  bem dentro do critério de 500ms.
- O sistema se comportou igual nas duas execuções (p(95) de 264ms e 268ms, zero erros).
  O que mudou foi só o critério. Aprovar ou reprovar depende do threshold que o time define,
  então o threshold precisa vir de um requisito real, não de um número arbitrário.
- Com o threshold de 50ms, a reprovação aconteceu mesmo com 100% dos checks passando:
  o sistema respondia certo, só não rápido o bastante. Checks medem correção; thresholds de tempo medem desempenho.
- O código de saída 99 é o que permite usar o k6 num pipeline de CI: qualquer threshold violado quebra o build.
- O mínimo de cerca de 155ms em todas as requisições indica que boa parte do tempo é latência de rede até o
  servidor público. Contra o QuickPizza local (Docker) os tempos seriam bem menores, e o resultado de
  `p(95)<50` poderia ser outro. Vale repetir no ambiente local quando o Docker funcionar.
