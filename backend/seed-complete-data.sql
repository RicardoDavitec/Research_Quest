-- Seed completo com Universidades, Pesquisadores, Projetos e Subgrupos de Franca/SP

-- 1. INSTITUIÇÕES
INSERT INTO institutions (id, name, acronym, type, cnpj, address, city, state, "zipCode", phone, email, website, rector, description, "isActive", "createdAt", "updatedAt") VALUES
(
  gen_random_uuid(),
  'Centro Universitário Municipal de Franca',
  'UniFACEF',
  'Centro Universitário Municipal',
  '47.987.136/0001-09',
  'Av. Major Nicácio, 2433',
  'Franca',
  'SP',
  '14401-135',
  '0800 940 4688',
  'contato@unifacef.com.br',
  'https://www.unifacef.com.br',
  'Prof. Dr. José Alfredo Covolan Ulson',
  'Centro Universitário Municipal de Franca, instituição pública municipal com tradição em ensino superior, pesquisa e extensão. Reconhecida pelo selo de Instituição Socialmente Responsável pela ABMES.',
  true,
  NOW(),
  NOW()
),
(
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
  'Prof. Dr. Élcio Nacur Rezende',
  'Universidade de Franca, instituição de ensino superior com mais de 60 anos de história, oferecendo cursos de graduação e pós-graduação em diversas áreas do conhecimento, destacando-se em Medicina, Odontologia e áreas da Saúde.',
  true,
  NOW(),
  NOW()
);

-- 2. PESQUISADORES FICTÍCIOS COM DIVERSAS FUNÇÕES

-- Admin User (já existe, não inserir novamente)

-- Coordenadores
INSERT INTO researchers (id, name, email, password, role, "isActive", phone, institution, "createdAt", "updatedAt", "roleId") 
SELECT 
  gen_random_uuid(),
  'Dr. Carlos Eduardo Santos',
  'carlos.santos@unifacef.com.br',
  '$2b$10$uYDUQY5uyKktTr7gvXrGKeh1Z3fZPK84B7wP7vyc2SZNccT4o0nJC',
  'coordinator',
  true,
  '(16) 99876-5432',
  'UniFACEF',
  NOW(),
  NOW(),
  (SELECT id FROM roles WHERE name = 'Coordenador' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM researchers WHERE email = 'carlos.santos@unifacef.com.br');

INSERT INTO researchers (id, name, email, password, role, "isActive", phone, institution, "createdAt", "updatedAt", "roleId") 
SELECT 
  gen_random_uuid(),
  'Dra. Mariana Oliveira Lima',
  'mariana.lima@unifran.edu.br',
  '$2b$10$uYDUQY5uyKktTr7gvXrGKeh1Z3fZPK84B7wP7vyc2SZNccT4o0nJC',
  'coordinator',
  true,
  '(16) 99234-8765',
  'UNIFRAN',
  NOW(),
  NOW(),
  (SELECT id FROM roles WHERE name = 'Coordenador' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM researchers WHERE email = 'mariana.lima@unifran.edu.br');

-- Professores
INSERT INTO researchers (id, name, email, password, role, "isActive", phone, institution, "createdAt", "updatedAt", "roleId") 
SELECT 
  gen_random_uuid(),
  'Prof. Dr. Roberto Almeida',
  'roberto.almeida@unifacef.com.br',
  '$2b$10$uYDUQY5uyKktTr7gvXrGKeh1Z3fZPK84B7wP7vyc2SZNccT4o0nJC',
  'researcher',
  true,
  '(16) 99345-6789',
  'UniFACEF',
  NOW(),
  NOW(),
  (SELECT id FROM roles WHERE name = 'Professor' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM researchers WHERE email = 'roberto.almeida@unifacef.com.br');

INSERT INTO researchers (id, name, email, password, role, "isActive", phone, institution, "createdAt", "updatedAt", "roleId") 
SELECT 
  gen_random_uuid(),
  'Profa. Dra. Ana Paula Ferreira',
  'ana.ferreira@unifran.edu.br',
  '$2b$10$uYDUQY5uyKktTr7gvXrGKeh1Z3fZPK84B7wP7vyc2SZNccT4o0nJC',
  'researcher',
  true,
  '(16) 99456-7890',
  'UNIFRAN',
  NOW(),
  NOW(),
  (SELECT id FROM roles WHERE name = 'Professor' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM researchers WHERE email = 'ana.ferreira@unifran.edu.br');

