import { useContext } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from 'firestore/config';
import { UserContext } from 'context/UserContext';
import { useMovementSheet } from 'context/MovementSheetContext';
import { Icon } from 'components/common/Icon';
import { DESKTOP_PAGES, ROUTES } from 'lib';
import { colors, DRAWER_WIDTH, tokens } from 'theme';
import { primaryButtonSx } from 'utils/buttonStyles';

const isActive = (pathname: string, url: string) =>
  url === ROUTES.HOME ? pathname === '/' : pathname.startsWith(url);

/** The mobile bottom bar becomes this 256px side nav. */
export const SideNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { openMovementSheet } = useMovementSheet();

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          bgcolor: 'background.paper',
          borderRight: `1px solid ${tokens.rule}`,
          overflowX: 'hidden',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          py: 2.75,
          px: 2,
        }}
      >
        <Box sx={{ px: 1 }}>
          <Typography
            sx={{
              fontFamily: '"Manrope", sans-serif',
              fontWeight: 900,
              fontSize: 22,
              color: 'primary.main',
              letterSpacing: '-0.6px',
              lineHeight: 1.1,
            }}
          >
            mio
          </Typography>
          <Typography sx={{ fontSize: 11, color: colors.outline, mt: 0.25 }}>
            Gestor de finanzas
          </Typography>
        </Box>

        <Box
          sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, mt: 3.25 }}
        >
          {DESKTOP_PAGES.map((page) => {
            const active = isActive(location.pathname, page.url);
            return (
              <Box
                key={page.url}
                onClick={() => navigate(page.url)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 1.375,
                  borderRadius: 3,
                  cursor: 'pointer',
                  bgcolor: active ? colors.surfaceContainerLow : 'transparent',
                  color: active ? colors.primary : colors.onSurfaceVariant,
                  '&:hover': { bgcolor: colors.surfaceContainerLow },
                  transition: 'background-color 0.2s',
                }}
              >
                <Icon name={page.icon} size={20} />
                <Typography
                  sx={{
                    fontFamily: '"Manrope", sans-serif',
                    fontWeight: 800,
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  {page.name}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <Button
          variant="contained"
          startIcon={<Icon name="add" size={18} />}
          onClick={() => openMovementSheet()}
          sx={{ ...primaryButtonSx({ py: 1.625, fontSize: 13 }), mt: 3.25 }}
        >
          Nuevo movimiento
        </Button>

        <Box
          sx={{
            mt: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            p: 1.375,
            border: `1px solid ${tokens.hairline}`,
            borderRadius: 3,
            boxShadow: '0 1px 4px rgba(11,28,48,0.06)',
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: colors.surfaceContainerLow,
              color: colors.primary,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: '"Manrope", sans-serif',
              fontWeight: 800,
              fontSize: 12,
              flexShrink: 0,
            }}
          >
            {user?.email?.[0]?.toUpperCase() ?? 'U'}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.email ?? ''}
            </Typography>
            <Typography sx={{ fontSize: 10, color: colors.outline }}>
              Cerrar sesión
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => signOut(auth)}
            sx={{ color: colors.outline, flexShrink: 0 }}
            title="Cerrar sesión"
          >
            <Icon name="logout" size={18} />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
};
