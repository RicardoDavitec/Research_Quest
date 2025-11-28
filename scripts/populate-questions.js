const axios = require('axios');

// Configurar base URL da API
const api = axios.create({
  baseURL: 'http://localhost:3001',
});

// Mapeamento de tipos de questão
const tipoMap = {
  'Escala': 'scale',
  'Sim/Não': 'yes_no',
  'Múltipla Escolha': 'multiple_choice',
  'Texto Aberto': 'open_text',
  'Quantitativa': 'quantitative',
};

// Mapeamento de grupos para IDs de subgrupos
const grupoMap = {
  'Grupo 1': 'EB0AA2BB-63CC-F011-8C0D-70A8D3D176AC', // Grupo1 - Atenção Saúde ChatBot
  'Grupo 2': '8F0CC264-64CC-F011-8C0D-70A8D3D176AC', // Grupo 2 - DashBoard Serviços
  'Grupo 3': '8F16588D-64CC-F011-8C0D-70A8D3D176AC', // Grupo3 - Toten Presencial
  'Grupo 4': 'CAAEFDBC-64CC-F011-8C0D-70A8D3D176AC', // Grupo4 - Vacinas
  'Grupo 5': '390271F4-64CC-F011-8C0D-70A8D3D176AC', // Grupo 5 - Educação Permanente
};

