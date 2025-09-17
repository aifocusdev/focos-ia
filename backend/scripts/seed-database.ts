import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';

dotenv.config(); // Carregar variáveis de ambiente do arquivo .env
import { AppModule } from '../src/app.module';
import { ContactsService } from '../src/modules/contacts/services/contacts.service';
import { ConversationsService } from '../src/modules/conversations/services/conversations.service';
import { MessagesService } from '../src/modules/messages/services/messages.service';
import { WhatsappIntegrationConfigService } from '../src/modules/whatsapp-integration-config/services/whatsapp-integration-config.service';
import { UsersService } from '../src/modules/users/services/users.service';
import { BotsService } from '../src/modules/bots/services/bots.service';
import { CreateContactDto } from '../src/modules/contacts/dto/create-contact.dto';
import { CreateConversationDto } from '../src/modules/conversations/dto/create-conversation.dto';
import { CreateMessageInternalDto } from '../src/modules/messages/dto/create-message-internal.dto';
import { CreateWhatsappIntegrationConfigDto } from '../src/modules/whatsapp-integration-config/dto/create-whatsapp-integration-config.dto';
import { CreateBotDto } from '../src/modules/bots/dto/create-bot.dto';
import { MessageSender, MessageStatus } from '../src/common/enums';

// Função para gerar números de telefone brasileiros aleatórios
function generateBrazilianPhone(): string {
  const area = Math.floor(Math.random() * 89) + 11; // 11-99
  const firstDigit = 9; // Celulares começam com 9
  const remaining = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return `55${area}${firstDigit}${remaining}`;
}

// Lista de nomes brasileiros para contatos
const brazilianNames = [
  'Ana Silva', 'João Santos', 'Maria Oliveira', 'Pedro Costa', 'Lucia Ferreira',
  'Carlos Pereira', 'Fernanda Lima', 'Ricardo Almeida', 'Patricia Rodrigues', 'Marcos Souza',
  'Juliana Barbosa', 'Bruno Martins', 'Camila Ribeiro', 'Diego Carvalho', 'Beatriz Gomes',
  'Rafael Nascimento', 'Amanda Torres', 'Gabriel Moreira', 'Larissa Silva', 'Thiago Dias',
  'Isabella Fernandes', 'Matheus Cardoso', 'Natália Costa', 'Leonardo Santos', 'Bruna Alves',
  'Felipe Araujo', 'Stephanie Lima', 'Victor Hugo', 'Leticia Nunes', 'André Rocha',
  'Carolina Monteiro', 'Rodrigo Castro', 'Vanessa Melo', 'Gustavo Freitas', 'Priscila Teixeira',
  'Daniel Campos', 'Sabrina Borges', 'Lucas Machado', 'Mariana Ramos', 'Fabio Correia',
  'Tatiana Lopes', 'Eduardo Pinto', 'Renata Cavalcanti', 'Henrique Moura', 'Adriana Cunha',
  'Paulo Mendes', 'Bianca Reis', 'Vinícius Azevedo', 'Monica Andrade', 'Alexandre Batista'
];

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

async function seedDatabase() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const contactsService = app.get(ContactsService);
  const conversationsService = app.get(ConversationsService);
  const messagesService = app.get(MessagesService);
  const integrationService = app.get(WhatsappIntegrationConfigService);
  const usersService = app.get(UsersService);
  const botsService = app.get(BotsService);

  try {

    // 1. Criar integrações do WhatsApp (simulando diferentes instâncias)
    const integrations: any[] = [];
    
    for (let i = 1; i <= 3; i++) {
      const integrationData: CreateWhatsappIntegrationConfigDto = {
        access_token: `test_token_${Math.random().toString(36).substring(7)}`,
        phone_number_id: `12345678901234${i}`,
        business_account_id: `business_account_${i}`,
        api_version: 'v18.0'
      };
      
      try {
        const integration = await integrationService.create(integrationData);
        integrations.push(integration);
      } catch (error) {
      }
    }

    // 2. Criar bots
    const bots: any[] = [];
    const botsData = [
      { name: 'Bot de Vendas', description: 'Bot especializado em vendas e informações de produtos' },
      { name: 'Bot de Suporte', description: 'Bot para suporte técnico e dúvidas gerais' },
      { name: 'Bot de FAQ', description: 'Bot com perguntas frequentes' }
    ];

    for (const botData of botsData) {
      try {
        const bot = await botsService.create(botData as CreateBotDto);
        bots.push(bot);
      } catch (error) {
      }
    }

    // 3. Buscar usuários existentes
    const users = await usersService.findAll();

    // 4. Criar contatos aleatórios
    const contacts: any[] = [];
    
    for (let i = 0; i < 50; i++) {
      const phone = generateBrazilianPhone();
      const name = brazilianNames[Math.floor(Math.random() * brazilianNames.length)];
      
      const contactData: CreateContactDto = {
        external_id: phone,
        name: name,
        phone_number: phone
      };

      try {
        const contact = await contactsService.create(contactData);
        contacts.push(contact);
        
        if ((i + 1) % 10 === 0) {
        }
      } catch (error) {
      }
    }


    // 5. Criar conversas aleatórias
    const conversations: any[] = [];

    for (let i = 0; i < Math.min(30, contacts.length); i++) {
      const contact = contacts[i];
      const integration = integrations[Math.floor(Math.random() * integrations.length)];
      
      if (!integration) continue;

      // Decidir se a conversa será atribuída a usuário ou bot
      const assignToUser = Math.random() > 0.5;
      let assigned_user: number | undefined = undefined;
      let assigned_bot: number | undefined = undefined;

      if (assignToUser && users.length > 0) {
        assigned_user = users[Math.floor(Math.random() * users.length)].id;
      } else if (bots.length > 0) {
        assigned_bot = bots[Math.floor(Math.random() * bots.length)].id;
      }

      const conversationData: CreateConversationDto = {
        contact_id: contact.id,
        integration_id: integration.id,
        assigned_user,
        assigned_bot,
      };

      try {
        const conversation = await conversationsService.create(conversationData);
        conversations.push(conversation);
        
        if ((i + 1) % 10 === 0) {
        }
      } catch (error) {
      }
    }


    // 6. Criar mensagens aleatórias para as conversas
    let totalMessages = 0;

    for (const conversation of conversations) {
      // Criar entre 2 e 8 mensagens por conversa
      const messageCount = Math.floor(Math.random() * 7) + 2;
      
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
              sender_bot: conversation.assigned_bot,
              body: botResponses[Math.floor(Math.random() * botResponses.length)],
              whatsapp_message_id: `wamid.${Math.random().toString(36).substring(7)}`,
              whatsapp_status: MessageStatus.DELIVERED
            };
          } else {
            messageData = {
              conversation_id: conversation.id,
              sender_type: MessageSender.USER,
              sender_user: conversation.assigned_user,
              body: 'Obrigado pelo contato! Como posso ajudá-lo?',
              whatsapp_message_id: `wamid.${Math.random().toString(36).substring(7)}`,
              whatsapp_status: MessageStatus.DELIVERED
            };
          }
        }

        try {
          await messagesService.createInternal(messageData);
          totalMessages++;
        } catch (error) {
          console.log(`⚠️  Erro ao criar mensagem: ${error.message}`);
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
seedDatabase().catch(console.error);