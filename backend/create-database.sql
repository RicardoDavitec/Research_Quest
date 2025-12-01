-- Criar banco de dados campo_research_db
USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'campo_research_db')
BEGIN
    CREATE DATABASE campo_research_db;
    PRINT 'Banco de dados campo_research_db criado com sucesso!';
END
ELSE
BEGIN
    PRINT 'Banco de dados campo_research_db ja existe.';
END
GO
