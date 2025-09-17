import type { User } from '../types/user.types'
import type { Contact } from '../types/conversation.types'

/**
 * Verifica se uma conversa deve ser aceita baseado nas preferências de tipo de contato do usuário
 * @param user - Usuário com preferências de tipo de contato
 * @param contact - Contato da conversa a ser validada
 * @returns true se a conversa deve ser aceita, false caso contrário
 */
export function shouldAcceptConversation(user: User | null, contact: Contact): boolean {
  // Se usuário não está logado, não aceitar conversas
  if (!user) {
    return false
  }

  // Se a restrição não está ativada, aceitar todas as conversas
  if (!user.contact_type_restriction) {
    return true
  }

  // Se o contact não tem tipo definido, tratar como 'all' por padrão
  const contactType = contact.contact_type || 'all'

  // Se a preferência do usuário é 'all', aceitar todos os tipos
  if (user.contact_type_preference === 'all') {
    return true
  }

  // Caso contrário, só aceitar conversas do tipo específico
  return contactType === user.contact_type_preference
}

/**
 * Função de log para debug de filtragem de conversas
 * @param user - Usuário atual
 * @param contact - Contato sendo filtrado
 * @param accepted - Se a conversa foi aceita ou não
 */
export function logContactTypeFilter(user: User | null, contact: Contact, accepted: boolean): void {
  const contactType = contact.contact_type || 'all'
  console.log(`🔍 Contact Type Filter:`, {
    contactName: contact.name,
    contactType,
    userPreference: user?.contact_type_preference,
    restrictionEnabled: user?.contact_type_restriction,
    accepted,
    reason: !user ? 'No user logged in' :
            !user.contact_type_restriction ? 'Restriction disabled' :
            user.contact_type_preference === 'all' ? 'User accepts all types' :
            contactType === user.contact_type_preference ? 'Type matches preference' :
            'Type does not match preference'
  })
}