import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from 'components/common/Icon';
import { MOBILE_PAGES, ROUTES } from 'lib';
import { useMovementSheet } from 'context/MovementSheetContext';
import { colors, tokens } from 'theme';

export const BOTTOM_NAV_HEIGHT = 62;

const isActive = (pathname: string, url: string) =>
  url === ROUTES.HOME ? pathname === '/' : pathname.startsWith(url);

/** Four destinations and the add button in the middle, always at hand. */
export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { openMovementSheet } = useMovementSheet();

  const [left, right] = [MOBILE_PAGES.slice(0, 2), MOBILE_PAGES.slice(2)];

  const item = (page: (typeof MOBILE_PAGES)[number]) => {
    const active = isActive(location.pathname, page.url);
    return (
      <Box
        key={page.url}
        onClick={() => navigate(page.url)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.25,
          minWidth: 0,
          cursor: 'pointer',
          color: active ? colors.primary : colors.outline,
        }}
      >
        <Icon name={page.icon} size={21} />
        <Typography
          sx={{
            fontSize: 8,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            whiteSpace: 'nowrap',
          }}
        >
          {page.name}
        </Typography>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: { xs: 'grid', md: 'none' },
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1200,
        height: BOTTOM_NAV_HEIGHT,
        bgcolor: 'background.paper',
        borderTop: `1px solid ${tokens.rule}`,
        boxShadow: '0 -8px 24px rgba(11,28,48,0.05)',
        gridTemplateColumns: '1fr 1fr 60px 1fr 1fr',
        alignItems: 'center',
      }}
    >
      {left.map(item)}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box
          onClick={() => openMovementSheet()}
          sx={{
            width: 48,
            height: 48,
            mt: -2,
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryContainer})`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 6px 20px ${colors.primary}4d`,
            cursor: 'pointer',
          }}
        >
          <Icon name="add" size={26} color={colors.onPrimary} />
        </Box>
      </Box>
      {right.map(item)}
    </Box>
  );
};
