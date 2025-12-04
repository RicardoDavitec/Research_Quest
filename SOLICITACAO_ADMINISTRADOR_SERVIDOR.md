# SOLICITAÇÃO AO ADMINISTRADOR DO SERVIDOR
## Sistema ResearchQuest - Banco de Dados PostgreSQL

---

**Data:** 04 de Dezembro de 2025  
**Servidor:** 172.21.31.152:5432  
**Banco de dados:** ricardodavid  
**Solicitante:** Ricardo David  
**Sistema:** ResearchQuest - Plataforma de Gestão de Pesquisas

---

## 📌 RESUMO EXECUTIVO

Solicitamos a instalação da extensão **pgVector** no servidor PostgreSQL para habilitar funcionalidades de busca semântica de questões no sistema ResearchQuest. Esta extensão é essencial para o funcionamento completo da plataforma.

---

## 🔴 PRIORIDADE ALTA

### 1. Instalação da Extensão pgVector

#### Contexto
O sistema ResearchQuest utiliza inteligência artificial para sugerir questões similares aos pesquisadores, evitando duplicação de trabalho e melhorando a qualidade dos questionários. Para isso, é necessária a extensão pgVector que permite armazenar e buscar embeddings vetoriais.

#### Procedimento de Instalação

##### Opção A: Instalação via Gerenciador de Pacotes (Recomendado)

```bash
# 1. Conectar ao servidor
ssh admin@172.21.31.152

# 2. Verificar versão do PostgreSQL instalada
psql --version

# 3. Instalar extensão pgVector
# Para PostgreSQL 16:
sudo apt update
sudo apt install postgresql-16-pgvector

# Para PostgreSQL 15:
# sudo apt install postgresql-15-pgvector

# Para PostgreSQL 14:
# sudo apt install postgresql-14-pgvector
```

##### Opção B: Compilação do Código Fonte (se pacote não disponível)

```bash
# 1. Instalar dependências
sudo apt install -y build-essential postgresql-server-dev-16 git

# 2. Baixar código fonte
cd /tmp
git clone --branch v0.5.1 https://github.com/pgvector/pgvector.git
cd pgvector

# 3. Compilar e instalar
make
sudo make install

# 4. Limpar arquivos temporários
cd ..
rm -rf pgvector
```

#### Ativação da Extensão no Banco de Dados

```bash
# Conectar ao banco ricardodavid
sudo -u postgres psql -d ricardodavid
```

```sql
-- Habilitar extensão pgVector
CREATE EXTENSION IF NOT EXISTS vector;

-- Verificar se foi instalada corretamente
\dx vector

-- Saída esperada:
-- List of installed extensions
-- Name   | Version | Schema | Description
-- -------+---------+--------+-------------
-- vector | 0.5.1   | public | vector data type and ivfflat access method

-- Testar funcionalidade básica
SELECT '[1,2,3]'::vector;

-- Sair
\q
```

#### Verificação da Instalação

```sql
-- Consulta para verificar se extensão está disponível
SELECT * FROM pg_available_extensions WHERE name = 'vector';

-- Consulta para verificar se extensão está ativada
SELECT * FROM pg_extension WHERE extname = 'vector';
```

**Resultado Esperado:** Ambas as consultas devem retornar informações sobre a extensão vector.

---

## 🟡 PRIORIDADE MÉDIA

### 2. Verificação de Configurações

Por favor, confirmar/ajustar as seguintes configurações no arquivo `postgresql.conf`:

```ini
# Conexões
max_connections = 100                    # Ajustar conforme necessidade do sistema

# Memória
shared_buffers = 256MB                   # Mínimo recomendado (ajustar conforme RAM disponível)
effective_cache_size = 1GB               # ~50-75% da RAM total
work_mem = 4MB                           # Memória para operações de ordenação
maintenance_work_mem = 64MB              # Memória para manutenção (VACUUM, CREATE INDEX)

# Logging para monitoramento (opcional)
logging_collector = on
log_directory = 'pg_log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_min_duration_statement = 1000        # Log queries > 1 segundo

# Performance para pgVector
shared_preload_libraries = 'pg_stat_statements'  # Monitoramento de queries
```

Após alterações em `postgresql.conf`:
```bash
sudo systemctl restart postgresql
```

---

## 🟢 PRIORIDADE BAIXA

### 3. Backup Automático (Recomendado)

#### Configuração de Backup Diário

```bash
# Criar diretório de backup
sudo mkdir -p /backup/postgresql
sudo chown postgres:postgres /backup/postgresql

# Criar script de backup
sudo nano /usr/local/bin/backup-ricardodavid.sh
```

Conteúdo do script:
```bash
#!/bin/bash
BACKUP_DIR="/backup/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="ricardodavid"

# Backup completo
pg_dump -U postgres $DB_NAME | gzip > $BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz

# Manter apenas últimos 30 dias
find $BACKUP_DIR -name "${DB_NAME}_*.sql.gz" -mtime +30 -delete

# Log
echo "Backup concluído: ${DATE}" >> $BACKUP_DIR/backup.log
```

