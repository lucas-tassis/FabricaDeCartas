# Fabrica de Cartas - Golden Rules for Development

Este documento contém as diretrizes inegociáveis para o desenvolvimento do projeto. O assistente de IA deve ler este arquivo antes de qualquer implementação.

## 1. Arquitetura e Código (SOLID Completo)

- **S - Single Responsibility Principle (SRP)**: Cada classe deve ter apenas um motivo para mudar. Nunca crie "God Classes" ou serviços que fazem tudo (ex: simulação de jogo e gestão financeira no mesmo arquivo).
- **O - Open/Closed Principle (OCP)**: Objetos e entidades devem estar abertos para extensão, mas fechados para modificação. Use interfaces e herança para adicionar comportamentos sem alterar o código base.
- **L - Liskov Substitution Principle (LSP)**: Classes derivadas devem poder ser substituídas por suas classes base sem quebrar a aplicação.
- **I - Interface Segregation Principle (ISP)**: Muitas interfaces específicas são melhores do que uma interface geral. Não force uma classe a depender de métodos que ela não utiliza.
- **D - Dependency Inversion Principle (DIP)**: Dependa de abstrações, não de implementações concretas. Use Injeção de Dependência em todos os níveis.

## 2. Padrões de Arquitetura e Clean Code

- **Separação de Camadas**: Mantenha a distinção clara entre:
    - **Domain**: Entidades puras (sem lógica de negócio pesada).
    - **Repository**: Apenas acesso a dados.
    - **Service**: Onde reside a lógica de negócio (Regras de Elifoot).
    - **Controller**: Apenas orquestração de entrada e saída da API.
- **Uso de DTOs**: É OBRIGATÓRIO o uso de DTOs (Data Transfer Objects) para toda comunicação entre o Backend e o Frontend. Jamais retorne entidades JPA diretamente nos Controllers.
- **DRY (Don't Repeat Yourself)**: Evite duplicação de lógica. Se um cálculo de habilidade é usado em dois lugares, ele deve estar em um serviço compartilhado.
- **KISS (Keep It Simple, Stupid)**: Prefira soluções legíveis e simples a algoritmos excessivamente complexos.
- **Nomenclatura Semântica**: Nomes de variáveis, métodos e classes devem ser autoexplicativos (ex: `calculateStaminaDecay` em vez de `calcSD`).
- **Sem Números Mágicos**: Todas as constantes de negócio (taxas, bônus, divisores) devem estar no `GameParameters` ou em `public static final constants`.

## 3. Integridade e Continuidade

- **Regra de Não-Regressão**: Nunca retire, comente ou apague funcionalidades já implementadas e funcionais, a menos que seja para uma refatoração solicitada que melhore a arquitetura mantendo o recurso ativo.
- **Preservação de Contexto**: Mantenha as rotas do frontend, as chaves de tradução e o estado do `localStorage` sempre preservados.

## 4. Gestão do Plano de Implantação

- **PROIBIÇÃO DE APAGAR**: O arquivo `implementation_plan.md` nunca deve ter itens apagados. 
- **Evolução do Plano**: Novos requisitos devem ser adicionados ao final das seções ou em novas seções. Itens concluídos devem ser marcados com `[x]`, mas nunca removidos para que o histórico do projeto seja visível.

## 5. Internacionalização (i18n)

- **Totalidade**: 100% das strings visíveis ao usuário no Frontend devem passar pelo `i18n`.
- **Nomes Próprios**: Apenas nomes de jogadores e times reais são exceção à regra de tradução.
