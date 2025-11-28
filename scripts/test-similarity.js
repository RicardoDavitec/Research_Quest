const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

async function testarSimilaridade() {
  console.log('🧪 TESTE DE SIMILARIDADE\n');
  
  try {
    // 1. Buscar todas as questões
    console.log('1️⃣ Buscando questões...');
    const questoesResponse = await api.get('/questions');
    const questoes = questoesResponse.data;
    console.log(`   ✅ ${questoes.length} questões encontradas\n`);
    
    // 2. Texto de teste para similaridade
    const textoTeste = "Como você avalia o atendimento na unidade de saúde?";
    console.log(`2️⃣ Texto de teste: "${textoTeste}"\n`);
    
    // 3. Preparar documentos para comparação
    const documents = questoes.map(q => ({
      id: q.id,
      text: q.text
    }));
    
    // 4. Chamar API de similaridade
    console.log('3️⃣ Chamando API de similaridade...');
    const similarityResponse = await api.post('/similarity/compare?threshold=0.3&limit=5', {
      query: textoTeste,
      documents: documents,
    });
    
    const resultados = similarityResponse.data;
    console.log(`   ✅ ${resultados.length} questões similares encontradas\n`);
    
    // 5. Exibir resultados
    console.log('📊 RESULTADOS:\n');
    console.log('='.repeat(80));
    
    resultados.forEach((item, index) => {
      const similaridade = (item.score * 100).toFixed(1);
      console.log(`\n🏆 #${index + 1} - Similaridade: ${similaridade}%`);
      console.log(`   ID: ${item.id}`);
      console.log(`   Texto: "${item.text}"`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Teste concluído com sucesso!\n');
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Dados:', error.response.data);
    }
  }
}

testarSimilaridade();
