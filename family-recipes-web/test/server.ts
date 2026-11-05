import { setupServer } from "msw/node";

// No default handlers: each test declares the requests it expects with server.use(...).
export const server = setupServer();