-- Pesquisadores
INSERT INTO researchers (id, name, email, password, role, "isActive", phone, institution, "createdAt", "updatedAt", "roleId") 
SELECT 
  gen_random_uuid(),
  'Dr. Fernando Silva Costa',
  'fernando.costa@unifacef.com.br',
  '$2b$10$uYDUQY5uyKktTr7gvXrGKeh1Z3fZPK84B7wP7vyc2SZNccT4o0nJC',
  'researcher',
  true,
  '(16) 99567-8901',
  'UniFACEF',
  NOW(),
  NOW(),
  (SELECT id FROM roles WHERE name = 'Pesquisador' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM researchers WHERE email = 'fernando.costa@unifacef.com.br');

INSERT INTO researchers (id, name, email, password, role, "isActive", phone, institution, "createdAt", "updatedAt", "roleId") 
SELECT 
  gen_random_uuid(),
  'Dra. Juliana Rodrigues',
  'juliana.rodrigues@unifran.edu.br',
  '$2b$10$uYDUQY5uyKktTr7gvXrGKeh1Z3fZPK84B7wP7vyc2SZNccT4o0nJC',
  'researcher',
  true,
  '(16) 99678-9012',
  'UNIFRAN',
  NOW(),
  NOW(),
  (SELECT id FROM roles WHERE name = 'Pesquisador' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM researchers WHERE email = 'juliana.rodrigues@unifran.edu.br');

-- Orientadores
INSERT INTO researchers (id, name, email, password, role, "isActive", phone, institution, "createdAt", "updatedAt", "roleId") 
SELECT 
  gen_random_uuid(),
  'Prof. Dr. Paulo Henrique Martins',
  'paulo.martins@unifacef.com.br',
  '$2b$10$uYDUQY5uyKktTr7gvXrGKeh1Z3fZPK84B7wP7vyc2SZNccT4o0nJC',
  'researcher',
  true,
  '(16) 99789-0123',
  'UniFACEF',
  NOW(),
  NOW(),
  (SELECT id FROM roles WHERE name = 'Orientador' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM researchers WHERE email = 'paulo.martins@unifacef.com.br');

INSERT INTO researchers (id, name, email, password, role, "isActive", phone, institution, "createdAt", "updatedAt", "roleId") 
SELECT 
  gen_random_uuid(),
  'Profa. Dra. Beatriz Mendes Souza',
  'beatriz.souza@unifran.edu.br',
  '$2b$10$uYDUQY5uyKktTr7gvXrGKeh1Z3fZPK84B7wP7vyc2SZNccT4o0nJC',
  'researcher',
  true,
  '(16) 99890-1234',
  'UNIFRAN',
  NOW(),
  NOW(),
  (SELECT id FROM roles WHERE name = 'Orientador' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM researchers WHERE email = 'beatriz.souza@unifran.edu.br');

-- Preceptores
INSERT INTO researchers (id, name, email, password, role, "isActive", phone, institution, "createdAt", "updatedAt", "roleId") 
SELECT 
  gen_random_uuid(),
  'Dr. Ricardo Tavares',
  'ricardo.tavares@unifacef.com.br',
  '$2b$10$uYDUQY5uyKktTr7gvXrGKeh1Z3fZPK84B7wP7vyc2SZNccT4o0nJC',
  'researcher',
  true,
  '(16) 99901-2345',
  'UniFACEF',
  NOW(),
  NOW(),
  (SELECT id FROM roles WHERE name = 'Preceptor' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM researchers WHERE email = 'ricardo.tavares@unifacef.com.br');

INSERT INTO researchers (id, name, email, password, role, "isActive", phone, institution, "createdAt", "updatedAt", "roleId") 
SELECT 
  gen_random_uuid(),
  'Dra. Camila Nunes Pereira',
  'camila.pereira@unifran.edu.br',
  '$2b$10$uYDUQY5uyKktTr7gvXrGKeh1Z3fZPK84B7wP7vyc2SZNccT4o0nJC',
  'researcher',
  true,
  '(16) 99012-3456',
  'UNIFRAN',
  NOW(),
  NOW(),
  (SELECT id FROM roles WHERE name = 'Preceptor' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM researchers WHERE email = 'camila.pereira@unifran.edu.br');

-- Alunos
INSERT INTO researchers (id, name, email, password, role, "isActive", phone, institution, "createdAt", "updatedAt", "roleId") 
SELECT 
  gen_random_uuid(),
  'Lucas Henrique Barbosa',
  'lucas.barbosa@unifacef.com.br',
  '$2b$10$uYDUQY5uyKktTr7gvXrGKeh1Z3fZPK84B7wP7vyc2SZNccT4o0nJC',
  'researcher',
  true,
  '(16) 99123-4567',
  'UniFACEF',
  NOW(),
  NOW(),
  (SELECT id FROM roles WHERE name = 'Aluno' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM researchers WHERE email = 'lucas.barbosa@unifacef.com.br');

