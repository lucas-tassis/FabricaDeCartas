# Restaurar a Fábrica de Cartas numa máquina zerada

> **Para quem lê isto:** escrito para o Claude Code seguir de cima para baixo depois de
> um format. Cada passo tem comando pronto e critério de sucesso — se o critério falhar,
> resolva ali antes de seguir.

Escrito em 2026-08-22. Spring Boot · Java 21 (compila e roda em JDK 25, verificado) ·
Vite · porta **8081**.

**Este projeto não tem senha e não tem banco de dados.** Nada a buscar em `SEGREDOS.md`,
nada a instalar de servidor de banco. É Spring Boot web servindo estáticos e tratando
upload de imagens.

---

## 0. O que sobreviveu ao format

O format pegou **só o C:**.

| O que | Onde | Sobreviveu? |
|---|---|---|
| Código-fonte | `D:\eclipse-workspace\FabricaDeCartas` + GitHub | sim, nos dois |
| `.m2` (1,8 GB) | `C:\Users\lucas\.m2` | **NÃO** |

Este é o projeto mais simples de restaurar da workspace: já estava limpo e sincronizado
antes do format, sem nada pendente e sem dado de usuário guardado.

---

## 1. Instalar as ferramentas

| Ferramenta | Versão desta máquina | Onde obter | Conferir |
|---|---|---|---|
| JDK | 25.0.1 | https://adoptium.net (Temurin 25) | `java -version` |
| Maven | 3.9.12 | já em `D:\eclipse-workspace\apache-maven-3.9.12` | `mvn -v` |
| Node.js | 24.13.1 (npm 11.8.0) | https://nodejs.org | `node -v` |
| Git / GitHub CLI | 2.53 / 2.93 | git-scm.com · cli.github.com | `git --version` |

Maven sobreviveu em `D:`, só falta o PATH:

```bash
setx PATH "%PATH%;D:\eclipse-workspace\apache-maven-3.9.12\bin"
```

O `pom.xml` pede Java 21, mas **compila e roda em JDK 25** — verificado em 2026-08-22,
`mvn compile` saiu com exit 0. Não instale um JDK 21 só por causa disto.

**Critério:** `java -version` mostra 25, `mvn -v` responde, `node -v` mostra v24.

---

## 2. Obter o código

```bash
gh auth login
```

```bash
git clone https://github.com/lucas-tassis/FabricaDeCartas.git D:/eclipse-workspace/FabricaDeCartas
```

O branch é `main`.

**Critério:** `git log --oneline -1` responde e existe `backend/pom.xml`.

---

## 3. Estrutura, para não procurar no lugar errado

O projeto tem um nível a mais do que parece: **tudo mora dentro de `backend/`**, e o
frontend fica **dentro** dele.

```
FabricaDeCartas/
└── backend/
    ├── pom.xml
    ├── frontend/     ← o Vite está aqui, não na raiz
    └── src/
```

Rodar `mvn` na raiz não funciona — não há `pom.xml` lá.

---

## 4. Compilar

Primeira build baixa ~1,8 GB — o `.m2` foi com o C:. **Online, sem `-o`.**

```bash
cd /d/eclipse-workspace/FabricaDeCartas/backend && mvn clean package -DskipTests
```

Frontend:

```bash
cd /d/eclipse-workspace/FabricaDeCartas/backend/frontend && npm install && npm run build
```

**Critério:** existe `backend/target/*.jar` e a build do Vite termina sem erro.

---

## 5. Rodar

```bash
cd /d/eclipse-workspace/FabricaDeCartas/backend && mvn spring-boot:run
```

Frontend em desenvolvimento:

```bash
cd /d/eclipse-workspace/FabricaDeCartas/backend/frontend && npm run dev
```

A porta é **8081**, definida como `${PORT:8081}` — a variável de ambiente `PORT`
sobrescreve, se você precisar de outra.

---

## 6. Conferir que funcionou

1. `http://localhost:8081` responde.
2. A interface carrega.
3. Subir um lote de imagens funciona — os limites de upload foram aumentados no
   `application.properties` justamente para lote grande. Se um lote grande falhar com
   erro de tamanho, é ali que se ajusta.
4. Uma carta é gerada.

---

## Armadilhas conhecidas

- **`mvn` na raiz não roda.** O `pom.xml` está em `backend/`.
- **O frontend não está na raiz nem em `frontend/`** — está em `backend/frontend/`.
- **Porta 8081, não 8080.** Os outros projetos da workspace usam 8080; este foi
  deslocado para conviver com eles.
- **`mvn -o` falha na primeira build.** Rode online uma vez para refazer o `.m2`.
- **Java 21 no `pom.xml`, JDK 25 na máquina, e funciona.** Verificado.
