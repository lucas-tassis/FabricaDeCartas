# 🎴 Manual Completo do Usuário — Fábrica de Cartas

Bem-vindo à **Fábrica de Cartas**! Este é o guia definitivo passo a passo. Ele foi projetado para que **qualquer pessoa — mesmo quem nunca abriu o site ou criou um jogo de cartas antes — consiga entender e usar todas as funcionalidades do sistema com facilidade**.

---

## 📑 Sumário Rápidamente Navegável
1. [O que é a Fábrica de Cartas?](#1-o-que-é-a-fábrica-de-cartas)
2. [Passo 1: Preparando a sua Planilha Excel (.xlsx)](#2-passo-1-preparando-a-sua-planilha-excel-xlsx)
3. [Passo 2: Conhecendo a Tela e a Interface](#3-passo-2-conhecendo-a-tela-e-a-interface)
4. [Passo 3: Importando a Planilha no Site](#4-passo-3-importando-a-planilha-no-site)
5. [Passo 4: Definindo os Tipos de Coluna](#5-passo-4-definindo-os-tipos-de-coluna)
6. [Passo 5: Desenhando Seções na Carta (Formatos Retos e Irregulares)](#6-passo-5-desenhando-seções-na-carta-formatos-retos-e-irregulares)
7. [Passo 6: Vinculando Seções às Colunas da Planilha](#7-passo-6-vinculando-seções-às-colunas-da-planilha)
8. [Passo 7: Ajustes de Texto e Ajuste Automático de Fonte (Auto-Fit)](#8-passo-7-ajustes-de-texto-e-ajuste-automático-de-fonte-auto-fit)
9. [Passo 8: Ajustes de Imagens e Assets Locais](#9-passo-8-ajustes-de-imagens-e-assets-locais)
10. [Passo 9: Imagem de Fundo da Carta (Frente)](#10-passo-9-imagem-de-fundo-da-carta-frente)
11. [Passo 10: Gerenciamento de Camadas (Clique Direito e Botões)](#11-passo-10-gerenciamento-de-camadas-clique-direito-e-botões)
12. [Passo 11: Configurando o Verso das Cartas](#12-passo-11-configurando-o-verso-das-cartas)
13. [Passo 12: Salvar e Carregar Layouts (Projetos .json)](#13-passo-12-salvar-e-carregar-layouts-projetos-json)
14. [Passo 13: Exportação Final (PDF ou ZIP de Imagens)](#14-passo-13-exportação-final-pdf-ou-zip-de-imagens)
15. [Perguntas Frequentes e Dicas de Impressão](#15-perguntas-frequentes-e-dicas-de-impressão)

---

## 1. O que é a Fábrica de Cartas?

A **Fábrica de Cartas** é uma ferramenta web que automatiza a criação de jogos de cartas (board games, card games, flashcards educativos, protótipos de RPG, etc.).

Em vez de criar 50 ou 100 cartas uma a uma no Photoshop ou Canva, você apenas:
1. Digita os dados das suas cartas em uma **planilha do Excel** (como nomes, ataques, descrições e nomes de imagens).
2. Desenha o modelo visual (o **Layout**) na tela uma única vez.
3. O site gera **todas as cartas da planilha automaticamente** prontas para impressão!

---

## 2. Passo 1: Preparando a sua Planilha Excel (.xlsx)

Crie um arquivo comum no Excel (formato `.xlsx`) ou Google Planilhas.

### 📜 Como organizar as colunas:
* **Linha 1 (Cabeçalhos)**: Digite o nome de cada informação que sua carta terá.
  - *Exemplo*: `Nome`, `Tipo`, `Pontos`, `Descricao`, `Arte`, `CorMoldura`.
* **Linhas 2 em diante (Suas Cartas)**: Cada linha será uma carta diferente gerada no final.

#### 💡 Exemplo de Planilha de Exemplo:
| Nome | Tipo | Pontos | Descricao | Arte | CorMoldura |
| :--- | :--- | :---: | :--- | :--- | :--- |
| Mago de Fogo | Monstro | 5 | Lança uma bola de fogo que causa dano em área. | mago.jpg | #FF4444 |
| Poção de Cura | Item | 2 | Restaura 10 pontos de vida do jogador. | pocao.png | #44FF44 |
| Escudo de Aço | Equipamento | 4 | Bloqueia 5 de dano de ataques físicos. | escudo.jpg | #4488FF |

> **Dica de Imagens na Planilha**: Na coluna de imagens (ex: `Arte`), você pode digitar o nome do arquivo que enviará no site (ex: `mago.jpg`) ou colar um link público da internet (`https://site.com/foto.jpg`).

---

## 3. Passo 2: Conhecendo a Tela e a Interface

Ao abrir o site, você verá 3 partes principais:

```
+---------------------+-----------------------------------+---------------------+
| 1. DADOS BASE       | CANVA CENTRAL (ÁREA DE DESENHO)   | 3. PROPRIEDADES     |
| (Painel Esquerdo)   |                                   | (Painel Direito)    |
|                     | [ Controles de Zoom e Pan ]       |                     |
| 📂 Carregar Excel   | [ Desenho da Carta na Grade ]     | 📏 Tamanho Carta    |
| 📋 Lista Colunas    |                                   | 🔳 Tamanho Grade    |
| 🎨 Tipos de Dados   | 🖼️ Barra de Assets (Imagens)     | 🔤 Texto e Fonte    |
| 🔗 Vinculação       |                                   | 🃏 Verso da Carta   |
+---------------------+-----------------------------------+---------------------+
```

- **Painel Esquerdo (1. Dados Base)**: Onde você carrega o Excel e gerencia as colunas da planilha.
- **Canva Central (Desenho)**: A mesa de trabalho onde você desenha e visualiza a carta em tempo real.
- **Painel Direito (3. Propriedades)**: Onde você ajusta tamanhos, cores, fontes, rotação, imagens de fundo e versos.

---

## 4. Passo 3: Importando a Planilha no Site

1. No **Painel Esquerdo** (1. Dados Base), clique no grande quadrado pontilhado: **`Carregar Planilha (.xlsx ou .csv)`**.
2. Escolha o seu arquivo Excel no computador.
3. Assim que o arquivo for carregado:
   - A lista de colunas da sua planilha aparecerá abaixo.
   - O contador **Total de cartas** mostrará quantas cartas foram identificadas.
   - A carta no centro da tela entrará no modo **Pré-visualizar (Carta 1)**, mostrando os dados reais da primeira linha da sua planilha!

---

## 5. Passo 4: Definindo os Tipos de Coluna

Abaixo do nome de cada coluna no painel esquerdo, você encontrará 3 botões para indicar o que aquele dado representa:

- **Texto** (Padrão): Use para nomes, descrições, números, atributos e títulos.
- **Imagem**: Use para colunas que contêm nomes de arquivos de imagem ou links de fotos.
- **Cor**: Use para colunas que contêm códigos de cores (ex: `#FF0000`) para mudar a cor de fundos ou molduras dinamicamente a cada carta.

---

## 6. Passo 5: Desenhando Seções na Carta (Formatos Retos e Irregulares)

As **Seções** são as caixas na carta onde os textos, imagens ou cores serão exibidos.

### 📐 Como criar uma nova seção:
1. No **Canva Central**, a carta é dividida em uma grade (grid).
2. Clique com o botão esquerdo do mouse e **arraste para selecionar os quadradinhos da grade** onde deseja posicionar o elemento.
3. Você pode desenhar formatos tradicionais (retângulos) ou **formas irregulares em "L", "T", escadas ou blocos customizados**!
4. Clique com o **botão direito do mouse** sobre a área selecionada na grade.
5. Selecione a opção **`✨ Criar Seção`**.
6. Uma nova seção transparente surgirá exatamente na área desenhada!

---

## 7. Passo 6: Vinculando Seções às Colunas da Planilha

Para que a seção exiba a informação da sua planilha:
1. No **Painel Esquerdo**, encontre a coluna desejada (ex: `Nome`).
2. Abra o menu dropdown ao lado dela (**`Seções...`**).
3. Selecione a seção que você acabou de criar (ex: `Seção 1`).
4. Pronto! Instantaneamente o texto ou imagem da planilha aparecerá dentro da seção no Canva central!

---

## 8. Passo 7: Ajustes de Texto e Ajuste Automático de Fonte (Auto-Fit)

Ao clicar sobre qualquer seção de texto no Canva (ou selecioná-la no painel), o **Painel Direito (3. Propriedades)** abrirá os controles do elemento:

### 🔤 Recursos de Texto:
- **Cor de Fundo da Seção**: Por padrão, novas seções nascem **transparentes** (sem fundo) para não tampar a arte da carta. Se desejar, escolha uma cor no seletor.
- **Fonte (Tipografia)**: Escolha entre fontes padrão (`Helvetica`, `Times`, `Courier`) ou use os botões **`+ Enviar Fonte (.ttf/.otf)`** ou **`🔍 Buscar fontes do meu computador`** para usar qualquer fonte instalada no seu Windows!
- **Tamanho da Fonte (pt)**: Escolha o tamanho base do texto.
- **Alinhamentos**:
  - *Horizontal*: Esquerda | Centro | Direita.
  - *Vertical*: Topo | Meio | Fundo.
- **Rotação**: Digite um ângulo em graus (ex: `90` ou `270`) para girar o texto de lado ou de ponta-cabeça.

### 🧠 Ajuste Automático Inteligente de Fonte (Auto-Fit):
Você não precisa se preocupar com textos longos ou palavras grandes (ex: *"eletrônico"*, *"mamífero"*, *"Jogo de Tabuleiro"*)!
- **Quebra de Linha**: Textos longos quebram linhas automaticamente para preencher a largura da seção.
- **Redução Automática de Fonte**: Se o texto ou palavra for maior que a área desenhada, o sistema **reduz automaticamente o tamanho da fonte** até que o conteúdo caiba 100% dentro da seção!
- **Tamanho Fixo da Seção**: A seção **nunca altera o seu tamanho desenhado** e **nunca vaza para fora** ou para outras cartas.

---

## 9. Passo 8: Ajustes de Imagens e Assets Locais

Quando uma seção está vinculada a uma coluna de **Imagem**:

### 🖼️ Gerenciador de Imagens Locais (Barra de Assets):
- Na parte inferior do Canva central fica a barra **Imagens (Assets)**.
- Clique em **`+ Enviar Imagens`** e selecione todas as fotos do seu computador de uma vez (ex: `mago.jpg`, `pocao.png`, `escudo.jpg`).
- Na sua planilha Excel, basta que o texto da célula seja o nome exato do arquivo (ex: `mago.jpg`).

### 📐 Encaixe da Imagem (Image Fit):
 No Painel Direito, escolha como a imagem deve se ajustar dentro da seção:
- **Smart (Inteligente)**: Preserva a proporção da imagem sem distorcer.
- **Cover (Cobre tudo)**: Preenche 100% da seção (recorta excessos das pontas se necessário).
- **Contain (Contido)**: Garante que 100% da imagem seja visível sem cortes.
- **Fill (Preencher)**: Estica a imagem para preencher toda a largura e altura.
- **Filtros de Imagem**: Ajuste barras de **Brilho (%)** e **Contraste (%)** em tempo real.

---

## 10. Passo 9: Imagem de Fundo da Carta (Frente)

Se você desenhou uma moldura metálica, textura de pergaminho ou arte de fundo completa para a sua carta:

1. No **Painel Direito** (3. Propriedades), localize o bloco **`Imagem de Fundo (Frente)`**.
2. Clique em **`+ Enviar Imagem de Fundo`** e selecione a foto do seu computador.
3. A imagem cobrirá toda a superfície frontal da carta, ficando situada **atrás de todas as seções e textos**!

---

## 11. Passo 10: Gerenciamento de Camadas (Clique Direito e Botões)

Se você desenhou várias seções uma por cima da outra (ex: uma imagem, uma moldura por cima e o texto por cima de tudo), você pode controlar o que fica na frente ou atrás:

### 🖱️ Opção 1: Pelo Clique Direito sobre a Seção no Canva
Clique com o **botão direito do mouse** sobre qualquer seção no centro da tela para abrir o menu de contexto:
- **🔝 Trazer para o Topo**: Coloca a seção à frente de absolutamente tudo.
- **⬆️ Mover para Frente**: Sobe a seção 1 nível de camada.
- **⬇️ Mover para Trás**: Desce a seção 1 nível de camada.
- **🔚 Enviar para o Fundo**: Envia a seção para trás de todas as outras seções.
- **🗑️ Remover Seção**: Exclui a seção.

### 🎛️ Opção 2: Pelo Painel de Propriedades (Direito)
Ao selecionar uma seção, veja o indicador **`Camada (X de Y)`** no painel direito e use os botões **`🔝 Topo`**, **`⬆️ Subir`**, **`⬇️ Descer`** e **`🔚 Fundo`**.

---

## 12. Passo 11: Configurando o Verso das Cartas

No **Painel Direito**, abra a seção **Verso da Carta**:

1. **Escolha o Tipo de Verso**:
   - **Sem Verso**: Gera apenas as frentes das cartas.
   - **Imagem Fixa (Verso Único)**: Envie uma imagem (ex: o logo do seu jogo) que será impressa no verso de **todas** as cartas.
   - **Por Coluna da Planilha**: Permite que cada carta tenha um verso diferente indicado em uma coluna do Excel.
2. **Imposição do Verso (Duplex de Impressão)**:
   - **Página Separada**: Gera todas as frentes na página 1, 2, 3 e todos os versos nas páginas seguintes.
   - **Intercalado**: Alterna Página 1 (Frentes), Página 2 (Versos das frentes da pág 1 espelhados para impressão frente e verso na mesma folha).

---

## 13. Passo 12: Salvar e Carregar Layouts (Projetos .json)

Você não precisa redesenhar o modelo da sua carta toda vez que abrir o site!

- **Salvar Layout**: No topo do site, clique em **`Salvar Layout`**. Um arquivo `.json` será baixado no seu computador com todas as suas seções, tamanhos, fontes e cores salvas.
- **Carregar Layout**: Quando voltar ao site outro dia, clique em **`Carregar Layout`** e selecione seu arquivo `.json`. O modelo inteiro será reconstruído na hora!

---

## 14. Passo 13: Exportação Final (PDF ou ZIP de Imagens)

Quando o design da sua carta estiver pronto:

1. No topo da página, ao lado do botão de exportar, escolha o **Formato de Exportação**:
   - **PDF**: Gera um documento completo com todas as cartas alinhadas e prontas para impressão em papel A4.
   - **JPG (Pacote .ZIP)**: Gera um arquivo zipado contendo cada carta salva como uma imagem individual em alta resolução (ótimo para cadastrar no Tabletop Simulator ou enviar para gráficas).
2. Clique no botão amarelo **`Exportar Cartas`**.
3. O servidor processará e baixará seu arquivo final em segundos!

---

## 15. Perguntas Frequentes e Dicas de Impressão

### 🖨️ Qual papel usar para imprimir minhas cartas?
Para protótipos com sensação de cartas reais de jogos profissionais, use papéis de gramatura entre **250g/m² e 300g/m²** (como papel **Offset**, **Couché Brilho** ou **Couché Fosco**).

### ⚙️ As cartas saíram em tamanho diferente no PDF impresso. O que fazer?
Na janela de impressão do seu computador ou leitor de PDF (Adobe Reader/Chrome), certifique-se de que a opção de escala esteja em **`Tamanho Real` (100%)**, e NUNCA em *"Ajustar à página"*.

### 📐 O que são as Guias de Sangria (Bleed)?
No painel direito, marque a caixa **`Exibir Guias de Sangria (3mm)`**. Uma linha guia vermelha aparecerá ao redor da carta. A sangria garante que, ao cortar a carta com a guilhotina ou tesoura, não sobrem fiapos brancos nas bordas das cartas!

---

*Pronto! Agora você possui o conhecimento completo para criar qualquer jogo de cartas profissional na Fábrica de Cartas.* 🚀🎴
