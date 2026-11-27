import { GatewayRegistry } from './gateway.registry.js';

import {
  JuntosSeFazAdapter,
} from './adapters/juntos-se-faz.adapter.js';

export const gatewayRegistry = new GatewayRegistry([
  new JuntosSeFazAdapter(),
]);