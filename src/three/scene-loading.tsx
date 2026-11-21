/** Styled placeholder shown while a 3D scene's code and assets load. */
export function SceneLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex size-full min-h-64 items-center justify-center rounded-2xl bg-stone-100"
    >
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <span className="size-8 animate-spin rounded-full border-2 border-sage-300 border-t-forest-700 motion-reduce:animate-none" />
        <span className="text-sm">Preparing 3D view…</span>
      </div>
    </div>
  );
}
