import { setupServer } from 'msw/node'
import { handlers } from './handler'
// This configures a Service Worker with the given request handlers.
export const server = setupServer(...handlers)