INSERT INTO researchers (id, name, email, password, role, "isActive", phone, institution, "createdAt", "updatedAt", "roleId") 
SELECT 
  gen_random_uuid(),
  'Maria Clara Dias',
  'maria.dias@unifran.edu.br',
  '$2b$10$uYDUQY5uyKktTr7gvXrGKeh1Z3fZPK84B7wP7vyc2SZNccT4o0nJC',
  'researcher',
  true,
  '(16) 99234-5678',
  'UNIFRAN',
  NOW(),
  NOW(),
  (SELECT id FROM roles WHERE name = 'Aluno' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM researchers WHERE email = 'maria.dias@unifran.edu.br');

-- 3. PROJETOS DE PESQUISA

-- Projeto UniFACEF
INSERT INTO research_projects (id, name, code, "codeUUID", description, area, "startDate", "endDate", status, budget, "fundingAgency", objectives, "expectedResults", "isActive", "createdAt", "updatedAt", "institutionId", "responsibleResearcherId")
SELECT
  gen_random_uuid(),
  'Impacto das Tecnologias Educacionais no Ensino Superior Municipal',
  'PROJ-UNIFACEF-2025-001',
  gen_random_uuid(),
  'Pesquisa sobre a implementação e efetividade de tecnologias educacionais no contexto do ensino superior municipal, analisando metodologias ativas e plataformas digitais.',
  'Educação e Tecnologia',
  '2025-01-15'::DATE,
  '2026-12-15'::DATE,
  'active',
  250000.00,
  'FAPESP',
  'Avaliar o impacto das tecnologias educacionais no desempenho acadêmico dos estudantes; Identificar melhores práticas de integração tecnológica; Desenvolver framework de implementação para instituições municipais.',
  'Relatório técnico sobre efetividade das tecnologias; Artigos científicos publicados; Framework de implementação validado; Capacitação de 50 docentes.',
  true,
  NOW(),
  NOW(),
  (SELECT id FROM institutions WHERE acronym = 'UniFACEF' LIMIT 1),
  (SELECT id FROM researchers WHERE email = 'carlos.santos@unifacef.com.br' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM research_projects WHERE code = 'PROJ-UNIFACEF-2025-001');

-- Projeto UNIFRAN
INSERT INTO research_projects (id, name, code, "codeUUID", description, area, "startDate", "endDate", status, budget, "fundingAgency", objectives, "expectedResults", "isActive", "createdAt", "updatedAt", "institutionId", "responsibleResearcherId")
SELECT
  gen_random_uuid(),
  'Inovações em Saúde Pública e Medicina Preventiva',
  'PROJ-UNIFRAN-2025-001',
  gen_random_uuid(),
  'Estudo multidisciplinar sobre estratégias de prevenção e promoção da saúde em comunidades urbanas, integrando tecnologia, educação em saúde e políticas públicas.',
  'Saúde Pública',
  '2025-02-01'::DATE,
  '2027-01-31'::DATE,
  'active',
  450000.00,
  'CNPq',
  'Desenvolver estratégias de medicina preventiva baseadas em evidências; Implementar programa piloto de educação em saúde; Avaliar impacto de intervenções preventivas na comunidade.',
  'Protocolo de medicina preventiva validado; Redução de 30% em indicadores de doenças crônicas; Publicação de 5 artigos em periódicos internacionais; Formação de 20 profissionais especializados.',
  true,
  NOW(),
  NOW(),
  (SELECT id FROM institutions WHERE acronym = 'UNIFRAN' LIMIT 1),
  (SELECT id FROM researchers WHERE email = 'mariana.lima@unifran.edu.br' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM research_projects WHERE code = 'PROJ-UNIFRAN-2025-001');

-- 4. SUBGRUPOS (2 para cada projeto)

-- Subgrupos do Projeto UniFACEF
INSERT INTO subgroups (id, name, description, "isActive", "createdAt", "updatedAt", "researchProjectId")
SELECT
  gen_random_uuid(),
  'Grupo de Metodologias Ativas e Gamificação',
  'Subgrupo focado em pesquisa e desenvolvimento de metodologias ativas de ensino, incluindo gamificação, aprendizagem baseada em problemas (PBL) e sala de aula invertida.',
  true,
  NOW(),
  NOW(),
  (SELECT id FROM research_projects WHERE code = 'PROJ-UNIFACEF-2025-001' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM subgroups WHERE name = 'Grupo de Metodologias Ativas e Gamificação');

