import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';

dotenv.config(); // Carregar variáveis de ambiente do arquivo .env
import { AppModule } from '../src/app.module';
import { MessagesService } from '../src/modules/messages/services/messages.service';
import { ConversationsService } from '../src/modules/conversations/services/conversations.service';
import { CreateMessageInternalDto } from '../src/modules/messages/dto/create-message-internal.dto';
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

async function seedSimpleMessages() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const messagesService = app.get(MessagesService);
  const conversationsService = app.get(ConversationsService);

  try {

    // Buscar todas as conversas existentes
    const conversations = await conversationsService.findAll({}, 1);

    let totalMessages = 0;

    for (const conversation of conversations.data) {
      
      // Criar entre 3 e 8 mensagens por conversa
      const messageCount = Math.floor(Math.random() * 6) + 3;
      
      for (let j = 0; j < messageCount; j++) {
        const isFromContact = Math.random() > 0.4; // 60% chance de ser do contato
        
        let messageData: CreateMessageInternalDto;
        
        if (isFromContact) {
          // Mensagem do contato
          messageData = {
            conversation_id: conversation.id,
            sender_type: MessageSender.CONTACT,
            body: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
            whatsapp_message_id: `wamid.${Math.random().toString(36).substring(7)}`,
            whatsapp_status: MessageStatus.READ
          };
        } else {
          // Mensagem de resposta (usuário ou bot)
          const isBot = conversation.assigned_bot !== null;
          
          if (isBot) {
            messageData = {
              conversation_id: conversation.id,
              sender_type: MessageSender.BOT,
              sender_bot: conversation.assigned_bot || undefined,
              body: botResponses[Math.floor(Math.random() * botResponses.length)],
              whatsapp_status: MessageStatus.DELIVERED
            };
          } else {
            messageData = {
              conversation_id: conversation.id,
              sender_type: MessageSender.USER,
              sender_user: conversation.assigned_user || undefined,
              body: userResponses[Math.floor(Math.random() * userResponses.length)],
              whatsapp_status: MessageStatus.DELIVERED
            };
          }
        }

        try {
          await messagesService.createInternal(messageData);
          totalMessages++;
        } catch (error) {
        }
      }
      
    }


  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await app.close();
  }
}

// Executar o script
seedSimpleMessages().catch(console.error);