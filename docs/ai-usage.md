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