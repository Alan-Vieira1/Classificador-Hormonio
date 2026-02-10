# REGISTRO DE MUDANÇAS - Versão 2.0

## 🚀 VERSÃO 2.0.0 - Fevereiro 2026

### MUDANÇA ARQUITETURAL COMPLETA

Esta é uma **reescrita completa** do aplicativo com uma nova arquitetura e filosofia de uso.

---

## 📋 RESUMO DAS MUDANÇAS

### ✅ NOVO: Tela Inicial (Startup Screen)
**Antes**: O app abria diretamente na tela de entrada de dados  
**Agora**: Tela inicial com opções para criar ou abrir projetos

**Funcionalidades da Tela Inicial:**
- ➕ Criar Novo Projeto
- 📂 Abrir Projeto Existente
- 🕒 Projetos Recentes (acesso rápido)
- 🔍 Busca de projetos
- 🗑️ Excluir projetos

---

### ✅ NOVO: Estrutura Baseada em Projetos

**ANTES (v1.0):**
```
Cada "salvar" criava um arquivo separado:
- projeto_manga_1738267890.json
- projeto_manga_1738354290.json
- projeto_manga_1738440690.json

Problema: Difícil organizar e comparar dados do mesmo experimento
```

**AGORA (v2.0):**
```
Cada projeto contém múltiplas entradas por data:

Projeto: "Mangas 2026"
  ├── 01/01/2026 (entrada)
  ├── 05/01/2026 (entrada)
  ├── 10/01/2026 (entrada)
  └── 15/01/2026 (entrada)

Vantagem: Organização lógica, fácil comparação, análise de evolução
```

---

### ✅ NOVO: Entradas Organizadas por Data

Cada projeto agora contém múltiplas entradas, cada uma com:
- **Data única** (não pode ter duas entradas na mesma data)
- **Limites de classificação** (podem variar entre entradas)
- **Medições** dos 4 grupos
- **Resultados calculados** automaticamente

**Benefícios:**
- Rastreabilidade temporal
- Histórico completo do experimento
- Análise de tendências
- Edição de dados retroativos

---

### ✅ NOVO: Edição de Entradas Existentes

**Antes**: Não era possível editar dados salvos  
**Agora**: Clique em "Editar" em qualquer entrada para modificar

**Casos de Uso:**
- Corrigir erros de digitação
- Atualizar medições
- Ajustar limites de classificação
- Modificar valores incorretos

---

### ✅ NOVO: Gráfico com Filtro de Data

**ANTES (v1.0):**
```
- Selecionava múltiplos arquivos manualmente
- Gerava múltiplas linhas confusas
- Difícil visualizar evolução
- Sem controle sobre o período analisado
```

**AGORA (v2.0):**
```
- Gráfico automático de todas as entradas
- Filtro de data: "De: 01/01/2026 Até: 19/01/2026"
- Apenas 2 linhas claras:
  * Média Testemunhas (azul sólida)
  * Média Testes (amarela tracejada)
- Fácil focar em períodos específicos
```

**Exemplo de Uso:**
1. Projeto tem 30 entradas (janeiro a junho)
2. Quer ver apenas janeiro: Define filtro "01/01 a 31/01"
3. Gráfico atualiza instantaneamente
4. Reseta o filtro para ver tudo novamente

---

### ✅ MELHORADO: Design Profissional e Sério

**Mudanças Visuais:**

