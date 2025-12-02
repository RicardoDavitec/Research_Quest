INSERT INTO institutions (id, name, acronym, type, cnpj, address, city, state, "zipCode", phone, email, website, rector, description, "isActive", "createdAt", "updatedAt") 
VALUES (
  gen_random_uuid(), 
  'Universidade de Franca', 
  'UNIFRAN', 
  'Universidade Privada', 
  '17.838.563/0001-34', 
  'Av. Dr. Armando Salles de Oliveira, 201', 
  'Franca', 
  'SP', 
  '14404-600', 
  '(16) 3711-8888', 
  'contato@unifran.edu.br', 
  'https://www.unifran.edu.br', 
  'Prof. Dr. Elcio Nacur Rezende', 
  'Universidade de Franca, instituicao com mais de 60 anos em Medicina, Odontologia e Saude.', 
  true, 
  NOW(), 
  NOW()
) ON CONFLICT DO NOTHING;

SELECT acronym, name, city FROM institutions ORDER BY acronym;
