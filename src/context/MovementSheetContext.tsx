import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  MovementSheet,
  MovementSheetOptions,
} from 'components/movement/MovementSheet';

interface MovementSheetContextProps {
  /** Opens the entry sheet from any screen, no intermediate step. */
  openMovementSheet: (options?: MovementSheetOptions) => void;
}

export const MovementSheetContext = createContext<MovementSheetContextProps>({
  openMovementSheet: () => {},
});

export const useMovementSheet = () => useContext(MovementSheetContext);

export const MovementSheetProvider = ({ children }: PropsWithChildren) => {
  const [options, setOptions] = useState<MovementSheetOptions | null>(null);

  const openMovementSheet = useCallback(
    (next: MovementSheetOptions = {}) => setOptions(next),
    [],
  );

  const value = useMemo(() => ({ openMovementSheet }), [openMovementSheet]);

  return (
    <MovementSheetContext.Provider value={value}>
      {children}
      <MovementSheet
        open={!!options}
        onClose={() => setOptions(null)}
        {...(options ?? {})}
      />
    </MovementSheetContext.Provider>
  );
};
