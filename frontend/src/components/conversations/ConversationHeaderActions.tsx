import React, { useState } from 'react'
import { UserMinus, UserPlus, Mail, User } from 'lucide-react'
import { useConversationStore } from '../../stores/conversationStore'
import type { Conversation } from '../../types/conversation.types'

interface ConversationHeaderActionsProps {
  conversation: Conversation
  onShowProfile?: () => void
  onConversationClose?: () => void
}

const ConversationHeaderActions: React.FC<ConversationHeaderActionsProps> = ({ conversation, onShowProfile, onConversationClose }) => {
  const { 
    unassignConversation, 
    assignConversationToMe, 
    markConversationAsUnread 
  } = useConversationStore()
  
  const [isUnassigning, setIsUnassigning] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [isMarkingUnread, setIsMarkingUnread] = useState(false)

  const handleUnassign = async () => {
    try {
      setIsUnassigning(true)
      await unassignConversation(conversation.id)
      onConversationClose?.()
    } catch (error) {
      console.error('Error unassigning conversation:', error)
    } finally {
      setIsUnassigning(false)
    }
  }

  const handleAssignToMe = async () => {
    try {
      setIsAssigning(true)
      await assignConversationToMe(conversation.id)
      onConversationClose?.()
    } catch (error) {
      console.error('Error assigning conversation to me:', error)
    } finally {
      setIsAssigning(false)
    }
  }

  const handleMarkAsUnread = async () => {
    try {
      setIsMarkingUnread(true)
      await markConversationAsUnread(conversation.id)
    } catch (error) {
      console.error('Error marking conversation as unread:', error)
    } finally {
      setIsMarkingUnread(false)
    }
  }

  const isAssignedToUser = !!conversation.assignedUser
  const isAssignedToBot = !!conversation.assignedBot
  const isUnassigned = !isAssignedToUser && !isAssignedToBot

  return (
    <div className="flex items-center gap-1">
      {/* Contact profile button */}
      {onShowProfile && (
        <button
          onClick={onShowProfile}
          className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
          title="Ver perfil do contato"
        >
          <User className="w-5 h-5" />
        </button>
      )}

      {/* Unassign button - show when assigned to user OR bot */}
      {(isAssignedToUser || isAssignedToBot) && (
        <button
          onClick={handleUnassign}
          disabled={isUnassigning}
          className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Desatribuir conversa"
        >
          {isUnassigning ? (
            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <UserMinus className="w-5 h-5" />
          )}
        </button>
      )}

      {/* Assign to me button - show when unassigned OR assigned to bot */}
      {(isUnassigned || isAssignedToBot) && (
        <button
          onClick={handleAssignToMe}
          disabled={isAssigning}
          className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Atribuir para mim"
        >
          {isAssigning ? (
            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <UserPlus className="w-5 h-5" />
          )}
        </button>
      )}

      {/* Mark as unread button */}
      <button
        onClick={handleMarkAsUnread}
        disabled={isMarkingUnread}
        className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Marcar como não lida"
      >
        {isMarkingUnread ? (
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Mail className="w-5 h-5" />
        )}
      </button>
    </div>
  )
}

export default ConversationHeaderActions