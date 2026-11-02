
import api from '../config/api';

export interface Note {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NoteData {
  title: string;
  content: string;
  isPinned?: boolean;
}

const getPayload = (response: any) => {
  return response.data?.data ?? response.data;
};

const authConfig = (token?: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getNotes = async (token?: string): Promise<Note[]> => {
  const response = await api.get('/notes', authConfig(token));

  const payload = getPayload(response);

  if (Array.isArray(payload)) {
    return payload;
  }

  return payload?.notes ?? [];
};

export const getNote = async (
  id: string,
  token?: string
): Promise<Note> => {
  const response = await api.get(
    `/notes/${id}`,
    authConfig(token)
  );

  return getPayload(response);
};

export const createNote = async (
  data: NoteData,
  token?: string
): Promise<Note> => {
  const response = await api.post(
    '/notes',
    data,
    authConfig(token)
  );

  return getPayload(response);
};

export const updateNote = async (
  id: string,
  data: NoteData,
  token?: string
): Promise<Note> => {
  const response = await api.put(
    `/notes/${id}`,
    data,
    authConfig(token)
  );

  return getPayload(response);
};

export const deleteNote = async (
  id: string,
  token?: string
) => {
  const response = await api.delete(
    `/notes/${id}`,
    authConfig(token)
  );

  return getPayload(response);
};

export const togglePinNote = async (
  id: string,
  token?: string
): Promise<Note> => {
  const response = await api.patch(
    `/notes/${id}/pin`,
    {},
    authConfig(token)
  );

  return getPayload(response);
};

export const searchNotes = async (
  query: string,
  token?: string
): Promise<Note[]> => {
  const response = await api.get(
    '/notes/search',
    {
      ...authConfig(token),
      params: { query },
    }
  );

  const payload = getPayload(response);

  if (Array.isArray(payload)) {
    return payload;
  }

  return payload?.notes ?? [];
};
