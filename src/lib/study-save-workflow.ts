// Compensate storage only if the database transaction failed. Redirects/cache
// refreshes run afterward so a committed document can never be deleted here.
export async function persistWithOptionalPdf<Prepared, Stored, Result>(prepared: Prepared | null, dependencies: {
  store: (prepared: Prepared) => Promise<Stored>;
  commit: (stored: Stored | null) => Promise<Result>;
  remove: (stored: Stored) => Promise<void>;
  onCleanupError: (error: unknown) => void;
}): Promise<Result> {
  const stored = prepared ? await dependencies.store(prepared) : null;
  try {
    return await dependencies.commit(stored);
  } catch (error) {
    if (stored) {
      try { await dependencies.remove(stored); }
      catch (cleanupError) { dependencies.onCleanupError(cleanupError); }
    }
    throw error;
  }
}
