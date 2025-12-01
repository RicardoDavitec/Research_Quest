const sql = require('mssql');

const config = {
    server: 'localhost',
    port: 1433,
    database: 'campo_research_db',
    user: 'campouser',
    password: 'Campo@2024!',
    options: {
        trustServerCertificate: true,
        encrypt: false,
        enableArithAbort: true
    }
};

async function testConnection() {
    try {
        console.log('Tentando conectar ao SQL Server Express com SQL Authentication...');
        const pool = await sql.connect(config);
        console.log('✅ Conectado com sucesso!');
        
        const result = await pool.request().query('SELECT @@VERSION as version, DB_NAME() as dbname');
        console.log('Banco de dados:', result.recordset[0].dbname);
        console.log('Versão SQL Server:', result.recordset[0].version.substring(0, 100));
        
        await pool.close();
        console.log('\n✅ TCP/IP está funcionando! Agora você pode criar as tabelas.');
    } catch (err) {
        console.error('❌ Erro na conexão:', err.message);
    }
}

testConnection();
