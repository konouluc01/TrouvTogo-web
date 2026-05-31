import { apiClient } from './client'
import type {
  ApiResponse,
  Objet,
  ObjetPayload,
  Page,
  StatutObjet,
  TypeObjet,
} from './types'

export interface ListObjetsParams {
  type?: TypeObjet
  statut?: StatutObjet
  page?: number
  size?: number
  sort?: string
}

export async function listObjets(params?: ListObjetsParams) {
  const { data } = await apiClient.get<ApiResponse<Page<Objet>>>(
    '/api/objets',
    {
      params: {
        type: params?.type,
        statut: params?.statut,
        page: params?.page ?? 0,
        size: params?.size ?? 12,
        sort: params?.sort ?? 'createdAt,desc',
      },
    },
  )
  return data
}

export interface SearchObjetsParams extends ListObjetsParams {
  keyword?: string
  categorieId?: number
}

export async function searchObjets(params?: SearchObjetsParams) {
  const { data } = await apiClient.get<ApiResponse<Page<Objet>>>(
    '/api/objets/recherche',
    {
      params: {
        keyword: params?.keyword,
        type: params?.type,
        statut: params?.statut,
        categorieId: params?.categorieId,
        page: params?.page ?? 0,
        size: params?.size ?? 12,
      },
    },
  )
  return data
}

export async function getObjet(id: number) {
  const { data } = await apiClient.get<ApiResponse<Objet>>(`/api/objets/${id}`)
  return data
}

export async function createObjet(body: ObjetPayload) {
  const { data } = await apiClient.post<ApiResponse<Objet>>('/api/objets', body)
  return data
}

export async function updateObjet(id: number, body: ObjetPayload) {
  const { data } = await apiClient.put<ApiResponse<Objet>>(
    `/api/objets/${id}`,
    body,
  )
  return data
}

export async function patchObjetStatut(id: number, statut: StatutObjet) {
  const { data } = await apiClient.patch<ApiResponse<Objet>>(
    `/api/objets/${id}/statut`,
    null,
    { params: { statut } },
  )
  return data
}

export async function deleteObjet(id: number) {
  const { data } = await apiClient.delete<ApiResponse<void>>(`/api/objets/${id}`)
  return data
}

export async function getMesObjets() {
  const { data } = await apiClient.get<ApiResponse<Objet[]>>(
    '/api/objets/mes-objets',
  )
  return data
}

export async function createSignalement(id: number, message: string) {
  const { data } = await apiClient.post<ApiResponse<any>>(
    `/api/objets/${id}/signalement`,
    { message },
  )
  return data
}
