# Scripts de Gerenciamento do Research Quest

Este diretório contém scripts para facilitar o desenvolvimento e gerenciamento da aplicação Research Quest.

## 📋 Scripts Disponíveis

### 1. **check-dependencies** - Verificação de Dependências
Verifica se todas as ferramentas necessárias estão instaladas e configuradas corretamente.

**Uso:**
```powershell
# Windows (duplo clique ou):
.\check-dependencies.bat

# PowerShell direto:
.\check-dependencies.ps1
```

**O que verifica:**
- ✅ Node.js (v16+)
- ✅ npm
- ✅ NestJS CLI (opcional)
- ✅ Git
- ✅ SQL Server e serviço MSSQLSERVER
- ✅ PowerShell
- ✅ Estrutura do projeto (backend/frontend)
- ✅ Dependências instaladas (node_modules)
- ✅ Portas 3000 e 3001

---

### 2. **start-dev** - Inicialização do Ambiente de Desenvolvimento
Inicia o backend e frontend automaticamente após verificar e preparar o ambiente.

**Uso:**
```powershell
# Windows (duplo clique ou):
.\start-dev.bat

# PowerShell direto:
.\start-dev.ps1
```

**O que faz:**
1. ✅ Verifica todas as dependências do sistema
2. 🧹 Encerra processos Node.js anteriores
3. 🔓 Libera portas 3000 e 3001
4. 📦 Instala dependências (npm install) se necessário
5. 🚀 Inicia backend em nova janela (porta 3001)
6. 🎨 Inicia frontend em nova janela (porta 3000)
7. 🌐 Abre navegador automaticamente

**Acesso após iniciar:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Documentação API (Swagger): http://localhost:3001/api/docs

---

### 3. **stop-dev** - Parar Todos os Serviços
Encerra todos os processos relacionados ao projeto (Node.js) e libera as portas.

**Uso:**
```powershell
# Windows (duplo clique ou):
.\stop-dev.bat

# PowerShell direto:
.\stop-dev.ps1
```

**O que faz:**
- 🛑 Encerra todos os processos Node.js
- 🔓 Libera portas 3000, 3001, 5000, 8080
- ✅ Garante limpeza completa do ambiente

---

## 🔧 Requisitos do Sistema

### Obrigatórios:
- **Node.js** v16 ou superior → https://nodejs.org/
- **npm** (incluído com Node.js)
- **SQL Server** (Express ou Developer) → https://www.microsoft.com/sql-server/sql-server-downloads
- **PowerShell** (já incluído no Windows)

### Recomendados:
- **NestJS CLI**: `npm install -g @nestjs/cli`
- **Git**: https://git-scm.com/download/win
- **SQL Server Management Studio (SSMS)**: https://aka.ms/ssmsfullsetup

---

## 🚀 Fluxo de Trabalho Recomendado

### Primeira vez usando o projeto:

1. **Verifique as dependências:**
   ```powershell
   .\check-dependencies.bat
   ```

2. **Se algo estiver faltando, instale as ferramentas necessárias**

3. **Inicie a aplicação:**
   ```powershell
   .\start-dev.bat
   ```

### Uso diário:

1. **Iniciar o projeto:**
   ```powershell
   .\start-dev.bat
   ```

2. **Trabalhar normalmente...**

3. **Parar os serviços ao finalizar:**
   ```powershell
   .\stop-dev.bat
   ```

### Se encontrar problemas:

1. **Pare todos os serviços:**
   ```powershell
   .\stop-dev.bat
   ```

2. **Verifique o ambiente:**
   ```powershell
   .\check-dependencies.bat
   ```

3. **Inicie novamente:**
   ```powershell
   .\start-dev.bat
   ```

---

## 🐛 Solução de Problemas Comuns

### "npm não é reconhecido como comando"
- **Solução**: Instale o Node.js de https://nodejs.org/
- Reinicie o PowerShell/terminal após a instalação

### "Porta 3000 ou 3001 já está em uso"
- **Solução**: Execute `.\stop-dev.bat` para liberar as portas

### "SQL Server não está rodando"
- **Solução**: O script tentará iniciar automaticamente
- Ou inicie manualmente: `services.msc` → procure "SQL Server (MSSQLSERVER)" → Iniciar

### "Erro ao instalar dependências"
- **Solução**: Delete as pastas `node_modules` e execute:
  ```powershell
  cd backend
  npm install
  cd ../frontend
  npm install
  ```

### Scripts PowerShell não executam
- **Solução**: Execute como Administrador:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

---

## 📝 Notas Importantes

- Os scripts PowerShell (`.ps1`) podem requerer permissões de execução
- Use os arquivos `.bat` para compatibilidade máxima
- O backend e frontend abrem em janelas separadas do PowerShell
- Feche as janelas dos servidores para encerrar a aplicação
- Logs e erros aparecem nas respectivas janelas do terminal

---

## 🔒 Segurança

- Scripts verificam e limpam processos antes de iniciar
- Não executam comandos destrutivos sem confirmação
- Limpeza de portas é feita de forma segura (stop gracefully)
- Processo SQL Server nunca é encerrado pelos scripts

---

## 📧 Suporte

Se encontrar problemas não cobertos aqui:
1. Verifique os logs nas janelas do backend/frontend
2. Execute `.\check-dependencies.bat` para diagnóstico
3. Consulte a documentação do projeto no README.md principal

---

## 📜 Licença

Estes scripts fazem parte do projeto Research Quest e seguem a mesma licença MIT do projeto.
