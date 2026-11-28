# Registro de utilização de Inteligência Artificial

## Ferramentas utilizadas

- ChatGPT (OpenAI)

## Objetivo

A inteligência artificial foi utilizada como ferramenta
de apoio ao desenvolvimento, planejamento arquitetural,
implementação, revisão de código e resolução de problemas.

## Etapas auxiliadas por IA

### Sprint 1 — Project Setup

- Planejamento da arquitetura full stack.
- Seleção das tecnologias e dependências.
- Configuração do ambiente Node.js e TypeScript.
- Estruturação inicial do backend com Express.
- Implementação dos middlewares de tratamento de erros.
- Configuração do PostgreSQL com Docker Compose.
- Modelagem do banco de dados com Prisma.
- Resolução de incompatibilidades entre versões do Prisma.
- Configuração do frontend com React, Vite e Tailwind CSS.
- Implementação dos testes automatizados iniciais.

## Validação humana

As sugestões e os códigos fornecidos pela IA foram
implementados e validados pelo desenvolvedor no ambiente
local.

As validações realizadas até esta etapa incluem:

- Execução dos testes automatizados do backend e frontend.
- Verificação de tipos TypeScript.
- Compilação do backend e frontend.
- Verificação do frontend com ESLint.
- Testes manuais dos endpoints utilizando Postman.
- Validação da conexão com o PostgreSQL.
- Execução e verificação das migrations.
- Verificação visual do frontend no navegador.

## Atualizações

Este documento será atualizado durante o desenvolvimento
para registrar novas funcionalidades auxiliadas por IA
e suas respectivas validações.


## Sprint 2 — Integração com gateway de pagamentos

### Ferramenta utilizada

- ChatGPT (OpenAI).

### Etapas com auxílio de IA

- Análise da documentação da API Juntos Se Faz.
- Planejamento dos testes manuais no Postman.
- Definição da arquitetura extensível de pagamentos.
- Aplicação dos padrões Adapter, Strategy e Registry.
- Implementação das interfaces de pagamento e simulação.
- Implementação do JuntosSeFazAdapter.
- Implementação do GatewayRegistry.
- Configuração e validação das variáveis de ambiente.
- Validação das respostas externas utilizando Zod.
- Tratamento de erros HTTP, timeout e falhas de conexão.
- Implementação dos testes unitários utilizando Vitest.

### Finalidade do uso

Auxiliar na implementação de uma integração modular,
segura, testável e extensível, reduzindo o acoplamento
entre as regras de negócio e o provedor de pagamentos.

### Revisão e validação humana

- Execução de oito cenários manuais no Postman.
- Verificação do comportamento stateless do sandbox.
- Validação das respostas da API externa.
- Execução da compilação e verificação de tipos.
- Execução de 33 testes unitários do adapter.
- Execução de 9 testes unitários do registry.
- Execução da suíte completa de 48 testes do backend.

### Resultado

Integração com o sandbox Juntos Se Faz implementada
na camada de gateways, com 48 testes automatizados
do backend aprovados.

A persistência dos pagamentos, as regras de negócio
do checkout e a autorização das operações de simulação
serão implementadas nas próximas etapas.


## Sprint 3 — Authentication and Authorization

### Objetivo

Implementar um sistema de autenticação e autorização para clientes e administradores, garantindo a proteção das credenciais, dos endpoints privados e dos futuros recursos administrativos da plataforma.

### Utilização de inteligência artificial

A ferramenta ChatGPT foi utilizada como apoio nas seguintes atividades:

- Planejamento da arquitetura do módulo de autenticação.
- Implementação dos schemas de cadastro e login utilizando Zod.
- Estruturação do User Repository, Auth Service e Auth Controller.
- Implementação do armazenamento seguro de senhas utilizando Argon2id.
- Geração e validação de tokens JWT.
- Implementação dos middlewares de autenticação e autorização baseada em papéis (RBAC).
- Configuração de rate limiting nos endpoints de cadastro e login.
- Elaboração de testes unitários e de integração.
- Diagnóstico e correção de problemas de tipagem e inicialização do servidor HTTP durante os testes.

### Decisões técnicas

