# 🎴 Manual do Usuário Detalhado - Fábrica de Cartas

Bem-vindo ao **Guia Completo da Fábrica de Cartas**! Este manual foi elaborado para fornecer explicações aprofundadas sobre todas as funcionalidades, desde a preparação de planilhas Excel até a impressão gráfica de alta qualidade.

---

## 📑 Sumário Detalhado
1. [Conceitos Fundamentais](#1-conceitos-fundamentais)
2. [Estrutura da Planilha Excel (.xlsx)](#2-estrutura-da-planilha-excel-xlsx)
3. [Entendendo a Interface Visual](#3-entendendo-a-interface-visual)
4. [Tipos de Colunas e Como Funcionam](#4-tipos-de-colunas-e-como-funcionam)
5. [Editor de Layout e Manipulação de Seções](#5-editor-de-layout-e-manipulação-de-seções)
6. [Estilização Avançada (Texto e Imagem)](#6-estilização-avançada-texto-e-imagem)
7. [Configuração do Verso da Carta e Impressão Duplex](#7-configuração-do-verso-da-carta-e-impressão-duplex)
8. [Painel de Imagens Locais (Assets)](#8-painel-de-imagens-locais-assets)
9. [Exemplo Prático Explicado (Passo a Passo)](#9-exemplo-prático-explicado-passo-a-passo)
10. [Exportação, Impressão e Corte Gráfico](#10-exportação-impressão-e-corte-gráfico)
11. [Solução de Problemas (Troubleshooting)](#11-solução-de-problemas-troubleshooting)

---

## 1. Conceitos Fundamentais

A **Fábrica de Cartas** é um gerador de mídia baseado em modelos (templates). Ela combina dois elementos essenciais:
1. **Dados (Planilha Excel)**: Onde ficam os textos, atributos, nomes de arquivo de imagem e cores específicas de cada carta.
2. **Modelo (Layout)**: Onde você desenha visualmente *onde* e *como* cada dado será exibido na superfície da carta.

A ferramenta gera automaticamente **N cartas** a partir das **N linhas** da sua planilha.

---

## 2. Estrutura da Planilha Excel (.xlsx)

Para que a aplicação leia seus dados sem erros, siga estas regras simples na construção do seu arquivo `.xlsx`:

### Regras do Arquivo:
* **Linha 1 (Cabeçalhos)**: Deve conter os nomes das colunas (ex: `Nome`, `Ataque`, `Defesa`, `Descricao`, `Foto`, `CorFundo`).
* **Linhas 2 em diante (Cartas)**: Cada linha representa uma carta individual.
* **Formatação de Dados por Coluna**:
  * **Texto**: Digite livremente qualquer texto ou número (ex: *"Mago Negro"*, *"3"*, *"Causa 5 de dano em área"*).
  * **Caminhos de Imagem**: Aceita:
    * URLs públicas na web (`https://site.com/imagens/dragao.jpg`).
    * Nomes de arquivos previamente carregados na aba de Assets (`dragao.jpg`).
  * **Cores**: Aceita códigos Hexadecimais (`#FF0000` para vermelho, `#0088FF` para azul) ou nomes de cores padrão CSS (`red`, `blue`, `black`, `gold`).

#### Exemplo de Tabela Excel:
| Nome | Tipo | Ataque | Defesa | Foto | CorFundo |
| :--- | :--- | :---: | :---: | :--- | :--- |
| Dragão de Fogo | Monstro | 8 | 5 | dragao.jpg | #FF4444 |
| Escudo Real | Item | 0 | 4 | escudo.png | #4488FF |
| Poção Solar | Magia | 0 | 0 | pocao.jpg | #FFCC00 |

---

## 3. Entendendo a Interface Visual

A tela é organizada em 3 grandes zonas funcionais:

```
+------------------+----------------------------------+------------------+
| PAINEL ESQUERDO  |          ÁREA CENTRAL            |  PAINEL DIREITO  |
|                  |          (CANVAS EDITOR)         |                  |
| 📂 Upload Excel  |                                  | 📏 Tamanho Carta |
| 📋 Lista Colunas |       [ Visualização da ]        | 🔳 Tamanho Grade |
| 🔀 Tipo Dado     |       [  Carta com Zoom ]        | 🔤 Fontes/Cores  |
| 🧱 Camadas       |                                  | 🖼️ Fit de Imagem |
|                  |  🖼️ Gerenciador de Assets        | 🃏 Verso Carta   |
+------------------+----------------------------------+------------------+
```

---

## 4. Tipos de Colunas e Como Funcionam

Ao carregar a planilha, você deve atribuir um **Tipo** para cada coluna no painel esquerdo:

### 1. `Texto` (Padrão)
* Escreve o texto da célula na posição da seção.
* Ajusta automaticamente a quebra de linha se o texto for longo.
* Permite controle completo de fonte, cor, alinhamento e rotação.

### 2. `Imagem`
* Carrega e desenha a imagem indicada na célula.
* Possui opções avançadas de redimensionamento (*Smart Fit*, *Cover*, *Contain*).
* Suporta conversão de Espaço de Cor para **CMYK** (ideal para impressoras gráficas).

### 3. `Cor`
* Lê o código hexadecimal da célula e preenche o fundo da seção com aquela cor.
* Útil para dinamicamente alterar a cor de molduras, barras de atributos ou fundos de acordo com a classe/elemento da carta.

### 4. `Bordas`
* Desenha padrões geométricos de borda ou molduras personalizadas com base nos quadrados selecionados na grade.

---

## 5. Editor de Layout e Manipulação de Seções

### Como criar uma seção:
1. No Canvas central, clique e segure com o botão esquerdo para selecionar a área desejada da grade.
2. Clique com o **botão direito** sobre os blocos destacados.
3. Clique em **"Criar Seção"**.

### Camadas e Sobreposição (Z-Index / Render Order):
* As seções são renderizadas na ordem em que aparecem no **Painel Esquerdo**.
* **Reordenar Camadas**: Clique e arraste as colunas para cima ou para baixo no painel esquerdo.
  * *Colunas no topo*: Ficam ao fundo (Background).
  * *Colunas na base*: Ficam na frente (Foreground/Sobreposição).

---

## 6. Estilização Avançada (Texto e Imagem)

Quando uma seção está selecionada, o **Painel Direito** expõe os seguintes ajustes:

### 🔤 Ajustes de Texto:
* **Fonte**: Escolha entre fontes vetoriais limpas (`Helvetica`, `Arial`, `Times New Roman`, `Courier`).
* **Tamanho**: Ajuste o tamanho em pontos (`pt`).
* **Negrito**: Ative o botão **B** para destacar títulos e valores.
* **Alinhamentos**:
  * *Horizontal*: Esquerda | Centro | Direita.
  * *Vertical*: Topo | Centro | Base.
* **Rotação**: Rotação em 90°, 180° ou 270° (excelente para cartas com textos laterais ou invertidos).

### 🖼️ Ajustes de Imagem:
* **Modo de Encaixe (Fit)**:
  * `Smart`: Encaixe inteligente que preserva a proporção sem distorção.
  * `Cover`: Preenche toda a seção (pode recortar as bordas da imagem).
  * `Contain`: Exibe 100% da imagem (pode gerar margens transparentes).
* **Filtros Gráficos**:
  * **Brilho (%)**: De 0% (escuro) a 200% (super exposto).
  * **Contraste (%)**: Ajuste para destacar detalhes de ilustrações.
* **Espaço de Cor**: Escolha entre **RGB** (Telas/Web) ou **CMYK** (Impressão Profissional).

### 👁️ Pré-visualização em Tempo Real (Carta 1)
Ao enviar a sua planilha Excel, a Fábrica de Cartas ativa automaticamente o modo de **Pré-visualização em Tempo Real**:
1. **Dados Reais**: As seções vinculadas exibem instantaneamente os textos, cores e imagens referentes à **primeira carta da sua planilha**.
2. **Edição Live (WYSIWYG)**: À medida que você altera o tamanho da fonte, família tipográfica, cor, alinhamento, rotação, ajustes de imagem (brilho/contraste) ou dimensões da seção, o Canvas se atualiza **em tempo real**!
3. **Alternador de Modo**: No canto superior esquerdo do Canvas, você pode alternar entre:
   - **`👁️ Pré-visualizar (Carta 1)`**: Exibe a arte final da primeira carta com os dados reais preenchidos.
   - **`📝 Modo Estrutura [Colunas]`**: Exibe os rótulos genéricos das colunas para facilitar o desenho técnico das seções.

### 🔤 Fontes Personalizadas (.ttf / .otf) e Fontes do Computador
A Fábrica de Cartas suporta o uso de **fontes personalizadas** no seu design:
1. **Enviar arquivo de fonte (.ttf / .otf)**:
   - No **Painel Direito**, ao selecionar uma seção de texto, clique no botão **`+ Enviar Fonte (.ttf / .otf)`**.
   - Selecione o arquivo de fonte no seu computador.
   - O arquivo será registrado no servidor para a renderização vetorial no PDF e carregado dinamicamente no navegador para pré-visualização instantânea no Canvas!
2. **Buscar fontes do computador (Navegadores Chrome/Edge)**:
   - Se estiver usando o Chrome ou Edge, clique no botão **`🔍 Buscar fontes do meu computador`**.
   - O navegador solicitará permissão e listará automaticamente todas as famílias de fontes instaladas no seu sistema operacional!

### 🔄 Rotação de 90° na Impressão (Otimização de Espaço)
Se você criar um design de carta na **horizontal** (ex: *88.9 mm de largura por 63.5 mm de altura*), é possível otimizar a distribuição no papel A4 ativando a rotação de 90°:
1. No **Painel Direito** (Propriedades), marque a caixa de seleção **"Girar 90° no PDF (Otimizar Impressão)"**.
2. Ao gerar o PDF, o motor de layout girará cada carta em 90° automaticamente antes de distribuí-las na folha.
3. Isso recalcula o encaixe para caber mais cartas por página (ex: de 8 cartas para **9 cartas por folha A4**).

---

## 7. Configuração do Verso da Carta e Impressão Duplex

No painel direito, expanda a aba **Verso da Carta**:

1. **Ativar Verso**: Selecione `Cor Sólida` ou `Imagem Única`.
2. **Duplex / Alinhamento de Impressão**:
   * **Frente e Verso Separados**: Gera as frentes primeiro e os versos nas páginas seguintes.
   * **Duplex Espelhado (Frente e Verso na Mesma Folha)**: Ao imprimir em folha dupla face ou ao virar a folha na impressora, a coluna da direita do verso alinha-se perfeitamente com a coluna da esquerda da frente!

---

## 8. Painel de Imagens Locais (Assets)

Abaixo do Canvas central fica a barra de **Assets de Imagem**:
* Você pode arrastar imagens do seu computador para esta barra.
* Ao colocar o nome do arquivo (ex: `icone_espada.png`) na sua planilha Excel, a Fábrica de Cartas buscará a imagem diretamente desses assets carregados, sem precisar hospedá-la na internet!

---

## 9. Exemplo Prático Explicado (Passo a Passo)

Vamos criar um jogo de cartas de batalhas:

1. **Prepare a Planilha**: Crie `cartas.xlsx` com as colunas `Nome`, `Ataque`, `Ilustracao` e `CorTipo`.
2. **Faça o Upload**: Importe o arquivo na Fábrica de Cartas.
3. **Crie as Seções**:
   - Seção 1 (Fundo): Cubra a carta inteira -> Vincule com `CorTipo` (Tipo: Cor).
   - Seção 2 (Ilustração): Selecione o centro da carta -> Vincule com `Ilustracao` (Tipo: Imagem, Fit: Cover).
   - Seção 3 (Título): Selecione o topo da carta -> Vincule com `Nome` (Tipo: Texto, Fonte: Helvetica, Bold, Tam: 16pt, Alinhar: Centro).
   - Seção 4 (Ataque): Selecione o canto inferior -> Vincule com `Ataque` (Tipo: Texto, Tam: 20pt, Cor: Vermelho).
4. **Exporte**: Escolha **PDF** e clique em **Gerar Cartas**.

---

## 10. Exportação, Impressão e Corte Gráfico

### Dicas para Impressão Perfeita:
* **Sangria (Bleed Guides)**: Ative as guias de sangria no painel direito. Certifique-se de que as imagens de fundo ultrapassem ligeiramente a linha vermelha de corte para que não apareçam fiapos brancos ao cortar a carta com guilhotina ou tesoura.
* **Papel Recomendado**: Para protótipos de cartas, utilize papéis de gramatura alta (ex: **Offset ou Couché 250g/m² a 300g/m²**).
* **Impressão sem Escala**: Ao abrir o PDF gerado no seu leitor de PDF (ex: Adobe Acrobat), certifique-se de selecionar a opção **"Tamanho Real" (100%)** nas configurações de impressão para manter os tamanhos em milímetros exatos.

---

## 11. Solução de Problemas (Troubleshooting)

| Problema | Causa Provável | Solução |
| :--- | :--- | :--- |
| **A imagem não aparece na carta** | Nome do arquivo ou URL incorreta na planilha | Verifique se o nome do arquivo no Excel bate exatamente com o nome da imagem na aba de Assets ou se a URL é válida. |
| **O texto está cortando** | Seção muito pequena ou fonte muito grande | Redimensione a seção puxando as alças no Canvas ou reduza o tamanho da fonte no painel direito. |
| **Elemento cobrindo o outro** | Ordem das camadas incorreta | No painel esquerdo, arraste a coluna do elemento que deve ficar por cima para o final da lista. |
| **O PDF impresso ficou menor/maior** | Escala da impressora ajustada para "Ajustar à página" | Na janela de impressão do seu computador, mude de "Ajustar" para "Tamanho Real (100%)". |
