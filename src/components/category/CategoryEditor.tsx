import { useContext, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  Category,
  CategoryKind,
  CATEGORY_COLORS,
  SubCategory,
} from 'types/Category';
import { Icon } from 'components/common/Icon';
import { SectionLabel } from 'components/form/SectionLabel';
import { UserContext } from 'context/UserContext';
import { useData } from 'context/DataContext';
import {
  archiveCategory,
  createCategory,
  updateCategory,
} from 'services/categories';
import { primaryButtonSx } from 'utils/buttonStyles';
import { colors, tokens } from 'theme';

interface CategoryEditorProps {
  category: Category | null;
  onClose: () => void;
}

const KIND_LABEL: Record<CategoryKind, string> = {
  expense: 'De egreso',
  income: 'De ingreso',
  both: 'Las dos',
};

const slug = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `sub-${Date.now()}`;

/** "Café" and "Cafe" can't share an id: they'd collide as a key and as a selection. */
const uniqueSlug = (name: string, existing: SubCategory[]) => {
  const base = slug(name);
  const ids = new Set(existing.map((sub) => sub.id));
  let candidate = base;
  let suffix = 2;
  while (ids.has(candidate)) {
    candidate = `${base}-${suffix++}`;
  }
  return candidate;
};

/** The Category asks for name, color, and whether it's income or expense — never an Account. */
export const CategoryEditor = ({ category, onClose }: CategoryEditorProps) => {
  const { user } = useContext(UserContext);
  const { categories } = useData();
  const [name, setName] = useState('');
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [kind, setKind] = useState<CategoryKind>('expense');
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [newSub, setNewSub] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(category?.name ?? '');
    setColor(category?.color ?? CATEGORY_COLORS[0]);
    setKind(category?.kind ?? 'expense');
    setSubcategories(category?.subcategories ?? []);
    setNewSub('');
    setError('');
  }, [category]);

  const isValid = name.trim().length > 0;

  /** Shared base Categories (no `userId`) are everyone's: nobody gets to edit or archive them. */
  const isOwner = !category || category.userId === user?.uid;
  const readOnly = !isOwner;

  const addSub = () => {
    if (readOnly) return;
    const value = newSub.trim();
    if (!value) return;
    setSubcategories((current) => [
      ...current,
      { id: uniqueSlug(value, current), name: value },
    ]);
    setNewSub('');
  };

  const handleSave = async () => {
    if (!isValid || !user || readOnly) return;
    setBusy(true);
    setError('');
    try {
      const payload = {
        name: name.trim(),
        color,
        kind,
        archived: category?.archived ?? false,
        order: category?.order ?? categories.length,
        ...(subcategories.length ? { subcategories } : { subcategories: [] }),
      };
      if (category) {
        await updateCategory(category.id, payload);
      } else {
        await createCategory({ ...payload, userId: user.uid });
      }
      onClose();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  const handleArchive = async () => {
    if (readOnly || !category) return;
    setBusy(true);
    try {
      await archiveCategory(category.id, !category.archived);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
      {readOnly && (
        <Box
          sx={{
            bgcolor: `${colors.primary}0f`,
            borderRadius: 2.5,
            px: 1.625,
            py: 1.25,
            fontSize: 12,
            color: colors.primary,
            fontWeight: 600,
            lineHeight: 1.45,
          }}
        >
          Categoría base, compartida por todos los usuarios: no se puede editar ni
          archivar.
        </Box>
      )}

      <Box>
        <SectionLabel>Nombre</SectionLabel>
        <TextField
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          disabled={busy || readOnly}
          placeholder="Comida"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: colors.surfaceContainerLow,
              borderRadius: 2,
              fontSize: 14,
              '& fieldset': { border: `2px solid ${colors.primary}33` },
            },
          }}
        />
      </Box>

      <Box>
        <SectionLabel>Color</SectionLabel>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {CATEGORY_COLORS.map((option) => (
            <Box
              key={option}
              onClick={readOnly ? undefined : () => setColor(option)}
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                bgcolor: option,
                cursor: readOnly ? 'default' : 'pointer',
                opacity: readOnly ? 0.5 : 1,
                outline:
                  option === color ? `2px solid ${colors.onSurface}` : 'none',
                outlineOffset: 2,
              }}
            />
          ))}
        </Box>
      </Box>

      <Box>
        <SectionLabel>Tipo</SectionLabel>
        <Box sx={{ display: 'flex', gap: 0.875, flexWrap: 'wrap' }}>
          {(Object.keys(KIND_LABEL) as CategoryKind[]).map((option) => {
            const active = option === kind;
            return (
              <Box
                key={option}
                onClick={readOnly ? undefined : () => setKind(option)}
                sx={{
                  height: 32,
                  px: 1.5,
                  display: 'inline-flex',
                  alignItems: 'center',
                  borderRadius: 999,
                  bgcolor: active ? `${colors.primary}14` : 'background.default',
                  border: active
                    ? `1.5px solid ${colors.primary}`
                    : `1px solid ${tokens.rule}`,
                  color: active ? colors.primary : colors.onSurfaceVariant,
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: readOnly ? 'default' : 'pointer',
                  opacity: readOnly ? 0.5 : 1,
                }}
              >
                {KIND_LABEL[option]}
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box>
        <SectionLabel>Subcategorías</SectionLabel>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
          {subcategories.map((sub) => (
            <Box
              key={sub.id}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                height: 26,
                px: 1.25,
                borderRadius: 999,
                bgcolor: `${color}14`,
                color,
                fontWeight: 700,
                fontSize: 11,
              }}
            >
              {sub.name}
              {!readOnly && (
                <Icon
                  name="close"
                  size={14}
                  onClick={() =>
                    setSubcategories((current) =>
                      current.filter((s) => s.id !== sub.id),
                    )
                  }
                />
              )}
            </Box>
          ))}
        </Box>
        {!readOnly && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              value={newSub}
              onChange={(e) => setNewSub(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSub();
                }
              }}
              fullWidth
              size="small"
              disabled={busy}
              placeholder="Supermercado"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: colors.surfaceContainerLow,
                  borderRadius: 2,
                  fontSize: 13,
                  '& fieldset': { border: 'none' },
                },
              }}
            />
            <Button
              onClick={addSub}
              disabled={!newSub.trim() || busy}
              sx={{ color: colors.primary, fontWeight: 700, fontSize: 12 }}
            >
              Agregar
            </Button>
          </Box>
        )}
      </Box>

      {error && (
        <Typography sx={{ color: 'error.main', fontSize: 13 }}>{error}</Typography>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          pt: 1.75,
          borderTop: `1px solid ${tokens.hairline}`,
        }}
      >
        {category && isOwner ? (
          <Button
            onClick={handleArchive}
            disabled={busy}
            startIcon={
              <Icon name={category.archived ? 'unarchive' : 'archive'} size={16} />
            }
            sx={{
              color: category.archived ? colors.secondary : colors.tertiary,
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            {category.archived ? 'Desarchivar' : 'Archivar'}
          </Button>
        ) : (
          <Box />
        )}
        <Button
          variant="contained"
          disabled={!isValid || busy || readOnly}
          onClick={handleSave}
          startIcon={<Icon name="save" size={16} />}
          sx={primaryButtonSx({ py: 1.25, px: 2.25, fontSize: 12 })}
        >
          {busy ? 'Guardando…' : 'Guardar'}
        </Button>
      </Box>
    </Box>
  );
};
