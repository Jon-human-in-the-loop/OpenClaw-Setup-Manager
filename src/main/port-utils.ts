import { createServer } from "node:net";
import { getDb } from "./db";

/**
 * Returns the next available TCP port starting from `startPort`.
 * Also checks against ports already registered in the `instances` table
 * to avoid assigning a port that Docker hasn't bound yet.
 */
export async function findFreePort(startPort = 3000): Promise<number> {
  // Collect ports already in use by registered instances
  const db = getDb();
  const usedPorts = new Set<number>(
    (db.prepare("SELECT port FROM instances").all() as { port: number }[]).map((r) => r.port)
  );

  let port = startPort;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (usedPorts.has(port)) {
      port++;
      continue;
    }

    const available = await new Promise<boolean>((resolve) => {
      const srv = createServer();
      srv.once("error", () => resolve(false));
      srv.once("listening", () => {
        srv.close();
        resolve(true);
      });
      srv.listen(port, "127.0.0.1");
    });

    if (available) return port;
    port++;
  }
}
