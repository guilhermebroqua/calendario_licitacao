# LicitaCalendário

Módulo de Calendário, Gestão de Prazos e Etapas para um sistema de acompanhamento de licitações públicas. Cobre três frentes: um calendário de eventos e prazos, um quadro de etapas (estilo kanban) por processo licitatório com datas calculadas em dias úteis, e relatórios gerenciais de acompanhamento.

**Stack:** Java 17 + Spring Boot 3.2 no backend, React 18 (Vite) no frontend, PostgreSQL em produção (via Supabase) e H2 em memória para desenvolvimento local.

## Contexto do sistema

O sistema completo é dividido em módulos, cada um responsável por um pedaço do domínio (cadastro de editais, análise de propostas, jurídico, contratos, etc.). Este repositório implementa o módulo de **Calendário, Prazos e Etapas**, responsável pelas tabelas `processos_licitatorios`, `etapas_processo`, `anotacoes`, `eventos`, `alertas` e `usuarios`.

Duas integrações leem dados de outros módulos diretamente do banco (ainda não existe uma API HTTP entre eles):

- **Sincronização de editais**: o botão "Sincronizar Editais" importa para o quadro de etapas os editais que o módulo de análise marcou como aprovados, evitando duplicar processos já importados (é idempotente — pode ser clicado várias vezes sem gerar duplicatas).
- **Calendário consolidado**: o calendário mensal mistura, junto com os eventos cadastrados aqui, prazos de defesa/sessões de julgamento do módulo jurídico e vencimentos de contrato do módulo de contratos.

Essa leitura cruzada é resiliente por construção: cada consulta externa roda em uma transação isolada (`REQUIRES_NEW`) e qualquer erro (tabela ausente, coluna renomeada, falta de permissão) é registrado como aviso no log e não derruba a listagem local — se um dos outros módulos mudar o nome de uma tabela/coluna, a integração simplesmente para de trazer dados, sem lançar exceção.

## Funcionalidades

**Calendário.** Cadastro de eventos (prazo, reunião, audiência ou outro) com detecção de conflito de horário: ao salvar, o formulário consulta a API de conflitos e, se houver sobreposição com outro evento, mostra o evento conflitante e deixa o usuário confirmar "salvar mesmo assim" — comum em licitação, onde duas sessões podem cair no mesmo horário. Excluir um evento vinculado a um processo licitatório exige justificativa, registrada em log de auditoria.

**Quadro de etapas.** Ao cadastrar um processo licitatório (cliente/órgão, número do edital, objeto e data de abertura), o sistema gera automaticamente 9 etapas padrão do fluxo de pregão eletrônico, com data prevista calculada em dias úteis a partir da abertura. O usuário conclui, reabre, reagenda e anota cada etapa; o quadro pode ser filtrado por "hoje", "atrasadas" ou "concluídas".

**Relatórios.** Relatório diário, semanal (segunda a domingo da semana de referência) ou de todas as etapas previstas, agrupado por processo/cliente, com contadores de etapas concluídas e atrasadas. Os três têm exportação em CSV.

**Alertas.** Painel com prazos próximos, separados em crítico (até 3 dias), atenção (4 a 7 dias) e informativo (mais de 7 dias), além de contagem regressiva ao vivo para o próximo prazo no painel principal.

## Regras de negócio

**Conflito de datas.** Dois eventos conflitam quando o intervalo `[inicio, fim]` de um se sobrepõe ao do outro. Criar ou editar um evento com sobreposição é bloqueado (HTTP 409), a menos que o pedido venha com a flag `ignorarConflito=true` — o que acontece quando o usuário confirma "salvar mesmo assim".

**Alerta mínimo de 3 dias.** A busca de alertas só aceita antecedência igual ou maior que 3 dias; qualquer valor menor devolve lista vazia em vez de gerar alertas fora do padrão. O valor default da consulta é 7 dias.

**Justificativa obrigatória.** Excluir um evento vinculado a um processo licitatório exige uma justificativa não vazia (HTTP 400 sem ela). Eventos avulsos (sem processo vinculado) podem ser excluídos livremente.

**Geração automática das 9 etapas**, contadas a partir da data de abertura da sessão:

