import { app } from './app';

// This file is responsible only for starting the HTTP server.
// App initialization (DB etc.) is done in app.ts

const PORT = process.env.PORT ? Number(process.env.PORT) : 3005;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
