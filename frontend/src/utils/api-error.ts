import { isAxiosError } from 'axios';

import type { ApiErrorResponse } from '../types/api';

const errorMessages: Record<string, string> = {
  INVALID_CREDENTIALS:
    'E-mail ou senha incorretos.',

  EMAIL_ALREADY_REGISTERED:
    'Já existe uma conta com este e-mail.',

  VALIDATION_ERROR:
    'Verifique os dados informados.',

  INVALID_TOKEN:
    'Sua sessão expirou. Entre novamente.',

  INTERNAL_ERROR:
    'Ocorreu um erro interno. Tente novamente.',
};

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Não foi possível concluir a operação.',
): string {
  if (!isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  if (!error.response) {
    return 'Não foi possível conectar ao servidor. Tente novamente.';
  }

  if (error.response.status === 429) {
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  }

  const code = error.response.data?.error?.code;

  if (code && Object.hasOwn(errorMessages, code)) {
    return errorMessages[code] ?? fallback;
  }

  return fallback;
}