- Senhas armazenadas exclusivamente como hashes Argon2id.
- Tokens JWT assinados utilizando HS256, com expiração, emissor e destinatário definidos.
- Cadastro público restrito ao perfil CUSTOMER.
- Consulta das permissões atuais do usuário no banco de dados durante a autenticação.
- Validação estrita dos dados recebidos pela API.
- Respostas de autenticação sem exposição de senhas ou hashes.
- Limitação de requisições para reduzir tentativas abusivas de autenticação.
- Utilização de registros exclusivos e limpeza dos dados criados pelos testes de integração.

### Validação humana

As implementações sugeridas pela IA foram aplicadas, executadas e verificadas localmente pelo desenvolvedor.

Foram realizadas as seguintes validações:

- 11 cenários manuais utilizando Postman, com verificação do conteúdo das respostas.
- 30 testes automatizados de validação de schemas.
- 10 testes automatizados de criptografia e verificação de senhas.
- 17 testes automatizados de geração e validação JWT.
- 11 testes unitários de autorização RBAC.
- 15 testes de integração dos endpoints de autenticação.
- 7 testes de integração de autorização com PostgreSQL.
- Verificação de tipos do código de produção com TypeScript.
- Compilação completa do backend.
- Execução da suíte completa, totalizando 138 testes aprovados.

### Limitações e melhorias futuras

- O rate limiting utiliza armazenamento em memória, adequado ao ambiente atual de instância única.
- Os testes de integração utilizam o banco de desenvolvimento com registros isolados e limpeza específica.
- A autenticação ainda deverá ser integrada à interface frontend.
- A criação controlada de contas administrativas será implementada posteriormente.
- A verificação automatizada de tipos ainda não inclui os arquivos de testes.

## Sprint 4 — Catálogo de jogos e interface da loja

### Ferramenta utilizada

- ChatGPT (OpenAI).

### Objetivo da utilização

Auxiliar no planejamento, desenvolvimento, revisão e validação do catálogo de jogos, da interface responsiva da loja e da integração entre frontend e backend.

### Etapas e funcionalidades auxiliadas pela IA

**Backend**

- Evolução da modelagem de dados para suportar banners, cores temáticas e jogos em destaque.
- Criação de migrations com Prisma.
- Implementação de seeds idempotentes com 20 jogos e 6 categorias.
- Estruturação dos módulos de jogos e categorias.
- Implementação das camadas de repository, service, controller e routes.
- Validação dos parâmetros de consulta utilizando Zod.
- Implementação de pesquisa, filtros, ordenação e paginação.
- Padronização das respostas e tratamento de erros.
- Elaboração de testes unitários e de integração.

**Frontend**

- Organização da arquitetura de componentes, páginas, hooks, contextos e serviços.
- Definição da identidade visual e do sistema de design da GameVault.
- Configuração da comunicação com a API utilizando Axios.
- Gerenciamento de dados assíncronos e cache com TanStack Query.
- Implementação do layout responsivo e da navegação.
- Desenvolvimento do carrossel de jogos em destaque.
- Implementação de um sistema de temas dinâmicos baseado na identidade visual de cada jogo.
- Desenvolvimento dos cards, filtros, pesquisa com debounce e paginação.
- Implementação da página de detalhes dos jogos.
- Tratamento de estados de carregamento, resultados vazios, falhas de comunicação e recursos inexistentes.
- Orientação sobre otimização de imagens utilizando WebP.
- Elaboração de testes automatizados com Vitest e React Testing Library.

### Revisão e validação humana

As sugestões e os trechos de código fornecidos pela IA foram implementados, executados e validados pelo desenvolvedor em ambiente local.

As validações realizadas incluíram:

- Execução das migrations e verificação da estrutura do PostgreSQL.
- Execução repetida do seed para verificar sua idempotência.
- Testes manuais dos endpoints utilizando Postman.
- Verificação da integração entre frontend e backend.
- Testes de navegação, pesquisa, filtros, ordenação e paginação.
- Validação visual do tema dinâmico.
- Verificação da responsividade utilizando as ferramentas de desenvolvimento do navegador.
- Identificação e correção de problemas de interface.
- Correção de um teste assíncrono relacionado à atualização do tema utilizando `waitFor`.
- Execução das verificações de tipagem, compilação e lint.
- Execução das suítes completas de testes automatizados.