1. **Paleta de Cores**
   - Antes: Cores vibrantes (vermelho brilhante, azul elétrico)
   - Agora: Tons sóbrios e profissionais
   - Fundo escuro: Reduz fadiga visual
   - Acentos em azul ciano (#4dd0e1)

2. **Layout**
   - Antes: Tudo em uma única página rolável
   - Agora: Navegação por abas (Entradas / Gráfico)
   - Barra de navegação superior
   - Melhor uso do espaço

3. **Tipografia**
   - Fontes mais legíveis
   - Hierarquia visual clara
   - Espaçamento otimizado

4. **Componentes**
   - Cards para entradas
   - Modais maiores para edição
   - Inputs agrupados logicamente
   - Botões com ícones descritivos

---

### ❌ REMOVIDO: Botões de Importar/Exportar

**Razão da Remoção:**
Na nova arquitetura, não é necessário exportar/importar pois:
- Cada projeto é auto-contido
- Dados são salvos automaticamente
- Organização é feita por projetos, não por arquivos

**Alternativa:**
Se precisar mover dados entre computadores:
- Copie a pasta de dados do app (ver README para localização)
- Ou exporte individualmente no futuro (feature planejada)

---

### ❌ REMOVIDO: Conceito de "Projeto" como Nome de Fruta na Entrada

**Antes**: Campo "Nome da Fruta / Projeto" em cada entrada  
**Agora**: Nome do projeto definido uma vez ao criar o projeto

**Vantagem:**
- Menos redundância
- Organização mais clara
- Nome do projeto sempre visível no topo

---

## 🔄 FLUXO DE TRABALHO ATUALIZADO

### Fluxo Antigo (v1.0):
```
1. Abrir app
2. Inserir nome da fruta
3. Configurar limites
4. Adicionar medições
5. Salvar projeto (gera arquivo único)
6. Repetir processo inteiro para cada medição
7. Para comparar: Abrir modal, selecionar vários arquivos
```

### Fluxo Novo (v2.0):
```
1. Abrir app → Tela inicial
2. Criar novo projeto "Mangas 2026"
3. Adicionar primeira entrada (01/01/2026)
4. Depois de alguns dias: Adicionar nova entrada (05/01/2026)
5. Continuar adicionando entradas conforme necessário
6. Para comparar: Clicar em "Gráfico" (automático!)
7. Filtrar por data se necessário
8. Editar qualquer entrada a qualquer momento
```

---

## 📊 COMPARAÇÃO LADO A LADO

| Aspecto | v1.0 | v2.0 |
|---------|------|------|
| **Organização** | Por arquivo | Por projeto |
| **Múltiplas medições** | Vários arquivos | Um projeto, várias entradas |
| **Edição** | ❌ Não permitida | ✅ Qualquer entrada |
| **Gráfico** | Seleção manual | Automático + filtro |
| **Navegação** | Uma tela única | Tela inicial + telas de projeto |
| **Design** | Colorido casual | Profissional sóbrio |
| **Filtro de data** | ❌ Não existe | ✅ Intervalo customizado |
| **Busca** | ❌ Não existe | ✅ Busca por nome |
| **Importar/Exportar** | ✅ Disponível | ❌ Removido |

---

## 🎯 CASOS DE USO PRÁTICOS

### Caso 1: Experimento de Longo Prazo
**Cenário**: Teste de hormônio em mangas durante 6 meses

**v1.0**: Criaria ~180 arquivos separados (1 por dia)  
**v2.0**: 1 projeto com 180 entradas organizadas

### Caso 2: Comparar Início vs Fim
**Cenário**: Ver diferença entre janeiro e junho

**v1.0**: Selecionar manualmente 60 arquivos de janeiro e 60 de junho  
**v2.0**: Filtro de data "01/01 a 31/01" depois "01/06 a 30/06"

### Caso 3: Corrigir Erro de Digitação
**Cenário**: Percebeu que digitou 0.150 ao invés de 0.015 na semana passada

**v1.0**: Impossível corrigir, teria que criar novo arquivo  
**v2.0**: Editar a entrada da data específica, corrigir, salvar

---

## 🛠️ DETALHES TÉCNICOS

### Mudanças no Backend

1. **Novo Sistema de Arquivos**
   - Antes: `projeto_nome_timestamp.json`
   - Agora: `project_id.json` contendo array de entradas

2. **Novos IPC Handlers**
   - `load-all-projects`: Carrega lista de projetos
   - `create-project`: Cria novo projeto
   - `load-project`: Carrega projeto específico
   - `save-entry`: Salva/atualiza entrada
   - `delete-entry`: Remove entrada
   - `delete-project`: Remove projeto inteiro

3. **Estrutura de Dados**
```json
{
  "id": "1738267890",
  "name": "Mangas 2026",
  "description": "Experimento com hormônio A",
  "createdAt": "2026-01-01T00:00:00Z",
  "lastModified": "2026-01-15T12:30:00Z",
  "entries": [
    {
      "date": "2026-01-01",
      "limits": { ... },
      "measurements": { ... },
      "results": { ... }
    },
    {
      "date": "2026-01-05",
      "limits": { ... },
      "measurements": { ... },
      "results": { ... }
    }
  ]
}
```

### Mudanças no Frontend

1. **Novos Arquivos**
   - `home.html`: Tela inicial
   - `home.css`: Estilos da tela inicial
   - `home.js`: Lógica da tela inicial

2. **Arquivos Reescritos**
   - `index.html`: Agora é a tela do projeto
   - `styles.css`: Design profissional completo
   - `script.js`: Nova lógica de gerenciamento

3. **Dependências Atualizadas**
   - Chart.js com adaptador de datas
   - Melhor renderização de gráficos temporais

---

## 📈 BENEFÍCIOS DA VERSÃO 2.0

### Para o Usuário
1. ✅ Organização muito mais lógica
2. ✅ Menos cliques para tarefas comuns
3. ✅ Capacidade de corrigir erros
4. ✅ Análise temporal mais fácil
5. ✅ Interface mais profissional
6. ✅ Busca e filtros poderosos

### Para Análise de Dados
1. ✅ Tendências visuais claras
2. ✅ Filtros flexíveis
3. ✅ Comparação automática
4. ✅ Histórico completo mantido
5. ✅ Dados sempre acessíveis

### Para Manutenção
1. ✅ Código mais organizado
2. ✅ Arquitetura escalável
3. ✅ Fácil adicionar features
4. ✅ Melhor separação de responsabilidades

---

## 🔮 FUTURAS MELHORIAS PLANEJADAS

- [ ] Exportação de projeto para PDF
- [ ] Importar/Exportar projetos (arquivo .zip)
- [ ] Gráficos adicionais (barras, pizza)
- [ ] Estatísticas avançadas
- [ ] Comparação entre projetos
- [ ] Tags e categorias para projetos
- [ ] Backup automático
- [ ] Modo escuro/claro
- [ ] Temas customizáveis

---

## ⚠️ MIGRAÇÃO DA v1.0 PARA v2.0

**Importante**: A v2.0 **NÃO é compatível** com dados da v1.0 automaticamente.

**Se você tem dados da v1.0:**
1. Faça backup dos seus arquivos antigos
2. Crie um novo projeto na v2.0
3. Recrie manualmente as entradas importantes
   OU
4. Aguarde ferramenta de migração (em desenvolvimento)

**Localização dos arquivos antigos:**
- Windows: `C:\Users\[Usuário]\AppData\Roaming\classificador-frutas\saves\`
- macOS: `~/Library/Application Support/classificador-frutas/saves/`
- Linux: `~/.config/classificador-frutas/saves/`

---

## ✅ CONCLUSÃO

A versão 2.0 representa uma **evolução completa** do aplicativo, tornando-o:
- Mais **profissional**
- Mais **organizado**
- Mais **poderoso**
- Mais **fácil de usar**

Todas as mudanças foram pensadas para melhorar a experiência do usuário e a qualidade da análise de dados.

---

**Desenvolvido com ❤️ para análise científica de frutas**
