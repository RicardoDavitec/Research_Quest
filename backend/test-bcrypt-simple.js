const bcrypt = require('bcrypt');

async function testPassword() {
  console.log('\n=== TESTE BCRYPT ===\n');
  
  const senha = 'senha123';
  const hashAtual = '$2b$10$uJAuNflAK4bz.4SHQ867deJG4BD8IA7DhqXsKcFLjZDgtpxr/eHru';
  
  console.log('Senha:', senha);
  console.log('Hash armazenado:', hashAtual);
  
  // Teste 1: Comparar
  const match1 = await bcrypt.compare(senha, hashAtual);
  console.log('\n✓ bcrypt.compare resultado:', match1);
  
  // Teste 2: Gerar 5 novos hashes
  console.log('\n--- Gerando novos hashes ---');
  for (let i = 1; i <= 5; i++) {
    const novoHash = await bcrypt.hash(senha, 10);
    const valida = await bcrypt.compare(senha, novoHash);
    console.log(`Hash ${i}:`, novoHash);
    console.log(`  Valida: ${valida}`);
  }
  
  // Teste 3: Verificar encoding
  console.log('\n--- Encoding ---');
  console.log('Senha como Buffer:', Buffer.from(senha));
  console.log('Senha como hex:', Buffer.from(senha).toString('hex'));
  console.log('Senha length:', senha.length);
  console.log('Senha charCodeAt:', Array.from(senha).map(c => c.charCodeAt(0)));
}

testPassword().catch(console.error);
