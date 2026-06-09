# VeloSpace

Aplicativo mobile construído com Expo e React Native para gerenciar o ciclo de candidatura, validação e acompanhamento de CubeSats em oportunidades de lançamento espacial.

## Sumário

- [Visão Geral](#visão-geral)
- [Objetivo do Projeto](#objetivo-do-projeto)
- [Escopo Funcional](#escopo-funcional)
- [Perfis de Usuário](#perfis-de-usuário)
- [Fluxos Implementados](#fluxos-implementados)
- [Stack Tecnológica](#stack-tecnológica)
- [Arquitetura do Frontend](#arquitetura-do-frontend)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Integração com Backend](#integração-com-backend)
- [Rotas do Aplicativo](#rotas-do-aplicativo)
- [Gerenciamento de Sessão](#gerenciamento-de-sessão)
- [Como Executar o Projeto](#como-executar-o-projeto)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Regras de Negócio Relevantes](#regras-de-negócio-relevantes)
- [Link do Vídeo](#link-do-vídeo)
- [Integrantes](#integrantes)

## Visão Geral

### O que é o VeloSpace?

O VeloSpace é uma plataforma digital desenvolvida para conectar proprietários de CubeSats, como universidades, instituições de pesquisa e desenvolvedores independentes, a empresas fornecedoras de serviços de lançamento espacial.

O projeto surgiu da necessidade de reduzir a burocracia e a dificuldade encontradas por organizações que desejam colocar pequenos satélites em órbita, aproveitando oportunidades de lançamento frequentemente subutilizadas pelas empresas do setor aeroespacial.

A proposta do VeloSpace é tornar o processo de candidatura, seleção, rastreabilidade e validação de CubeSats mais digital, transparente, seguro e eficiente.

## Objetivo do Projeto

O escopo do projeto contempla:

- Publicação de oportunidades de lançamento por fornecedores.
- Cadastro de CubeSats pelos usuários.
- Processo de candidatura dos satélites às oportunidades disponíveis.
- Realização de sorteios para definição dos participantes selecionados.
- Geração de QR Codes para rastreabilidade dos CubeSats sorteados.
- Validação automatizada das dimensões dos satélites durante sua recepção na base de lançamento.

Durante o cadastro, os proprietários informam as características técnicas e dimensões de seus CubeSats. Após o envio do satélite à empresa responsável pelo lançamento, a equipe da base realiza novas medições e registra os valores obtidos no sistema.

Por meio da leitura do QR Code, o VeloSpace recupera os dados originalmente cadastrados e realiza uma comparação automática entre as informações declaradas e as medições efetuadas. Caso sejam identificadas divergências, o CubeSat é removido do processo de integração ao foguete. Caso contrário, ele é aprovado para prosseguir para as próximas etapas.

Esse mecanismo aumenta a transparência, reduz a possibilidade de erros operacionais e contribui para a integridade do processo de validação.

O sistema não contempla o transporte físico dos CubeSats, concentrando-se na gestão, rastreabilidade e validação das informações necessárias para garantir um processo mais transparente, seguro e eficiente.

## Escopo Funcional

O app atual cobre principalmente:

- Autenticação por email e senha.
- Cadastro de três tipos de conta.
- Home com comportamento por perfil.
- Cadastro de satélites pelo expedidor.
- Aprovação inicial de satélites pelo operador de lançamento.
- Registro de inspeção técnica do satélite.
- Aprovação e rejeição de operadores pela provedora de lançamento.
- Edição de perfil por tipo de usuário.
- Rastreamento básico do ciclo do satélite.
- Gestão de foguetes para operadores.

## Perfis de Usuário

O sistema possui três perfis principais:

### 1. `SHIPPER`

Representa o proprietário do CubeSat.

Responsabilidades:

- Cadastrar satélites.
- Escolher a provedora de lançamento.
- Acompanhar status do satélite.
- Adicionar código de rastreio quando aplicável.
- Editar o próprio perfil.

### 2. `PAYLOAD_HANDLER`

Representa o operador de lançamento associado a uma provedora.

Responsabilidades:

- Avaliar satélites recebidos.
- Aprovar ou rejeitar satélites.
- Definir prioridade no momento da aprovação.
- Registrar inspeções físicas.
- Consultar e gerenciar foguetes.
- Editar o próprio perfil.

### 3. `LAUNCHER_PROVIDER`

Representa a empresa provedora do lançamento.

Responsabilidades:

- Visualizar satélites vinculados à empresa.
- Filtrar satélites por estado.
- Visualizar satélites prontos para lançamento.
- Aprovar ou rejeitar operadores da própria empresa.
- Editar os dados cadastrais da empresa.

## Fluxos Implementados

### Autenticação

- Login por email e senha.
- Persistência de token em `AsyncStorage`.
- Reconstrução do usuário autenticado a partir do JWT salvo.
- Reutilização do mesmo token nas integrações protegidas.

### Cadastro

O fluxo de cadastro é multi-etapas:

1. Escolha do tipo de usuário.
2. Dados pessoais ou corporativos.
3. Dados de contato.
4. Credenciais de acesso.

Tipos suportados:

- Expedidor
- Provedora de Lançamento
- Operador de Lançamento

### Home do Expedidor

- Lista satélites do usuário.
- Filtros por pendente e enviado.
- Botão para adicionar código de rastreio em status elegível.
- Acesso ao detalhe do satélite.

### Home do Operador de Lançamento

- Lista satélites vinculados à provedora.
- Filtros por pendente, prontos, aprovados, recusados e todos.
- Aprovação com definição de prioridade.
- Rejeição do satélite.
- Acesso à tela de inspeção quando o satélite está aguardando inspeção.
- Aba de foguetes para listar, pesquisar, cadastrar, editar e excluir foguetes.

### Home da Provedora de Lançamento

Possui duas visões:

- `Satélites`
- `Operadores`

Na visão de satélites:

- Lista satélites vinculados à empresa.
- Filtros por status.
- Filtro específico para satélites prontos para lançamento.
- Ordenação por prioridade no filtro de prontos para lançamento.

Na visão de operadores:

- Lista operadores vinculados à empresa.
- Filtros por pendente, aprovado, recusado e todos.
- Aprovação ou rejeição de operadores pendentes.

### Inspeção

A tela de inspeção registra:

- Altura medida
- Largura medida
- Comprimento medido
- Peso medido

Esses dados são enviados ao backend para comparação com as medidas declaradas no cadastro do satélite.

### Perfil

O app suporta edição de perfil para:

- Expedidor
- Operador de Lançamento
- Provedora de Lançamento

Também permite atualização de senha nos perfis que possuem endpoint correspondente.

### Sobre o App

- Tela pública acessível a partir do login.
- Explica a proposta, o objetivo e os benefícios do VeloSpace.

## Stack Tecnológica

### Frontend

- React 19
- React Native 0.81
- Expo 54
- Expo Router 6
- TypeScript
- NativeWind

### Bibliotecas principais

- `expo-router` para roteamento baseado em arquivos
- `@react-native-async-storage/async-storage` para persistência de sessão
- `@expo/vector-icons` para ícones
- `react-native-safe-area-context` para áreas seguras

## Arquitetura do Frontend

O app segue uma estrutura simples baseada em:

- `app/` para rotas
- `components/` para componentes reutilizáveis
- `contexts/` para estado global de autenticação e perfis
- `hooks/` para lógica de fluxo e composição de tela
- `lib/` para clients HTTP e integrações principais
- `services/` para serviços especializados de cadastro
- `types/` para contratos TypeScript

### Contexts principais

- `AuthContext`: sessão autenticada
- `UserContext`: perfil do expedidor
- `OperatorContext`: perfil do operador
- `LaunchProviderContext`: perfil da provedora de lançamento

## Estrutura de Pastas

```text
app/
  (auth)/
    sign-in.tsx
    sign-up.tsx
    about.tsx
  (tabs)/
    index.tsx
    new-package.tsx
    package-detail.tsx
    inspection.tsx
    profile.tsx
    rockets.tsx
    rocket-detail.tsx
  operator-access.tsx

components/
  SignInForm/
  SignUpForm/
  ui/
  HomeContent.tsx
  NewPackageForm.tsx
  InspectionForm.tsx
  PackageDetailView.tsx

contexts/
  AuthContext.tsx
  UserContext.tsx
  OperatorContext.tsx
  LaunchProviderContext.tsx

hooks/
  useHome.ts
  usePackageDetail.ts
  useAuthStorage.ts
  useMultiStepForm.ts

lib/
  api.ts
  api-config.ts
  rocket-api.ts
  rocket-api-config.ts
  auth.ts

services/
  shippers.ts
  operators.ts
  launchProviders.ts
```

## Integração com Backend

### API principal

Configurada em:

- [`lib/api-config.ts`](./lib/api-config.ts)

Valor atual:

```ts
export const API_BASE_URL = "https://velospace-rm559914.azurewebsites.net"
```

### API de foguetes

Configurada em:

- [`lib/rocket-api-config.ts`](./lib/rocket-api-config.ts)

Valor atual:

```ts
export const ROCKET_API_BASE_URL = "https://csharp-rm560442.azurewebsites.net"
```

### Estratégia de integração

O app utiliza:

- [`lib/api.ts`](./lib/api.ts) para a API principal
- [`lib/rocket-api.ts`](./lib/rocket-api.ts) para a API de foguetes

Responsabilidades:

- Montar URLs.
- Injetar token JWT automaticamente quando necessário.
- Aplicar headers padrão.
- Fazer fallback de método em endpoints que aceitam `POST`, `PUT` ou `PATCH`.
- Buscar automaticamente todas as páginas em endpoints paginados.

### Endpoints principais usados pelo app

#### Autenticação

- `POST /api/v1/auth`

#### Perfis

- `GET /api/v1/shippers/me`
- `GET /api/v1/operators/me`
- `GET /api/v1/launch-providers/me`
- `GET /api/v1/operators/{id}`

#### Cadastro

- `POST /api/v1/shippers`
- `POST /api/v1/operators`
- `POST /api/v1/launch-providers`
- `POST /api/v1/satellites`

#### Listagens

- `GET /api/v1/launch-providers`
- `GET /api/v1/shippers/{id}/satellites`
- `GET /api/v1/launch-providers/{id}/satellites`
- `GET /api/v1/launch-providers/{id}/operators`
- `GET /api/v1/satellite-priorities`

#### Fluxos operacionais

- `POST /api/v1/inspections`
- `POST|PUT|PATCH /api/v1/satellites/{id}/approval`
- `POST|PUT|PATCH /api/v1/operators/{id}/approval`
- `POST|PUT|PATCH /api/v1/satellites/{id}/track`

#### Atualização de perfil

- `PUT|PATCH /api/v1/shippers/{id}`
- `PUT|PATCH /api/v1/shippers/{id}/password`
- `PUT|PATCH /api/v1/operators/{id}`
- `PUT|PATCH /api/v1/launch-providers/{id}`
- `PUT|PATCH /api/v1/launch-providers/{id}/password`

#### Foguetes

- `GET /api/Rocket`
- `GET /api/Rocket/search`
- `GET /api/Rocket/{id}`
- `POST /api/Rocket`
- `PUT /api/Rocket/{id}`
- `DELETE /api/Rocket/{id}`

## Rotas do Aplicativo

### Públicas

- `/(auth)/sign-in`
- `/(auth)/sign-up`
- `/(auth)/about`

### Privadas

- `/(tabs)`
- `/(tabs)/profile`
- `/(tabs)/package-detail`
- `/(tabs)/inspection`
- `/(tabs)/new-package`
- `/(tabs)/rockets`
- `/(tabs)/rocket-detail`

### Regras de acesso

- `new-package` é restrita a `SHIPPER`.
- `rockets` e `rocket-detail` são restritas a `PAYLOAD_HANDLER`.
- `operator-access` é usada quando o operador existe, mas ainda não foi aprovado.
- O layout autenticado decide redirecionamentos por papel e estado de aprovação.

## Gerenciamento de Sessão

O projeto usa `AsyncStorage` para persistir:

- Token JWT
- Usuário autenticado

Chaves principais:

- `jwt_token`
- `auth_user`

O carregamento inicial da sessão ocorre no `AuthContext`, que reconstrói o usuário a partir do token armazenado.

## Como Executar o Projeto

### Pré-requisitos

- Node.js 18+
- npm
- Expo CLI via `npx`
- Android Studio, emulador Android, Expo Go ou dispositivo físico

### Instalação

```bash
npm install
```

### Execução

```bash
npm start
```

Atalhos comuns:

```bash
npm run android
npm run ios
npm run web
```

## Scripts Disponíveis

```bash
npm start
npm run android
npm run ios
npm run web
npm run lint
```

## Regras de Negócio Relevantes

### Aprovação de satélite

- O operador pode aprovar ou rejeitar um satélite pendente.
- A aprovação exige seleção de prioridade.

### Inspeção

- Quando o satélite entra em `PENDING_INSPECTION`, o fluxo direciona para a tela de inspeção.
- O registro compara dimensões declaradas e medidas reais no backend.

### Prioridade de lançamento

- Satélites `READY_FOR_LAUNCH` podem ser ordenados por prioridade.
- A ordenação usa o endpoint de prioridades, não uma ordem fixa embutida no frontend.

### Paginação

- O client do app busca todas as páginas dos endpoints paginados já integrados.
- Isso evita ocultar registros novos quando o backend não devolve tudo na página 0.

### Foguetes

- O operador pode listar, pesquisar, cadastrar, editar e excluir foguetes.
- A API de foguetes usa o mesmo token de autenticação obtido no login principal.

## Link do Vídeo

https://youtu.be/mN5EYBJ3QHc

## Integrantes

| Nome | Função no Projeto | LinkedIn | GitHub | TURMA
| --- | --- | --- | --- | --- |
| Cleyton Enrike de Oliveira | Desenvolvedor .NET & IOT & DBA | LinkedIn | @Cleytonrik99 | 2TDSQ
| Matheus Henrique Nascimento de Freitas | Desenvolvedor Mobile & DBA | LinkedIn | @MatheusHenriqueNF | 2TDSQ
| Pedro Henrique Sena | Desenvolvedor Java & DevOps | LinkedIn | @devpedrosena1 | 2TDSQ
| Paulo Sérgio França Barbosa | Desenvolvedor Java & DevOps & DBA | LinkedIn | @PauloSergioFIAP | 2TDSQ
| Enzo Ribeiro Vilela de Azevedo | Quality Assurance | LinkedIn | @enzorva | 2TDSZ
