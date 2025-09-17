import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';

dotenv.config(); // Carregar variáveis de ambiente do arquivo .env
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { Message } from '../src/modules/messages/entities/message.entity';
import { Conversation } from '../src/modules/conversations/entities/conversation.entity';
import { MessageSender, MessageStatus } from '../src/common/enums';

// Mensagens de exemplo para simular conversas
const sampleMessages = [
  'Olá! Gostaria de mais informações sobre seus produtos.',
  'Bom dia! Vocês fazem entregas para minha região?',
  'Quanto custa o produto que vi no seu site?',
  'Oi, preciso de ajuda com meu pedido.',
  'Vocês têm desconto para pagamento à vista?',
  'Qual o prazo de entrega?',
  'Gostaria de falar com um atendente.',
  'Obrigado pelo atendimento!',
  'Posso cancelar meu pedido?',
  'Como faço para trocar um produto?',
  'Vocês aceitam cartão de crédito?',
  'Preciso de uma segunda via da nota fiscal.',
  'O produto chegou com defeito.',
  'Quando vocês vão ter mais estoque?',
  'Gostaria de fazer uma reclamação.',
  'Parabéns pelo excelente atendimento!',
  'Vocês têm loja física?',
  'Como faço para ser um revendedor?',
  'Qual o horário de funcionamento?',
  'Preciso atualizar meu endereço de entrega.'
];

const botResponses = [
  'Olá! Como posso ajudá-lo hoje?',
  'Obrigado por entrar em contato conosco!',
  'Em breve um atendente entrará em contato.',
  'Posso ajudá-lo com informações sobre nossos produtos.',
  'Para mais informações, digite *menu*.',
  'Aguarde que já vou conectá-lo com um atendente.',
  'Que bom que você nos procurou!',
  'Vou verificar essas informações para você.',
  'Nosso horário de atendimento é de 8h às 18h.',
  'Obrigado pela preferência!'
];

const userResponses = [
  'Obrigado pelo contato! Como posso ajudá-lo?',
  'Vou verificar isso para você.',
  'Que ótimo! Fico feliz em poder ajudar.',
  'Entendi sua necessidade. Vou buscar essa informação.',
  'Perfeito! Vou encaminhar sua solicitação.',
  'Claro! Posso ajudá-lo com isso.',
  'Agradeço pela paciência.',
  'Vou resolver isso para você agora.',
  'Entendido. Vou providenciar.',
  'Certo! Já estou trabalhando nisso.'
];

async function seedDirectMessages() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  
  const conversationRepository = dataSource.getRepository(Conversation);
  const messageRepository = dataSource.getRepository(Message);

  try {

    // Buscar todas as conversas existentes
    const conversations = await conversationRepository.find({
      take: 50, // Limitar para não sobrecarregar
    });

    let totalMessages = 0;

    for (const conversation of conversations) {
      
      // Criar entre 3 e 8 mensagens por conversa
      const messageCount = Math.floor(Math.random() * 6) + 3;
      const messages: Message[] = [];
      
      for (let j = 0; j < messageCount; j++) {
        const isFromContact = Math.random() > 0.4; // 60% chance de ser do contato
        
        const message = new Message();
        message.conversation_id = conversation.id;
        message.created_at = new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7); // Última semana
        
        // Definir delivered_at baseado em created_at
        const deliveredOffset = Math.random() * 90000; // 0-90 segundos após created_at
        message.delivered_at = new Date(message.created_at.getTime() + deliveredOffset);
        
        if (isFromContact) {
          // Mensagem do contato
          message.sender_type = MessageSender.CONTACT;
          message.body = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
          message.whatsapp_message_id = `wamid.${Math.random().toString(36).substring(7)}`;
        } else {
          // Mensagem de resposta (usuário ou bot)
          const isBot = conversation.assigned_bot !== null;
          
          if (isBot) {
            message.sender_type = MessageSender.BOT;
            message.sender_bot = conversation.assigned_bot;
            message.body = botResponses[Math.floor(Math.random() * botResponses.length)];
          } else {
            message.sender_type = MessageSender.USER;
            message.sender_user = conversation.assigned_user;
            message.body = userResponses[Math.floor(Math.random() * userResponses.length)];
          }
        }

        messages.push(message);
      }
      
      try {
        await messageRepository.save(messages);
        totalMessages += messages.length;
      } catch (error) {
      }
    }


  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await app.close();
  }
}

// Executar o script
seedDirectMessages().catch(console.error);