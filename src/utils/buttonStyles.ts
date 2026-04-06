import { colors } from 'theme';

export const gradientButtonSx = (
  from: string,
  to: string,
  opts: { py?: number; fontSize?: number; px?: number } = {},
) => ({
  background: `linear-gradient(135deg, ${from}, ${to})`,
  borderRadius: 3,
  fontWeight: 700,
  py: opts.py ?? 2,
  fontSize: opts.fontSize ?? 15,
  ...(opts.px != null && { px: opts.px }),
  boxShadow: `0 4px 14px ${from}33`,
  '&:hover': {
    transform: 'scale(1.01)',
    boxShadow: `0 6px 20px ${from}4d`,
  },
  '&.Mui-disabled': { background: colors.surfaceContainerHigh },
  transition: 'all 0.3s',
});

export const primaryButtonSx = (opts?: { py?: number; fontSize?: number; px?: number }) =>
  gradientButtonSx(colors.primary, colors.primaryContainer, opts);

export const secondaryButtonSx = (opts?: { py?: number; fontSize?: number; px?: number }) =>
  gradientButtonSx(colors.secondary, colors.secondaryContainer, opts);
