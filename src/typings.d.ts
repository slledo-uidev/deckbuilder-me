/**
 * Minimal type shims required by @supabase/storage-js in a browser context.
 * Avoids importing the full @types/node (which conflicts with Angular DOM types).
 * skipLibCheck in tsconfig.app.json handles the rest.
 */

declare namespace NodeJS {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface ReadableStream extends AsyncIterable<any> {}
}
