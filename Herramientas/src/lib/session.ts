import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Obtiene la sesión del servidor y retorna el userId si está autenticado.
 * Retorna null si no hay sesión.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

/**
 * Obtiene el userId o lanza un error 401 si no está autenticado.
 * Útil para usar en API routes.
 */
export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }
  return userId;
}

/**
 * Verifica que un registro pertenezca al usuario actual.
 */
export async function verifyOwnership(
  table: "transaction" | "goal" | "reminder",
  id: string,
  userId: string
): Promise<boolean> {
  const record = await (db[table] as any).findUnique({
    where: { id },
    select: { userId: true },
  });
  return record?.userId === userId;
}