// Lista de questões da tabela SUS
const questoes = [
  { texto: "Como você avalia a facilidade para marcar consultas na unidade?", tipo: "Escala", grupo: "Grupo 3" },
  { texto: "O tempo de espera para conseguir uma consulta foi adequado?", tipo: "Sim/Não", grupo: "Grupo 1" },
  { texto: "Você conseguiu atendimento na data e hora agendadas?", tipo: "Sim/Não", grupo: "Grupo 5" },
  { texto: "A unidade oferece canais variados para agendamento (telefone, presencial, online)?", tipo: "Múltipla Escolha", grupo: "Grupo 4" },
  { texto: "Você recebeu informações claras sobre os documentos necessários para atendimento?", tipo: "Sim/Não", grupo: "Grupo 2" },
  { texto: "Como você avalia o atendimento dos profissionais de saúde (médicos, enfermeiros, técnicos)?", tipo: "Escala", grupo: "Grupo 1" },
  { texto: "Os profissionais foram atenciosos e respeitosos durante o atendimento?", tipo: "Sim/Não", grupo: "Grupo 5" },
  { texto: "Você sentiu que os profissionais ouviram suas dúvidas e preocupações?", tipo: "Sim/Não", grupo: "Grupo 3" },
  { texto: "O tempo dedicado pelo profissional ao seu atendimento foi suficiente?", tipo: "Sim/Não", grupo: "Grupo 2" },
  { texto: "Você recebeu orientações claras sobre seu tratamento ou cuidados?", tipo: "Sim/Não", grupo: "Grupo 4" },
  { texto: "Como você avalia a limpeza da unidade de saúde?", tipo: "Escala", grupo: "Grupo 1" },
  { texto: "A unidade possui salas de espera confortáveis e adequadas?", tipo: "Sim/Não", grupo: "Grupo 3" },
  { texto: "Os equipamentos utilizados estavam em bom estado?", tipo: "Sim/Não", grupo: "Grupo 5" },
  { texto: "As instalações são acessíveis para pessoas com deficiência ou mobilidade reduzida?", tipo: "Sim/Não", grupo: "Grupo 2" },
  { texto: "A sinalização dentro da unidade é clara e facilita a orientação?", tipo: "Sim/Não", grupo: "Grupo 4" },
  { texto: "A unidade oferece todos os serviços de saúde que você necessita?", tipo: "Sim/Não", grupo: "Grupo 1" },
  { texto: "Você teve dificuldade em acessar exames ou procedimentos solicitados?", tipo: "Sim/Não", grupo: "Grupo 3" },
  { texto: "O tempo para realização de exames foi satisfatório?", tipo: "Escala", grupo: "Grupo 5" },
  { texto: "Os resultados dos exames foram entregues no prazo esperado?", tipo: "Sim/Não", grupo: "Grupo 2" },
  { texto: "A unidade oferece programas de prevenção e promoção da saúde?", tipo: "Sim/Não", grupo: "Grupo 4" },
  { texto: "Você recebeu informações suficientes sobre os serviços disponíveis na unidade?", tipo: "Sim/Não", grupo: "Grupo 1" },
  { texto: "As informações sobre horários de atendimento são claras e acessíveis?", tipo: "Sim/Não", grupo: "Grupo 3" },
  { texto: "Você entende as orientações recebidas sobre sua condição de saúde?", tipo: "Sim/Não", grupo: "Grupo 5" },
  { texto: "A equipe responde suas dúvidas de forma clara e paciente?", tipo: "Sim/Não", grupo: "Grupo 2" },
  { texto: "Você recebeu material informativo (folders, cartazes) útil sobre saúde?", tipo: "Sim/Não", grupo: "Grupo 4" },
  { texto: "Você se sentiu acolhido e respeitado durante sua visita?", tipo: "Sim/Não", grupo: "Grupo 1" },
  { texto: "Houve discriminação ou preconceito em algum momento do atendimento?", tipo: "Sim/Não", grupo: "Grupo 3" },
  { texto: "A equipe demonstrou interesse genuíno pelo seu bem-estar?", tipo: "Sim/Não", grupo: "Grupo 5" },
  { texto: "Você sentiu que sua privacidade foi respeitada durante o atendimento?", tipo: "Sim/Não", grupo: "Grupo 2" },
  { texto: "A unidade promove um ambiente seguro e confortável para os usuários?", tipo: "Sim/Não", grupo: "Grupo 4" },
  { texto: "Você recebeu orientações para acompanhamento após a consulta?", tipo: "Sim/Não", grupo: "Grupo 1" },
  { texto: "Foi fácil agendar consultas de retorno, se necessário?", tipo: "Sim/Não", grupo: "Grupo 3" },
  { texto: "Você sente que seu tratamento é acompanhado de forma integrada?", tipo: "Sim/Não", grupo: "Grupo 5" },
  { texto: "A unidade realiza acompanhamento ativo de casos crônicos?", tipo: "Sim/Não", grupo: "Grupo 2" },
  { texto: "Você foi informado sobre como proceder em caso de dúvidas ou emergências?", tipo: "Sim/Não", grupo: "Grupo 4" },
  { texto: "Qual sua satisfação geral com os serviços prestados pela unidade?", tipo: "Escala", grupo: "Grupo 1" },
  { texto: "Você recomendaria esta unidade para familiares e amigos?", tipo: "Sim/Não", grupo: "Grupo 3" },
  { texto: "Quais os principais pontos positivos da unidade?", tipo: "Texto Aberto", grupo: "Grupo 5" },
  { texto: "Quais melhorias você gostaria de sugerir para o atendimento?", tipo: "Texto Aberto", grupo: "Grupo 2" },
  { texto: "Você já teve alguma experiência negativa na unidade? Se sim, qual?", tipo: "Texto Aberto", grupo: "Grupo 4" },
  { texto: "Qual sua faixa etária?", tipo: "Múltipla Escolha", grupo: "Grupo 1" },
  { texto: "Qual seu gênero?", tipo: "Múltipla Escolha", grupo: "Grupo 3" },
  { texto: "Você reside próximo à unidade de saúde?", tipo: "Sim/Não", grupo: "Grupo 5" },
  { texto: "Com que frequência você utiliza os serviços desta unidade?", tipo: "Múltipla Escolha", grupo: "Grupo 2" },
  { texto: "Você utiliza outras unidades de saúde além desta?", tipo: "Sim/Não", grupo: "Grupo 4" },
  { texto: "Você percebeu melhora na sua saúde após utilizar os serviços da unidade?", tipo: "Sim/Não", grupo: "Grupo 1" },
  { texto: "O atendimento contribuiu para esclarecer suas dúvidas sobre saúde?", tipo: "Sim/Não", grupo: "Grupo 3" },
  { texto: "Você sente que a unidade ajuda na prevenção de doenças?", tipo: "Sim/Não", grupo: "Grupo 5" },
  { texto: "O serviço prestado contribui para sua qualidade de vida?", tipo: "Sim/Não", grupo: "Grupo 2" },
  { texto: "Você tem confiança na equipe de saúde que atende a unidade?", tipo: "Escala", grupo: "Grupo 4" },
  { texto: "Quantas vezes você visitou esta unidade nos últimos 12 meses?", tipo: "Quantitativa", grupo: "Grupo 1" },
  { texto: "Descreva uma situação em que você ficou satisfeito(a) com o atendimento.", tipo: "Texto Aberto", grupo: "Grupo 3" },
  { texto: "Quais fatores mais influenciam sua escolha por esta unidade?", tipo: "Texto Aberto", grupo: "Grupo 5" },
  { texto: "Em uma escala de 1 a 10, qual a probabilidade de você voltar a usar os serviços desta unidade?", tipo: "Escala", grupo: "Grupo 2" },
  { texto: "Você já precisou de atendimento de emergência na unidade?", tipo: "Sim/Não", grupo: "Grupo 4" },
  { texto: "Se sim, como avalia o atendimento emergencial?", tipo: "Escala", grupo: "Grupo 1" },
  { texto: "Quais os principais motivos para buscar atendimento nesta unidade?", tipo: "Múltipla Escolha", grupo: "Grupo 3" },
  { texto: "Você já participou de alguma campanha de saúde promovida pela unidade?", tipo: "Sim/Não", grupo: "Grupo 5" },
  { texto: "Como você avalia a disponibilidade de medicamentos na unidade?", tipo: "Escala", grupo: "Grupo 2" },
  { texto: "Você sente que a unidade respeita sua cultura e crenças durante o atendimento?", tipo: "Sim/Não", grupo: "Grupo 4" },
];