INSERT INTO subgroups (id, name, description, "isActive", "createdAt", "updatedAt", "researchProjectId")
SELECT
  gen_random_uuid(),
  'Grupo de Plataformas Digitais e Educação a Distância',
  'Subgrupo dedicado ao estudo de plataformas digitais educacionais, ambientes virtuais de aprendizagem (AVA) e modalidades híbridas de ensino.',
  true,
  NOW(),
  NOW(),
  (SELECT id FROM research_projects WHERE code = 'PROJ-UNIFACEF-2025-001' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM subgroups WHERE name = 'Grupo de Plataformas Digitais e Educação a Distância');

-- Subgrupos do Projeto UNIFRAN
INSERT INTO subgroups (id, name, description, "isActive", "createdAt", "updatedAt", "researchProjectId")
SELECT
  gen_random_uuid(),
  'Núcleo de Epidemiologia e Vigilância em Saúde',
  'Subgrupo especializado em estudos epidemiológicos, vigilância em saúde e análise de indicadores populacionais para prevenção de doenças.',
  true,
  NOW(),
  NOW(),
  (SELECT id FROM research_projects WHERE code = 'PROJ-UNIFRAN-2025-001' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM subgroups WHERE name = 'Núcleo de Epidemiologia e Vigilância em Saúde');

INSERT INTO subgroups (id, name, description, "isActive", "createdAt", "updatedAt", "researchProjectId")
SELECT
  gen_random_uuid(),
  'Núcleo de Educação em Saúde e Promoção Comunitária',
  'Subgrupo focado em desenvolvimento e implementação de programas de educação em saúde, envolvendo comunidade, escolas e unidades básicas de saúde.',
  true,
  NOW(),
  NOW(),
  (SELECT id FROM research_projects WHERE code = 'PROJ-UNIFRAN-2025-001' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM subgroups WHERE name = 'Núcleo de Educação em Saúde e Promoção Comunitária');

-- 5. ASSOCIAR PESQUISADORES AOS SUBGRUPOS

-- UniFACEF - Grupo de Metodologias Ativas
UPDATE researchers 
SET "subgroupId" = (SELECT id FROM subgroups WHERE name = 'Grupo de Metodologias Ativas e Gamificação' LIMIT 1)
WHERE email IN ('roberto.almeida@unifacef.com.br', 'fernando.costa@unifacef.com.br', 'lucas.barbosa@unifacef.com.br');

-- UniFACEF - Grupo de Plataformas Digitais
UPDATE researchers 
SET "subgroupId" = (SELECT id FROM subgroups WHERE name = 'Grupo de Plataformas Digitais e Educação a Distância' LIMIT 1)
WHERE email IN ('paulo.martins@unifacef.com.br', 'ricardo.tavares@unifacef.com.br');

-- UNIFRAN - Núcleo de Epidemiologia
UPDATE researchers 
SET "subgroupId" = (SELECT id FROM subgroups WHERE name = 'Núcleo de Epidemiologia e Vigilância em Saúde' LIMIT 1)
WHERE email IN ('ana.ferreira@unifran.edu.br', 'juliana.rodrigues@unifran.edu.br');

-- UNIFRAN - Núcleo de Educação em Saúde
UPDATE researchers 
SET "subgroupId" = (SELECT id FROM subgroups WHERE name = 'Núcleo de Educação em Saúde e Promoção Comunitária' LIMIT 1)
WHERE email IN ('beatriz.souza@unifran.edu.br', 'camila.pereira@unifran.edu.br', 'maria.dias@unifran.edu.br');

-- 6. ASSOCIAR PESQUISADORES AOS PROJETOS
UPDATE researchers 
SET "researchProjectId" = (SELECT id FROM research_projects WHERE code = 'PROJ-UNIFACEF-2025-001' LIMIT 1)
WHERE institution = 'UniFACEF' AND email != 'admin@teste.com';

UPDATE researchers 
SET "researchProjectId" = (SELECT id FROM research_projects WHERE code = 'PROJ-UNIFRAN-2025-001' LIMIT 1)
WHERE institution = 'UNIFRAN' AND email != 'admin@teste.com';

-- Verificação final
SELECT 'SEED COMPLETO EXECUTADO COM SUCESSO!' as status;
SELECT 'Universidades criadas: ' || COUNT(*) as resultado FROM institutions;
SELECT 'Pesquisadores criados: ' || COUNT(*) as resultado FROM researchers;
SELECT 'Projetos criados: ' || COUNT(*) as resultado FROM research_projects;
SELECT 'Subgrupos criados: ' || COUNT(*) as resultado FROM subgroups;