| Etapa | Quando cai |
|---|---|
| Resumo/análise do edital | hoje (fim do dia da criação) |
| Cadastro ou atualização no sistema | hoje (fim do dia da criação) |
| Preparar documentação | N dias úteis antes da abertura (configurável por processo, padrão 5) |
| Pedido de esclarecimentos ou impugnação | sempre 3 dias úteis antes da abertura, fixo |
| Registrar proposta de preços | 1 dia útil antes da abertura |
| Definir valor mínimo do lance | 1 dia útil antes da abertura |
| Data de abertura e realização da sessão | na data de abertura informada |
| Sessão de lances e acompanhamento de chat | na data de abertura informada |
| Proposta ajustada / habilitação / recurso administrativo | sem data automática, aguarda convocação |

A última etapa não recebe data porque depende da convocação do pregoeiro durante a sessão pública; fica marcada como "a definir" no quadro até alguém reagendar manualmente.

**Dias úteis e feriados.** Considera sábado, domingo e os feriados nacionais brasileiros como não úteis: feriados fixos (Confraternização, Tiradentes, Dia do Trabalho, Independência, Nossa Senhora Aparecida, Finados, Proclamação da República, Natal, e o Dia Nacional de Zumbi e da Consciência Negra a partir de 2024) e feriados móveis calculados a partir da Páscoa pelo algoritmo de Meeus/Jones/Butcher (Carnaval, Sexta-feira Santa, Corpus Christi). Cobre apenas o calendário **nacional** — feriados estaduais/municipais não entram no cálculo, pois o processo não guarda a UF/município do edital hoje.

**Aviso de mesmo dia.** Se a data de abertura de um novo processo coincidir, no calendário, com a de outro processo já em andamento, a criação não é bloqueada, mas a resposta retorna a lista de processos colidentes para o usuário confirmar ciência.

## Arquitetura

**Backend** em camadas: `controller` (mapeia HTTP, delega tudo) → `service` (regra de negócio, transações) → `repository` (Spring Data JPA + `@Query` JPQL para consultas que não são CRUD simples) → `model` (entidades JPA). O pacote `dto` isola o que trafega pela API do que é persistido; `exception` + um `GlobalExceptionHandler` global traduzem cada exceção de negócio em um JSON `{status, mensagem, timestamp}` com o HTTP status correto (400, 404 ou 409). CORS liberado para `localhost:3000` e `localhost:3001`.

**Frontend** em três camadas por recurso: `services/*.js` são wrappers finos sobre `fetch` (um por recurso REST), `hooks/use*.js` guardam estado e expõem as operações via `useCallback`, e os componentes recebem dado e callback como prop (só o formulário de eventos faz uma exceção pontual, chamando a checagem de conflito diretamente para o preview antes de salvar). Não há roteador — a aba ativa é estado local do `App.jsx`.

A UI segue um sistema de design próprio (`styles/tokens.js`): paleta pensada no vocabulário de quem lida com carimbo e protocolo em licitação. `carimbo` (vermelho) é atraso/crítico, `selo` (verde) é concluído/em dia, `ferro` (azul) é neutro/reunião, `brasao` (dourado) é reservado a ícone/borda por não ter contraste suficiente como texto pequeno.

## Estrutura de pastas

```
licitacalendario/
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/licitacalendario/
│       │   ├── LicitaCalendarioApplication.java
│       │   ├── controller/    EventoControlador, ProcessoLicitatorioControlador, RelatorioControlador
│       │   ├── dto/           objetos de entrada/saída da API
│       │   ├── model/         Evento, Alerta, ProcessoLicitatorio, EtapaProcesso, Anotacao, Usuario + enums
│       │   ├── repository/    Spring Data JPA
│       │   ├── service/       EventoServico, ProcessoLicitatorioServico, RelatorioServico, DiasUteisServico, AuditoriaServico
│       │   └── exception/     exceções de domínio + GlobalExceptionHandler
│       ├── main/resources/    application.properties, application-dev.properties, application-supabase.properties
│       └── test/java/.../service/  JUnit 5 + Mockito
│
└── frontend/
    └── src/
        ├── App.jsx             layout, navegação por abas, orquestração dos hooks
        ├── services/           eventoService, processoService, relatorioService
        ├── hooks/              useEventos, useProcessos
        ├── components/         CalendarioMensal, FormularioEvento, FormularioProcesso, QuadroEtapas, EtapaPainel, RelatoriosView
        └── styles/tokens.js    design tokens
```

## Como executar

### Backend

Pré-requisito: JDK 17+ e Maven 3.8+.

Para desenvolvimento local, sem precisar instalar Postgres:

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Sobe em `http://localhost:8080` com banco H2 em memória (schema recriado a cada start) e console em `http://localhost:8080/h2-console`.

