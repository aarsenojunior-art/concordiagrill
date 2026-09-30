// Hostinger requires a selectable subdirectory as the application root.
// The real server remains at the repository root so local development is unchanged.
process.env.NODE_ENV = 'production';
await import('../server.js');
