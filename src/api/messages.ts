import { apiClient } from './client'
import type {
  ApiResponse,
  Conversation,
  Message,
  MessagePayload,
} from './types'

export async function sendMessage(body: MessagePayload) {
  const { data } = await apiClient.post<ApiResponse<Message>>(
    '/api/messages',
    body,
  )
  return data
}

export async function listConversations() {
  const { data } = await apiClient.get<ApiResponse<Conversation[]>>(
    '/api/conversations',
  )
  return data
}

export async function conversationMessages(otherUserId: number) {
  const { data } = await apiClient.get<ApiResponse<Message[]>>(
    `/api/conversations/${otherUserId}/messages`,
  )
  return data
}

export async function getConversationWithUser(autreUserId: number) {
  const { data } = await apiClient.get<ApiResponse<Message[]>>(
    `/api/messages/conversation/${autreUserId}`,
  )
  return data
}

export async function countUnread() {
  const { data } = await apiClient.get<ApiResponse<number>>(
    '/api/messages/non-lus/count',
  )
  return data
}

export async function markMessageRead(id: number) {
  const { data } = await apiClient.patch<ApiResponse<void>>(
    `/api/messages/${id}/lu`,
  )
  return data
}