### Resultados da validação

| Validação | Resultado |
|---|---|
| Testes automatizados do backend | 219 aprovados |
| Testes automatizados do frontend | 83 aprovados |
| Total de testes automatizados | 302 aprovados |
| Typecheck do backend | Aprovado |
| Build do backend | Aprovado |
| Build do frontend | Aprovado |
| Lint do frontend | Aprovado |

### Limitações e decisões técnicas

- Os preços e produtos apresentados possuem finalidade demonstrativa.
- O catálogo não representa uma operação comercial real de distribuição de jogos.
- Os testes de componentes frontend utilizam respostas simuladas da API para garantir isolamento e previsibilidade.
- O fluxo de compra e a integração do carrinho serão implementados na sprint seguinte.
- Parte das imagens do catálogo permanece pendente de inclusão e verificação das condições de utilização.

## Sprint 5 — Authentication, Cart and Checkout

### Ferramenta utilizada

- ChatGPT (OpenAI).

### Objetivos do uso de IA

- Planejamento da arquitetura do checkout.
- Auxílio na implementação de funcionalidades.
- Revisão de código e segurança.
- Identificação de possíveis condições de corrida.
- Elaboração de testes automatizados.
- Diagnóstico e correção de erros.

### Funcionalidades desenvolvidas com auxílio de IA

#### Frontend

- Autenticação e gerenciamento de sessão.
- Formulários de cadastro e login.
- Proteção de rotas por autenticação e perfil.
- Carrinho persistente no navegador.
- Checkout responsivo em múltiplas etapas.
- Seleção de gateways de pagamento.
- Exibição de pagamentos PIX simulados.
- Simulação de aprovação, recusa e cancelamento.
- Consulta externa ao gateway.
- Recuperação de pedidos e pagamentos pela URL.
- Confirmação visual de transações.

#### Backend

- Criação e persistência de pedidos.
- Validação de preços no servidor.
- Verificação de propriedade dos jogos.
- Prevenção de compras duplicadas.
- Persistência de pagamentos.
- Controle de idempotência.
- Controle de concorrência nas transações.
- Integração com a Juntos Se Faz em sandbox.
- Atualização transacional de pedidos e pagamentos.
- Liberação de jogos após aprovação.
- Consulta de status diretamente no gateway.
- Tratamento de erros e respostas incertas.

### Revisão e validação humana

O desenvolvedor participou das decisões de arquitetura,
implementação, execução, revisão e correção do código.

Foram realizados testes manuais pelo navegador,
Postman e consultas ao PostgreSQL.

A integração com a Juntos Se Faz foi validada
utilizando o ambiente sandbox, sem movimentação
de dinheiro real.

Foram implementados testes automatizados utilizando
Vitest, Supertest e React Testing Library.

Ao final do sprint, foram registrados:

- Backend: 346 testes aprovados.
- Frontend: 240 testes aprovados.
- Total acumulado: 586 testes.

Os testes automatizados de pagamento utilizam mocks
para evitar dependência de serviços externos.

### Decisões técnicas

- O PostgreSQL é a fonte de verdade para o estado
  persistido das transações simuladas.
- Os preços enviados pelo navegador não são utilizados
  como valores oficiais das compras.
- A consulta externa ao gateway não sobrescreve
  automaticamente o estado local do pagamento.
- A recuperação do checkout utiliza o identificador
  do pedido na URL e consultas autenticadas ao backend.
- As credenciais do gateway permanecem exclusivamente
  no backend.
- Execução sequencial dos arquivos de testes do backend
  para evitar conflitos entre transações concorrentes
  no banco de dados compartilhado, preservando os
  testes específicos de concorrência.

### Limitações conhecidas

- O gateway sandbox pode retornar estados demonstrativos
  diferentes dos estados persistidos localmente.
- A idempotência é controlada pela aplicação.
- A chave de idempotência do frontend não é persistida
  após o recarregamento da página.
- Respostas incertas do gateway podem deixar pagamentos
  em processamento, sem reconciliação automática.
- Não há garantia de atomicidade entre o serviço
  externo e o banco de dados local.
- A interface ainda não identifica todos os jogos
  previamente adquiridos pelo usuário.
- Nenhuma transação financeira real é realizada.