```bash
# Tornar executável
sudo chmod +x /usr/local/bin/backup-ricardodavid.sh

# Agendar via cron (execução diária às 2h da manhã)
sudo crontab -e

# Adicionar linha:
0 2 * * * /usr/local/bin/backup-ricardodavid.sh
```

### 4. Limpeza Automática de Dados Temporários

O sistema gera tokens de atualização (refresh tokens) que expiram após 30 dias. Recomendamos limpeza periódica:

```bash
# Criar script de limpeza
sudo nano /usr/local/bin/cleanup-expired-tokens.sh
```

Conteúdo:
```bash
#!/bin/bash
psql -U postgres -d ricardodavid -c "DELETE FROM refresh_tokens WHERE expires_at < NOW();"
echo "Tokens expirados removidos: $(date)" >> /var/log/token-cleanup.log
```

```bash
# Tornar executável
sudo chmod +x /usr/local/bin/cleanup-expired-tokens.sh

# Agendar execução semanal (domingos às 3h)
sudo crontab -e

# Adicionar linha:
0 3 * * 0 /usr/local/bin/cleanup-expired-tokens.sh
```

### 5. Monitoramento (Opcional)

#### Estatísticas de Uso

```sql
-- Criar extensão para estatísticas
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Consultas úteis para monitoramento:

-- Tamanho do banco
SELECT pg_size_pretty(pg_database_size('ricardodavid'));

-- Conexões ativas
SELECT count(*) FROM pg_stat_activity WHERE datname = 'ricardodavid';

-- Queries mais lentas (requer pg_stat_statements)
SELECT 
  query, 
  mean_exec_time, 
  calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Tabelas maiores
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
```

---

## 📊 INFORMAÇÕES TÉCNICAS

### Estado Atual do Banco

- ✅ **Banco criado:** ricardodavid
- ✅ **Usuário configurado:** pmfdtidev (com privilégios de superusuário)
- ✅ **Acesso remoto:** Funcionando na porta 5432
- ✅ **Migrations aplicadas:**
  - 20251204094500_init (estrutura inicial)
  - 20251204101142_add_question_origin_field
  - 20251204101357_add_refresh_token_table
- ❌ **pgVector:** NÃO INSTALADO (bloqueio atual)

### Tabelas Principais
- users (15 colunas)
- researchers (10 colunas)
- questions (26 colunas) - **necessita campo embedding (vector)**
- refresh_tokens (8 colunas)
- institutions (20 colunas)
- projects (17 colunas)
- + 15 outras tabelas

---

## 🔒 SEGURANÇA

### Credenciais Atuais (já configuradas)
- **Usuário:** pmfdtidev
- **Senha:** pmfdtipwd
- **Permissões:** Superusuário

### Recomendações de Segurança

1. **Firewall:** Manter porta 5432 acessível apenas para IPs autorizados
2. **SSL/TLS:** Considerar habilitar conexões criptografadas (opcional)
3. **Audit Log:** Habilitar log de conexões e queries (já sugerido acima)

---

## 📝 CHECKLIST PÓS-INSTALAÇÃO

Após executar os procedimentos, por favor confirmar:

- [ ] pgVector instalado com sucesso (`SELECT version FROM pg_available_extensions WHERE name = 'vector';`)
- [ ] Extensão ativada no banco ricardodavid (`\dx vector`)
- [ ] Teste básico funcionando (`SELECT '[1,2,3]'::vector;`)
- [ ] Configurações de performance ajustadas (se aplicável)
- [ ] Backup automático configurado (se aplicável)

---

## 🔄 PRÓXIMOS PASSOS (Após Instalação)

Após confirmação da instalação do pgVector, a equipe de desenvolvimento irá:

1. Atualizar schema do Prisma com campo `embedding vector(1536)`
2. Criar e aplicar migration para adicionar coluna vector na tabela `questions`
3. Criar índices de similaridade usando IVFFlat ou HNSW
4. Implementar endpoints de busca semântica
5. Integrar com APIs de IA (OpenAI, Cohere) para geração de embeddings
6. Testar busca por similaridade de questões

---

## 📞 CONTATO

**Desenvolvedor:** Ricardo David  
**Email:** rdavid38@hotmail.com  
**Projeto:** ResearchQuest  
**GitHub:** https://github.com/RicardoDavitec/Research_Quest

---

## 📚 REFERÊNCIAS

- **pgVector GitHub:** https://github.com/pgvector/pgvector
- **Documentação Oficial:** https://github.com/pgvector/pgvector#installation
- **Prisma + pgVector:** https://www.prisma.io/docs/orm/prisma-schema/data-model/unsupported-types

---

## ⚠️ OBSERVAÇÕES IMPORTANTES

1. A instalação do pgVector **não afeta** dados existentes
2. A extensão é **retrocompatível** e pode ser removida se necessário
3. O sistema continuará funcionando normalmente sem pgVector, mas **sem a funcionalidade de busca semântica**
4. Recomendamos testar primeiro em ambiente de desenvolvimento, se disponível

---

**Aguardamos confirmação da execução destes procedimentos.**

**Obrigado pela atenção e colaboração!**

---

*Documento gerado automaticamente pelo sistema ResearchQuest*  
*Versão: 1.0 | Data: 04/12/2025*
