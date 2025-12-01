-- Verificar tabelas criadas
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE' 
ORDER BY TABLE_NAME;

-- Inserir roles padrão
IF NOT EXISTS (SELECT * FROM roles WHERE name = 'admin')
INSERT INTO roles (id, name, description, isActive, createdAt, updatedAt)
VALUES (NEWID(), 'admin', 'Administrador do sistema', 1, GETDATE(), GETDATE());

IF NOT EXISTS (SELECT * FROM roles WHERE name = 'researcher')
INSERT INTO roles (id, name, description, isActive, createdAt, updatedAt)
VALUES (NEWID(), 'researcher', 'Pesquisador', 1, GETDATE(), GETDATE());

IF NOT EXISTS (SELECT * FROM roles WHERE name = 'viewer')
INSERT INTO roles (id, name, description, isActive, createdAt, updatedAt)
VALUES (NEWID(), 'viewer', 'Visualizador', 1, GETDATE(), GETDATE());

-- Criar usuário admin de teste
-- Senha: senha123 (hash bcrypt: $2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW)
IF NOT EXISTS (SELECT * FROM researchers WHERE email = 'admin@teste.com')
INSERT INTO researchers (id, name, email, password, role, isActive, createdAt, updatedAt)
VALUES (
    NEWID(),
    'Administrador Teste',
    'admin@teste.com',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'admin',
    1,
    GETDATE(),
    GETDATE()
);

PRINT 'Roles e usuário admin criados com sucesso!';
PRINT 'Email: admin@teste.com';
PRINT 'Senha: senha123';