// ID do usuário autor (João Silva - pegar do login)
const AUTHOR_ID = '34D9B86A-91CB-F011-8C0D-70A8D3D176AC';

async function login() {
  try {
    const response = await api.post('/auth/login', {
      email: 'joao.silva@exemplo.com',
      password: 'senha@123',
    });
    
    const token = response.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Login realizado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro no login:', error.message);
    return false;
  }
}

async function criarQuestao(questao) {
  try {
    const payload = {
      text: questao.texto,
      type: tipoMap[questao.tipo],
      subgroupId: grupoMap[questao.grupo],
      authorId: AUTHOR_ID,
      researchName: 'Pesquisa de Satisfação SUS',
      objective: 'Avaliar satisfação dos usuários do SUS',
    };

    await api.post('/questions', payload);
    console.log(`✅ Criada: "${questao.texto.substring(0, 60)}..."`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao criar questão: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function popularQuestoes() {
  console.log('🚀 Iniciando população de questões...\n');
  
  // Fazer login
  const loggedIn = await login();
  if (!loggedIn) {
    console.error('❌ Não foi possível fazer login. Encerrando.');
    return;
  }

  console.log(`\n📊 Total de questões a criar: ${questoes.length}\n`);

  let sucesso = 0;
  let erro = 0;

  for (let i = 0; i < questoes.length; i++) {
    const questao = questoes[i];
    console.log(`[${i + 1}/${questoes.length}] Criando questão...`);
    
    const resultado = await criarQuestao(questao);
    if (resultado) {
      sucesso++;
    } else {
      erro++;
    }
    
    // Pequeno delay para não sobrecarregar a API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(60));
  console.log('📈 RESUMO:');
  console.log(`   ✅ Sucessos: ${sucesso}`);
  console.log(`   ❌ Erros: ${erro}`);
  console.log(`   📊 Total: ${questoes.length}`);
  console.log('='.repeat(60) + '\n');
}

// Executar
popularQuestoes().catch(console.error);
