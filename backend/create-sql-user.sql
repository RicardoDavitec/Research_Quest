-- Script para criar usuário SQL Server e habilitar autenticação mista
USE [master];
GO

-- Habilitar modo de autenticação mista (SQL e Windows)
-- Requer reiniciar o serviço SQL Server após executar

-- Criar login SQL
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'campouser')
BEGIN
    CREATE LOGIN campouser WITH PASSWORD = 'Campo@2024!';
    PRINT 'Login campouser criado com sucesso!';
END
ELSE
BEGIN
    PRINT 'Login campouser já existe.';
END
GO

USE campo_research_db;
GO

-- Criar usuário no banco de dados
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'campouser')
BEGIN
    CREATE USER campouser FOR LOGIN campouser;
    PRINT 'Usuário campouser criado no banco campo_research_db!';
END
ELSE
BEGIN
    PRINT 'Usuário campouser já existe no banco.';
END
GO

-- Dar permissões de db_owner
ALTER ROLE db_owner ADD MEMBER campouser;
PRINT 'Permissões concedidas ao usuário campouser!';
GO