## Sprint 6 — Biblioteca e histórico de compras

### Ferramenta utilizada

- ChatGPT (OpenAI).

### Atividades auxiliadas por IA

- Implementação da API da biblioteca do cliente.
- Desenvolvimento da interface responsiva da biblioteca.
- Implementação do histórico de pedidos com paginação.
- Recuperação de pagamentos pendentes pelo histórico.
- Identificação de jogos já adquiridos no catálogo.
- Bloqueio de compras duplicadas na interface.
- Remoção seletiva de jogos adquiridos do carrinho.
- Criação e revisão de testes automatizados.
- Correção de dependências de contexto nos testes React.
- Correção de erros de tipagem do TypeScript.

### Revisão e validação humana

O desenvolvedor revisou os códigos sugeridos, realizou
a integração das funcionalidades e executou testes
automatizados e validações manuais no navegador.

Foram validados os fluxos de recuperação de pagamentos,
aprovação simulada, atualização da biblioteca, histórico
de pedidos e identificação de jogos adquiridos.

### Resultados dos testes

- Backend: 352 testes aprovados.
- Frontend: 284 testes aprovados.
- Total acumulado: 636 testes automatizados.

### Decisões técnicas

- A biblioteca é consultada com base no usuário autenticado.
- O backend permanece responsável por impedir compras duplicadas.
- A interface identifica jogos adquiridos e impede novas compras.
- Jogos adquiridos permanecem disponíveis na biblioteca mesmo
  quando desativados no catálogo.
- Pagamentos pendentes podem ser recuperados pelo histórico.
- O carrinho não remove jogos adquiridos automaticamente,
  permitindo que o usuário confirme sua remoção.

### Limitações conhecidas

- A biblioteca representa licenças digitais fictícias,
  sem disponibilização de arquivos reais para download.
- Todas as transações permanecem restritas ao ambiente sandbox.
- A divisão do bundle frontend será aprimorada posteriormente.

## Sprint 7 — Painel administrativo

**Ferramenta de IA utilizada:** ChatGPT (OpenAI)

### Desenvolvimento auxiliado por IA

- Criação de um script CLI para configuração de contas administrativas.
- Implementação do controle de acesso baseado em papéis (RBAC).
- Desenvolvimento da API administrativa para listagem, ativação e desativação de gateways de pagamento.
- Validação dos adaptadores de pagamento implementados.
- Desenvolvimento do painel administrativo e seus componentes responsivos.
- Integração com React Query e gerenciamento de invalidação de cache.
- Correção dos redirecionamentos de autenticação com base nas permissões do usuário.
- Desenvolvimento de testes unitários, de integração, de componentes e de regressão.

### Finalidade do uso de IA

A IA foi utilizada para auxiliar na implementação das funcionalidades, avaliar decisões arquiteturais, identificar possíveis problemas de autenticação e autorização, melhorar a manutenibilidade do código e ampliar a cobertura de testes automatizados.

### Revisão humana e validação

O desenvolvedor implementou e revisou as alterações sugeridas, executou os testes automatizados localmente e realizou validações manuais dos seguintes fluxos:

- Acesso ao painel administrativo.
- Restrição de acesso para usuários sem permissões administrativas.
- Ativação e desativação de gateways de pagamento.
- Sincronização da disponibilidade dos gateways com o checkout.
- Encerramento de sessão e alternância entre contas.
- Redirecionamento após login e cadastro.

### Resultados da validação

- Backend: 394 testes aprovados em 22 arquivos.
- Frontend: 348 testes aprovados em 26 arquivos.
- Total: 742 testes automatizados aprovados.
- Validação de tipos TypeScript do backend concluída sem erros.
- Operações administrativas validadas utilizando PostgreSQL.

### Limitações conhecidas

- A integração de novos gateways de pagamento exige a implementação do respectivo adaptador no backend.
- O indicador de integração implementada não representa a disponibilidade do provedor em tempo real.
- O fluxo completo de logout e alternância entre contas foi validado manualmente, enquanto as regras de redirecionamento possuem cobertura automatizada.
- Os testes de integração ainda utilizam o banco de dados local de desenvolvimento. O isolamento em um banco exclusivo para testes está previsto para o Sprint 8.