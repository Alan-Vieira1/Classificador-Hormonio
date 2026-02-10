# Classificador de Frutas - Versão 2.0

## 🎯 Mudanças Principais da Versão 2.0

### Nova Arquitetura de Projetos
Completamente redesenhado com uma estrutura baseada em projetos e entradas por data.

## 📱 Estrutura do Aplicativo

### 1. Tela Inicial (Home)
- **Criar Novo Projeto**: Inicie um novo projeto de classificação (ex: "Melancias 2026")
- **Abrir Projeto**: Acesse projetos existentes
- **Projetos Recentes**: Acesso rápido aos últimos projetos usados
- Design profissional e limpo

### 2. Tela de Projeto
Ao abrir um projeto, você terá acesso a duas visualizações principais:

#### **Visualização de Entradas**
- Lista todas as medições organizadas por data
- Cada entrada mostra:
  - Data da medição
  - Média das Testemunhas
  - Média dos Testes
  - Comparação percentual
- Opções para editar ou excluir cada entrada

#### **Visualização de Gráfico**
- Gráfico de evolução ao longo do tempo
- **Filtro de Data**: Selecione um intervalo específico (ex: 01/01 a 19/01)
- Duas linhas principais:
  - Média Testemunhas (linha sólida azul)
  - Média Testes (linha tracejada amarela)
- Tooltips informativos ao passar o mouse

### 3. Criação/Edição de Entradas
Cada entrada contém:
- **Data da medição**
- **Limites de classificação** para 5 categorias
- **Medições** de 4 grupos (Testemunha 1, 2, Teste 1, 2)
- **Resultados automáticos** calculados em tempo real

## 🗂️ Estrutura de Dados

```
Projeto (ex: "Melancias 2026")
├── Entrada 01/01/2026
│   ├── Limites de Classificação
│   ├── Medições (Testemunhas 1,2 e Testes 1,2)
│   └── Resultados Calculados
├── Entrada 05/01/2026
│   └── ...
└── Entrada 10/01/2026
    └── ...
```

## 📊 Funcionalidades Principais

### ✅ Gerenciamento de Projetos
- Criar projetos independentes por tipo de fruta/experimento
- Cada projeto mantém seu histórico completo
- Excluir projetos quando não forem mais necessários

### ✅ Entradas por Data
- Adicionar múltiplas medições ao longo do tempo
- Editar entradas existentes se houver erros
- Excluir entradas específicas
- Organização automática por data

### ✅ Análise de Evolução
- Gráfico interativo mostrando tendências
- Filtro por intervalo de datas
- Visualização clara da progressão
- Comparação entre grupos ao longo do tempo

### ✅ Cálculos Automáticos
- Médias calculadas automaticamente
- Comparação percentual entre grupos
- Classificação por categorias
- Atualização em tempo real

## 🎨 Design Profissional

### Cores e Estética
- Paleta de cores sóbria e profissional
- Fundo escuro para reduzir fadiga visual
- Contraste otimizado para leitura
- Elementos visuais minimalistas

### Layout Responsivo
- Funciona em diferentes tamanhos de tela
- Organização intuitiva
- Navegação clara e direta

## 📋 Como Usar

### Primeiro Uso
1. Execute o aplicativo
2. Clique em "Novo Projeto"
3. Dê um nome ao projeto (ex: "Melancias Experimento A")
4. Opcional: Adicione uma descrição

### Adicionar Dados
1. Abra o projeto
2. Clique em "Nova Entrada"
3. Selecione a data da medição
4. Configure os limites de classificação
5. Adicione as medições de cada grupo
6. Os resultados são calculados automaticamente
7. Clique em "Salvar Entrada"

### Ver Evolução
1. Dentro do projeto, clique em "Gráfico"
2. Opcional: Use os filtros de data para focar em um período específico
3. Analise as tendências ao longo do tempo

### Editar Dados
1. Na lista de entradas, clique em "Editar" na entrada desejada
2. Modifique os valores necessários
3. Salve as alterações

## 🔧 Instalação e Execução

### Instalação de Dependências
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```

### Execução Normal
```bash
npm start
```

### Build para Distribuição
```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

## 📁 Estrutura de Arquivos

```
classificador-frutas-v2/
├── renderer/
│   ├── home.html          # Tela inicial
│   ├── home.css           # Estilos da tela inicial
│   ├── home.js            # Lógica da tela inicial
│   ├── index.html         # Tela do projeto
│   ├── styles.css         # Estilos da tela do projeto
│   └── script.js          # Lógica da tela do projeto
├── main.js                # Processo principal do Electron
├── preload.js             # Bridge de segurança
├── package.json           # Configurações e dependências
└── README.md              # Este arquivo
```

## 🗄️ Armazenamento de Dados

Os dados são salvos localmente em:
- **Windows**: `C:\Users\[SeuUsuario]\AppData\Roaming\classificador-frutas\saves\`
- **macOS**: `~/Library/Application Support/classificador-frutas/saves/`
- **Linux**: `~/.config/classificador-frutas/saves/`

Cada projeto é salvo como um arquivo JSON separado contendo todas as suas entradas.

## 🔄 Mudanças da Versão 1.0 para 2.0

### Removido
- ❌ Sistema antigo de "salvar projeto" (arquivos únicos)
- ❌ Botões de Importar/Exportar
- ❌ Comparação manual de múltiplos arquivos

### Adicionado
- ✅ Tela inicial com seleção de projetos
- ✅ Estrutura baseada em projetos
- ✅ Entradas organizadas por data
- ✅ Edição de entradas existentes
- ✅ Filtro de data nos gráficos
- ✅ Design completamente redesenhado

### Melhorado
- 🔄 Navegação mais intuitiva
- 🔄 Organização de dados mais lógica
- 🔄 Gráficos com mais opções de visualização
- 🔄 Interface mais profissional e séria

## 💡 Dicas de Uso

1. **Nomeie seus projetos claramente**: Use nomes descritivos como "Mangas - Experimento Hormônio A - 2026"

2. **Mantenha consistência nas datas**: Adicione entradas regularmente para melhor visualização no gráfico

3. **Use o filtro de data**: Ao analisar grandes períodos, use o filtro para focar em intervalos específicos

4. **Revise antes de salvar**: Os resultados são mostrados antes de salvar, verifique se estão corretos

5. **Edite quando necessário**: Se cometer um erro, use a função editar ao invés de criar nova entrada

## 🐛 Solução de Problemas

**Problema**: O gráfico não aparece
- **Solução**: Certifique-se de ter pelo menos 2 entradas no projeto

**Problema**: Não consigo editar uma entrada
- **Solução**: Cada data só pode ter uma entrada. Use a opção "Editar" na entrada existente

**Problema**: Projeto não aparece na lista
- **Solução**: Verifique se o projeto foi criado corretamente. Tente criar um novo projeto

## 📞 Suporte

Para reportar bugs ou sugerir melhorias, entre em contato com o desenvolvedor.

---

**Versão**: 2.0.0  
**Data de Lançamento**: Fevereiro 2026  
**Desenvolvido com**: Electron, Chart.js, JavaScript
