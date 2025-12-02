const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testLogin() {
  console.log('\n=== TESTE DE AUTENTICAÇÃO ===\n');
  
  const email = 'admin@teste.com';
  const senha = 'senha123';
  
  // 1. Buscar usuário
  const user = await prisma.researchers.findFirst({
    where: { email: email }
  });
  
  if (!user) {
    console.log('❌ Usuário não encontrado');
    return;
  }
  
  console.log('✓ Usuário encontrado:');
  console.log('  Email:', user.email);
  console.log('  Nome:', user.name);
  console.log('  Hash armazenado:', user.password);
  console.log('  IsActive:', user.isActive);
  
  // 2. Testar senha
  console.log('\n--- Testando senha ---');
  console.log('Senha digitada:', senha);
  console.log('Senha length:', senha.length);
  console.log('Senha bytes:', Buffer.from(senha).toString('hex'));
  
  const match = await bcrypt.compare(senha, user.password);
  console.log('\n✓ Resultado bcrypt.compare:', match);
  
  // 3. Gerar novo hash
  console.log('\n--- Gerando novo hash ---');
  const newHash = await bcrypt.hash(senha, 10);
  console.log('Novo hash gerado:', newHash);
  
  const matchNew = await bcrypt.compare(senha, newHash);
  console.log('Novo hash valida?', matchNew);
  
  // 4. Atualizar no banco
  if (!match) {
    console.log('\n--- Atualizando senha no banco ---');
    await prisma.researchers.update({
      where: { id: user.id },
      data: { password: newHash }
    });
    console.log('✓ Senha atualizada com sucesso!');
    
    // Testar novamente
    const userUpdated = await prisma.researchers.findFirst({
      where: { email: email }
    });
    const finalMatch = await bcrypt.compare(senha, userUpdated.password);
    console.log('✓ Validação final:', finalMatch);
  }
  
  await prisma.$disconnect();
}

testLogin().catch(console.error);
