import { To, useMatch, useResolvedPath } from 'react-router-dom';

export const useMatchPath = (to: To) => {
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname });

  return match;
};
