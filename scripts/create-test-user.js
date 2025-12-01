const axios = require('axios');
const bcrypt = require('bcrypt');

const API_URL = 'http://localhost:3001';

async function createTestUser() {
  console.log('Criando usuario de teste...\n');

  try {
    // Hash da senha "senha123"
    const hashedPassword = await bcrypt.hash('senha123', 10);

    // Criar usuario admin de teste
    const userData = {
      name: 'Admin Teste',
      email: 'admin@teste.com',
      password: hashedPassword,
      role: 'admin',
      cpf: '12345678900',
      phone: '(11) 99999-9999',
      isActive: true,
    };

    const response = await axios.post(`${API_URL}/researchers`, userData);
    
    console.log('Usuario criado com sucesso!');
    console.log('Email: admin@teste.com');
    console.log('Senha: senha123');
    console.log('\nDados completos:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Erro:', error.response.data);
    } else {
      console.error('Erro:', error.message);
    }
  }
}

createTestUser();
