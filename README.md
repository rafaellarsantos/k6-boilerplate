# QuickPizza Lab: testes de performance com k6, Prometheus e Grafana

Laboratório local do Módulo 06. O **k6** gera a carga contra o **QuickPizza**; as métricas vão para o
**Prometheus** e aparecem no **Grafana**. A **ServeRest** entra no trabalho final.

## Endereços

| Serviço | URL |
|---|---|
| QuickPizza (alvo dos exercícios) | http://localhost:3333 |
| Grafana (painel, sem login) | http://localhost:3001 |
| Prometheus | http://localhost:9090 |
| Painel web do k6 | http://localhost:5665 (só durante um teste) |
| ServeRest (trabalho final) | http://localhost:3000 e http://localhost:3000/status |

## Subir e desligar

```bash
docker compose up -d
```

```bash
docker compose down
```

A ServeRest só sobe quando chamada pelo nome:

```bash
docker compose up -d serverest
```

## Scripts

| Script | Tipo | Encontro |
|---|---|---|
| `k6/fumaca.js` | Fumaça: 1 usuário, 30 s | 1, Exercício 1 |
| `k6/carga.js` | Carga: rampa até 10 usuários, 2 min (`P95_MS` ajusta o limite do p(95), padrão 500) | 1, Exercício 2 |

Executar (Linux e macOS; no Windows PowerShell troque a `\` do fim da linha pela crase `` ` ``):

```bash
docker compose run --rm --service-ports k6 \
  run -o experimental-prometheus-rw /scripts/fumaca.js
```

O relatório HTML de cada execução é gravado em `k6/report.html` (sobrescrito a cada teste).


## Cuidados

- **O comando não termina com o painel do k6 aberto.** Se a aba de http://localhost:5665 estiver aberta no navegador,
  o k6 termina o teste mas fica esperando ela fechar antes de mostrar o resumo e encerrar. Feche a aba (ou não a abra)
  e o comando termina sozinho. Interromper com Ctrl+C nesse ponto pode deixar o resumo e o `report.html` sem gravar.
- **Reinicie o QuickPizza entre exercícios pesados** (`docker compose restart quickpizza`). Depois de um estresse, ele leva algum tempo para voltar ao normal, e o resultado do teste seguinte fica contaminado.
- **Espere o painel zerar entre testes.** O Grafana calcula percentis por janela de tempo, mas os usuários virtuais continuam aparecendo por alguns minutos depois do fim de um teste.
