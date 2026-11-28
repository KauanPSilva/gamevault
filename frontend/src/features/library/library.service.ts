import { api } from '../../services/api';
import type { LibraryResponse } from '../../types/library';

export const libraryService = {
  async getLibrary(
    signal?: AbortSignal,
  ): Promise<LibraryResponse> {
    const response = await api.get<LibraryResponse>(
      '/library',
      { signal },
    );

    return response.data;
  },
};