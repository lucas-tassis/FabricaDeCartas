# 🎴 Manual do Usuário - Fábrica de Cartas

Bem-vindo à **Fábrica de Cartas**! Esta ferramenta foi desenvolvida para permitir a criação e geração em lote de cartas personalizadas para jogos de tabuleiro (board games), card games e protótipos rápidos, integrando dados de planilhas Excel com um editor visual interativo.

---

## 📋 Índice
1. [Visão Geral e Fluxo de Trabalho](#1-visão-geral-e-fluxo-de-trabalho)
2. [Passo 1: Carregando sua Planilha Excel](#passo-1-carregando-sua-planilha-excel)
3. [Passo 2: Configurando o Tamanho da Carta e a Grade](#passo-2-configurando-o-tamanho-da-carta-e-a-grade)
4. [Passo 3: Criando e Redimensionando Seções](#passo-3-criando-e-redimensionando-seções)
5. [Passo 4: Vinculando Colunas da Planilha às Seções](#passo-4-vinculando-colunas-da-planilha-às-seções)
6. [Passo 5: Estilização e Personalização Visual](#passo-5-estilização-e-personalização-visual)
7. [Passo 6: Configurando o Verso da Carta](#passo-6-configurando-o-verso-da-carta)
8. [Passo 7: Salvar/Carregar Leiaute (.json)](#passo-7-salvarcarregar-leiaute-json)
9. [Passo 8: Gerar e Exportar (PDF / ZIP)](#passo-8-gerar-e-exportar-pdf--zip)
10. [Atalhos e Dicas Avançadas](#atalhos-e-dicas-avançadas)

---

## 1. Visão Geral e Fluxo de Trabalho

A interface da **Fábrica de Cartas** é dividida em 3 partes principais:

* ⬅️ **Painel Esquerdo (Dados & Colunas)**: Upload da planilha `.xlsx`, definição dos tipos de colunas (Texto, Imagem, Cor, Bordas) e reordenamento de camadas.
* 🖼️ **Área Central (Editor Canvas)**: Visualização em tempo real da carta, movimentação, redimensionamento de seções e ferramentas de zoom/pan.
* ➡️ **Painel Direito (Propriedades & Estilo)**: Configuração de dimensões da carta, tamanho da grade, fontes, cores, alinhamento, ajustes de imagem e guias de sangria.

---

## Passo 1: Carregando sua Planilha Excel

1. No painel esquerdo, clique no botão de upload de arquivo **.xlsx**.
2. Selecione a planilha contendo os dados do seu jogo.
   * *Exemplo de colunas*: `Nome`, `Tipo`, `Habilidade`, `Custo`, `Caminho_Imagem`, `Cor_Fundo`.
3. A aplicação extrairá automaticamente todas as colunas da planilha e as exibirá no painel esquerdo.

---

## Passo 2: Configurando o Tamanho da Carta e a Grade

No painel direito, ajuste as configurações iniciais do modelo:

1. **Largura da Carta (mm)** e **Altura da Carta (mm)**:
   * *Padrão Poker*: 63.5 mm x 88.9 mm
   * *Padrão Bridge*: 57 mm x 89 mm
   * *Padrão Mini*: 44 mm x 67 mm
2. **Tamanho da Grade (mm)**: Define a precisão do alinhamento (ex: 5mm ou 2.5mm).
3. **Atrelar à Grade (Snap to Grid)**: Quando ativado, os elementos se alinham automaticamente aos vértices da grade.
4. **Guias de Sangria (Bleed Guides)**: Ative para visualizar a margem de segurança para corte gráfico impresso.

---

## Passo 3: Criando e Redimensionando Seções

Uma **seção** é uma área retangular na carta reservada para exibir um texto, imagem ou elemento gráfico.

* **Criar uma Seção**:
  * Clique e arraste na área central (Canvas) para selecionar os blocos desejados da grade.
  * Clique com o **botão direito** sobre a seleção e escolha **"Criar Seção"**.
* **Mover / Redimensionar**:
  * Clique sobre uma seção para selecioná-la.
  * Arraste a seção para movê-la ou use as alças nos cantos para alterar seu tamanho.
* **Remover Seção**:
  * Clique com o botão direito sobre a seção e selecione **"Remover Seção"**.

---

## Passo 4: Vinculando Colunas da Planilha às Seções

1. No painel esquerdo, localize a coluna desejada (ex: `Nome`).
2. No menu suspenso ao lado da coluna, selecione o **Tipo de Dado**:
   * **Texto**: Renderiza o conteúdo textual da célula.
   * **Imagem**: Carrega a imagem a partir de uma URL ou caminho de arquivo local.
   * **Cor**: Aplica a cor hexadecimal especificada na célula como fundo da seção.
   * **Bordas**: Desenha molduras ou detalhes geométricos.
3. Clique no seletor de seção para vincular essa coluna a uma das seções criadas no Canvas.

---

## Passo 5: Estilização e Personalização Visual

Ao clicar em uma seção no Canvas ou no painel esquerdo, o painel direito exibirá todas as opções de personalização:

### Para Seções de Texto:
* **Família da Fonte**: Escolha entre fontes do sistema (Helvetica, Arial, Times New Roman, Courier, etc.).
* **Tamanho da Fonte (pt)**: Ajuste o tamanho do texto.
* **Estilo**: Ative **Negrito**, altere a **Cor do Texto** e a **Cor de Fundo da Seção**.
* **Alinhamento**:
  * *Horizontal*: Esquerda, Centro, Direita.
  * *Vertical*: Topo, Centro, Base.
* **Rotação**: Gire o texto em graus (0°, 90°, 180°, 270°).

### Para Seções de Imagem:
* **Ajuste de Imagem (Fit)**:
  * **Smart**: Ajusta proporcionalmente preenchendo a área sem distorcer.
  * **Cover**: Preenche 100% da área (pode cortar bordas).
  * **Contain**: Exibe a imagem inteira sem cortes (pode deixar espaços).
* **Filtros**: Ajuste de **Brilho** e **Contraste**.

---

## Passo 6: Configurando o Verso da Carta

Você pode configurar um verso padronizado para todas as cartas do conjunto:
1. No painel direito, acesse a seção **Verso da Carta**.
2. Escolha o tipo de verso:
   * **Cor Sólida**: Define uma cor padrão para as costas de todas as cartas.
   * **Imagem Única**: Selecione uma imagem padrão (ex: `verso_padrao.png`) para o verso.

---

## Passo 7: Salvar/Carregar Leiaute (.json)

Você pode salvar todo o seu trabalho de design para reaproveitar no futuro:

* **Salvar Leiaute**: Clique no botão **"Salvar Leiaute"** no cabeçalho superior. Um arquivo `.json` com todas as seções, posições e fontes será baixado.
* **Carregar Leiaute**: Clique em **"Carregar Leiaute"** e selecione o arquivo `.json` salvo previamente.

---

## Passo 8: Gerar e Exportar (PDF / ZIP)

Quando o modelo estiver pronto:

1. No cabeçalho superior, selecione o **Formato de Exportação**:
   * 📄 **PDF**: Gera um documento pronto para impressão em páginas A4/Carta com marcas de corte e múltiplas cartas por página.
   * 📦 **ZIP (JPG)**: Compacta e baixa cada carta gerada como uma imagem `.jpg` individual em alta resolução.
2. Clique no botão **"Gerar Cartas"**.
3. Aguarde o processamento. O download do arquivo final iniciará automaticamente!

---

## ⌨️ Atalhos e Dicas Avançadas

| Ação | Atalho / Comando |
| :--- | :--- |
| **Desfazer** | `Ctrl + Z` |
| **Refazer** | `Ctrl + Y` ou `Ctrl + Shift + Z` |
| **Zoom no Canvas** | Roda do mouse (`Scroll`) |
| **Pan (Mover Canvas)** | Segurar `Barra de Espaço` + Arrastar com o mouse |
| **Reordenar Camadas** | Arraste as colunas no painel esquerdo para cima/baixo para definir a sobreposição visual |
