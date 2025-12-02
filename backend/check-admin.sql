SELECT email, name, role, "isActive", LEFT(password, 30) as pwd_hash 
FROM researchers 
WHERE email = 'admin@teste.com';
