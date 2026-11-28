export interface AdminGateway {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  isImplemented: boolean;
  environment: 'sandbox';
  createdAt: string;
  updatedAt: string;
}

export interface AdminGatewaysResponse {
  gateways: AdminGateway[];
}

export interface AdminGatewayResponse {
  gateway: AdminGateway;
}

export interface UpdateGatewayStatusInput {
  isActive: boolean;
}