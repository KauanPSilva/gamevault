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
  
  GAME_ALREADY_OWNED:
    'Você já possui um ou mais jogos deste pedido na sua biblioteca.',

  GAME_UNAVAILABLE:
    'Um ou mais jogos não estão mais disponíveis na loja.',

  ORDER_CREATION_CONFLICT:
    'Não foi possível criar o pedido neste momento. Tente novamente.',

  ORDER_NOT_PAYABLE:
    'Este pedido não está disponível para pagamento.',

  PAYMENT_ALREADY_EXISTS:
    'Já existe um pagamento associado a este pedido.',

  PAYMENT_RESERVATION_CONFLICT:
    'Existe outra operação de pagamento em andamento.',

  GATEWAY_UNAVAILABLE:
    'O gateway de pagamento selecionado está indisponível.',

  GATEWAY_TIMEOUT:
    'O gateway demorou para responder. Consulte o status antes de tentar novamente.',

  GATEWAY_NOT_CONFIGURED:
    'O gateway de pagamento ainda não está configurado.',

  PAYMENT_RECONCILIATION_REQUIRED:
    'Não foi possível confirmar o resultado do pagamento. Consulte o status do pedido.',
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