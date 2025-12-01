USE campo_research_db;
GO

-- Criar tabela de pesquisadores se não existir (TypeORM deve criar automaticamente)
-- Inserir usuário de teste
-- Senha: senha123 (hash bcrypt)
INSERT INTO researcher (name, email, password, cpf, phone, role, isActive, createdAt, updatedAt)
VALUES (
    'Admin Teste',
    'admin@teste.com',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', -- senha123
    '12345678900',
    '(11) 99999-9999',
    'admin',
    1,
    GETDATE(),
    GETDATE()
);
GO

SELECT * FROM researcher WHERE email = 'admin@teste.com';
GO
