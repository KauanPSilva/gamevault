export function getAuthRedirect(state: unknown): string {
  if (
    typeof state !== 'object' ||
    state === null ||
    !('from' in state) ||
    typeof state.from !== 'string'
  ) {
    return '/';
  }

  const destination = state.from;

  const hasInvalidCharacters = Array.from(destination).some(
    (character) => {
      const code = character.charCodeAt(0);

      return (
        code <= 32 ||
        code === 127 ||
        character === '\\'
      );
    },
  );

  if (
    !destination.startsWith('/') ||
    destination.startsWith('//') ||
    hasInvalidCharacters
  ) {
    return '/';
  }

  try {
    const url = new URL(
      destination,
      window.location.origin,
    );

    if (url.origin !== window.location.origin) {
      return '/';
    }

    if (
      ['/login', '/register'].includes(
        url.pathname.replace(/\/+$/, '').toLowerCase(),
      )
    ) {
      return '/';
    }

    return url.pathname + url.search + url.hash;
  } catch {
    return '/';
  }
}