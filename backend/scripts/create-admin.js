const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function createAdminUser() {
  // Hash da senha "admin123"
  const passwordHash = await bcrypt.hash('admin123', 10);

  // Conectar ao banco
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '03101996',
    database: 'focos_ia'
  });

  try {
    await client.connect();
    console.log('Conectado ao banco de dados...');

    // Primeiro criar o role admin se não existir
    await client.query(`
      INSERT INTO roles (id, name, created_at, updated_at)
      VALUES (1, 'admin', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `);

    console.log('✅ Role admin criado/verificado');

    // Criar o usuário admin
    const userQuery = `
      INSERT INTO users (name, username, password, role_id, online, created_at, updated_at)
      VALUES ($1, $2, $3, 1, false, NOW(), NOW())
      ON CONFLICT (username) DO UPDATE
      SET password = $3, updated_at = NOW()
      RETURNING id, name, username
    `;

    const result = await client.query(userQuery, [
      'Administrador',
      'admin',
      passwordHash
    ]);

    console.log('✅ Usuário admin criado:', result.rows[0]);

    console.log('\n========================================');
    console.log('🎉 USUÁRIO ADMIN CRIADO COM SUCESSO!');
    console.log('========================================');
    console.log('👤 Username: admin');
    console.log('🔑 Senha: admin123');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
  } finally {
    await client.end();
  }
}

createAdminUser();