Para rodar contra o Postgres do Supabase (perfil `supabase`), veja a seção de configuração abaixo.

No Windows, os scripts na raiz automatizam esse processo: `run-backend.ps1`/`.bat` localiza um JDK 17+ instalado em `C:\Program Files\Java`, libera a porta 8080 se já estiver ocupada e escolhe o perfil pela variável `SPRING_PROFILES_ACTIVE` do `.env` (usa `dev` se não houver `.env`). `run-frontend.ps1`/`.bat` faz o mesmo para a porta 3000 e roda `npm install` na primeira vez. `run-app.bat` sobe os dois em janelas separadas.

### Frontend

Pré-requisito: Node.js 18+.

```bash
cd frontend
npm install
npm run dev
```

Sobe em `http://localhost:3000`; o Vite faz proxy de `/api` para `http://localhost:8080` (configurado em `vite.config.js`).

## Configuração

Três arquivos de propriedades no backend, um por cenário:

- `application.properties`: valores base, aponta para um Postgres local (`localhost:5432/licitacalendario`). Fallback se nenhum perfil for ativado.
- `application-dev.properties`: perfil `dev`, H2 em memória, `ddl-auto=create-drop`. Uso recomendado no dia a dia.
- `application-supabase.properties`: perfil `supabase`, lê a conexão inteira de variáveis de ambiente (`SUPABASE_DB_URL`, `SUPABASE_DB_USER`, `SUPABASE_DB_PASSWORD`) e fixa o schema do Hibernate em `mod6`, já que o Postgres do Supabase é compartilhado entre os módulos do sistema.

`.env.example` na raiz documenta as variáveis esperadas (todas com placeholders, sem nenhuma credencial real); copie para `.env` e preencha antes de rodar o perfil `supabase`. `.env` está no `.gitignore` e nunca deve ser commitado.

## Testes

Backend, JUnit 5 + Mockito, 60 casos:

| Arquivo | Casos | Cobre |
|---|---|---|
| `DiasUteisServicoTest` | 9 | Páscoa, feriados fixos e móveis, soma/subtração de dias úteis |
| `EventoServicoTest` | 20 | CRUD de evento, conflito, alerta mínimo de 3 dias, justificativa de exclusão, integração com eventos externos |
| `ProcessoLicitatorioServicoTest` | 24 | geração das 9 etapas, filtros do quadro, favoritar/finalizar/excluir, anotações, aviso de mesmo dia, sincronização de editais |
| `RelatorioServicoTest` | 7 | relatório diário/semanal/completo, contadores, exportação CSV (incluindo escape de vírgula) |

```bash
cd backend
mvn test
# relatório de cobertura em target/site/jacoco/index.html
```

O build falha se a cobertura de linha ficar abaixo de 70% (`jacoco-maven-plugin`, regra `check` no `pom.xml`).

> Se `mvn test` falhar com `Unsupported class file major version` vindo do JaCoCo, é porque a JDK instalada no PATH é mais nova do que a versão do JaCoCo suporta para instrumentação de cobertura (acontece com JDKs muito recentes, ex. 24+). Os testes em si não são afetados — rode `mvn test -Djacoco.skip=true` para confirmar que os 60 casos passam sem gerar o relatório de cobertura, ou use uma JDK 17/21 no PATH para ter cobertura também.

Frontend, Jest + Testing Library, 45 casos em 7 arquivos (`QuadroEtapas`, `EtapaPainel`, `FormularioProcesso`, `RelatoriosView`, `useProcessos`, `processoService`, `relatorioService`). `FormularioEvento.jsx`, `CalendarioMensal.jsx`, `useEventos.js` e `eventoService.js` ainda não têm teste dedicado.

```bash
cd frontend
npm test
```

## Referência da API

Todas as respostas de erro seguem o formato `{ "status": 400, "mensagem": "...", "timestamp": "..." }`.

### `/api/eventos`

| Método | Rota | Corpo | Retorno |
|---|---|---|---|
| GET | `/api/eventos?ano=&mes=` | — | eventos do mês, incluindo os lidos de outros módulos |
| POST | `/api/eventos` | `EventoDTO` | 201 + evento criado, 409 se houver conflito e `ignorarConflito` não for `true` |
| PUT | `/api/eventos/{id}` | `EventoDTO` | evento atualizado, 404 se não existir |
| DELETE | `/api/eventos/{id}?justificativa=` | — | 204; 400 se vinculado a processo e sem justificativa |
| GET | `/api/eventos/alertas?dias=7` | — | eventos com prazo dentro da janela (mínimo 3 dias) |
| POST | `/api/eventos/conflitos` | `EventoDTO` | `{ temConflito, conflitos[] }` |

