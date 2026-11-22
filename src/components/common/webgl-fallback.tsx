interface WebGLFallbackProps {
  /** What the visitor can use instead, e.g. "The 2D floor plan shows the same layout." */
  alternative: string;
}

/** Shown in place of a 3D canvas when the browser can't create a WebGL context. */
export function WebGLFallback({ alternative }: WebGLFallbackProps) {
  return (
    <div
      role="status"
      className="flex size-full flex-col items-center justify-center gap-2 p-8 text-center"
    >
      <p className="font-display text-xl">3D view isn&apos;t available</p>
      <p className="max-w-prose-narrow text-sm text-muted-foreground">
        Your browser or device doesn&apos;t support WebGL. {alternative}
      </p>
    </div>
  );
}
