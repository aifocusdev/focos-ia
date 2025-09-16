const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function createAdminUsers() {
  // Hash da senha "admin123"
  const passwordHash = await bcrypt.hash('admin123', 10);

  // Conectar ao banco financeiro
  const financeClient = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '03101996',
    database: 'focos_ia_finance'
  });

  // Conectar ao banco de chat
  const chatClient = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '03101996',
    database: 'focos_ia_chat'
  });

  try {
    // Criar admin no sistema financeiro
    await financeClient.connect();
    console.log('Conectado ao banco financeiro...');

    const financeQuery = `
      INSERT INTO users (name, email, password_hash, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE
      SET password_hash = $3, updated_at = NOW()
      RETURNING id, name, email, role
    `;

    const financeResult = await financeClient.query(financeQuery, [
      'Admin FOCOS IA',
      'admin@focosia.com',
      passwordHash,
      'admin'
    ]);

    console.log('✅ Usuário admin criado no sistema financeiro:', financeResult.rows[0]);

    // Criar admin no sistema de chat
    await chatClient.connect();
    console.log('Conectado ao banco de chat...');

    // Primeiro criar o role se não existir
    await chatClient.query(`
      INSERT INTO roles (id, name, created_at, updated_at)
      VALUES (1, 'admin', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `);

    const chatQuery = `
      INSERT INTO users (name, username, password, role_id, online, created_at, updated_at)
      VALUES ($1, $2, $3, 1, true, NOW(), NOW())
      ON CONFLICT (username) DO UPDATE
      SET password = $3, updated_at = NOW()
      RETURNING id, name, username
    `;

    const chatResult = await chatClient.query(chatQuery, [
      'Admin FOCOS IA',
      'admin',
      passwordHash
    ]);

    console.log('✅ Usuário admin criado no sistema de chat:', chatResult.rows[0]);

    console.log('\n========================================');
    console.log('🎉 USUÁRIOS ADMIN CRIADOS COM SUCESSO!');
    console.log('========================================');
    console.log('📧 Email: admin@focosia.com');
    console.log('🔑 Senha: admin123');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Erro ao criar usuários:', error.message);
  } finally {
    await financeClient.end();
    await chatClient.end();
  }
}

createAdminUsers();