`EventoDTO`: `titulo*`, `dataInicio*`, `dataFim*`, `categoria*` (`PRAZO`\|`REUNIAO`\|`AUDIENCIA`\|`OUTRO`), `descricao`, `processoLicitatorio`, `diasAlerta` (default 3), `ignorarConflito` (default `false`).

### `/api/processos`

| Método | Rota | Corpo | Retorno |
|---|---|---|---|
| POST | `/api/processos` | `ProcessoLicitatorioDTO` | 201 + processo com as 9 etapas já geradas |
| POST | `/api/processos/sincronizar` | — | quantidade de editais importados |
| GET | `/api/processos?status=&favorito=` | — | lista com filtros opcionais |
| GET | `/api/processos/resumo` | — | contadores do painel (`ResumoProcessosDTO`) |
| GET | `/api/processos/{id}` | — | processo + etapas + avisos de mesmo dia |
| PUT | `/api/processos/{id}/favorito` | `{ favorito }` | processo atualizado |
| PUT | `/api/processos/{id}/finalizar` | — | processo com status `FINALIZADO` |
| DELETE | `/api/processos/{id}` | — | 204; apaga em cascata etapas e anotações |
| GET | `/api/processos/{id}/etapas?filtro=` | — | etapas de um processo (`TODAS`\|`HOJE`\|`ATRASADAS`\|`CONCLUIDAS`) |
| GET | `/api/processos/etapas?filtro=` | — | etapas de todos os processos, mesmo filtro |
| PUT | `/api/processos/etapas/{etapaId}/concluir` | `{ concluida }` | etapa atualizada |
| PUT | `/api/processos/etapas/{etapaId}/reagendar` | `{ novaData }` | etapa atualizada |
| POST | `/api/processos/etapas/{etapaId}/anotacoes` | `{ autor, texto }` | 201 + anotação |
| GET | `/api/processos/etapas/{etapaId}/anotacoes` | — | anotações em ordem cronológica |

`ProcessoLicitatorioDTO`: `cliente*`, `numeroProcesso*`, `objeto`, `dataAbertura*`, `diasUteisDocumentacao` (default 5), `favorito` (default `false`).

### `/api/relatorios`

| Método | Rota | Retorno |
|---|---|---|
| GET | `/api/relatorios/diario?data=` | etapas do dia (hoje se `data` não vier) |
| GET | `/api/relatorios/semanal?data=` | etapas da semana (segunda a domingo) que contém `data` |
| GET | `/api/relatorios/completo?processoId=` | todas as etapas previstas, com filtro opcional por processo |
| GET | `/api/relatorios/{diario,semanal,completo}/csv` | mesmos parâmetros, `text/csv` para download |

## Modelo de dados

| Entidade | Tabela | Pontos de atenção |
|---|---|---|
| `Evento` | `eventos` | `temConflito`/`isValido` são regra de negócio no próprio model, não só no service |
| `Alerta` | `alertas` | hoje só é persistida via `disparar()`; a listagem de alertas em uso é calculada on-the-fly a partir de `Evento` |
| `ProcessoLicitatorio` | `processos_licitatorios` | `status` default `EM_ANDAMENTO`; `diasUteisDocumentacao` default 5 |
| `EtapaProcesso` | `etapas_processo` | `isAtrasada()`/`isHoje()` calculados em runtime a partir de `dataPrevista` |
| `Anotacao` | `anotacoes` | texto livre até 2000 caracteres, vinculado a uma etapa |
| `Usuario` | `usuarios` | `perfil`: `OPERACIONAL`, `GESTOR` ou `ADMINISTRADOR`; ainda não há autenticação plugada nos controllers |

## Limitações conhecidas

- Feriados cobrem só o calendário nacional; feriado estadual/municipal do órgão licitante não entra no cálculo de dias úteis, pois o processo não guarda a UF/município do edital hoje.
- A leitura de eventos externos e a sincronização de editais dependem de nomes fixos de tabela/coluna em schemas de outros módulos. Se esses módulos renomearem algo, a integração some silenciosamente (retorna lista vazia, não lança erro). Não há hoje um teste de integração cross-schema que pegasse essa quebra.
- Não há autenticação nos endpoints; `Usuario`/`PerfilUsuario` existem no modelo, mas nenhum controller valida perfil hoje.
