-- Atualizar senha de TODOS os pesquisadores para senha123
UPDATE researchers 
SET password = '$2b$10$uJAuNflAK4bz.4SHQ867deJG4BD8IA7DhqXsKcFLjZDgtpxr/eHru';

SELECT email, name, role FROM researchers ORDER BY email;
