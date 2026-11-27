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