import React, { useContext } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from 'firestore/config';
import { UserContext } from 'context/UserContext';
import { PAGES } from 'lib';
import { colors, DRAWER_WIDTH } from 'theme';

interface SideNavProps {
  readonly mobileOpen: boolean;
  readonly onClose: () => void;
}

export const SideNav = ({ mobileOpen, onClose }: SideNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        py: 3,
        px: 2,
      }}
    >
      <Box sx={{ px: 2, mb: 5 }}>
        <Typography
          sx={{
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 900,
            fontSize: 16,
            color: 'primary.main',
            letterSpacing: '-0.5px',
            lineHeight: 1.2,
          }}
        >
          Mio
        </Typography>
        <Typography
          sx={{
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontSize: 10,
            fontWeight: 600,
            color: 'text.secondary',
            opacity: 0.7,
            mt: 0.5,
          }}
        >
          Gestor de finanzas
        </Typography>
      </Box>

      <List
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.25,
          flexGrow: 1,
          p: 0,
        }}
      >
        {PAGES.map((item) => {
          const active = isActive(item.url);
          return (
            <ListItem key={item.url} disablePadding>
              <ListItemButton
                onClick={() => handleNav(item.url)}
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  px: 2,
                  borderRight: active
                    ? `4px solid ${colors.primaryContainer}`
                    : '4px solid transparent',
                  bgcolor: active ? colors.surfaceContainerLow : 'transparent',
                  color: active ? colors.primaryContainer : colors.onSurface,
                  opacity: active ? 1 : 0.7,
                  '&:hover': {
                    bgcolor: colors.surfaceContainerLow,
                    opacity: 1,
                  },
                  transition: 'all 0.3s',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 'unset',
                    mr: 1.5,
                    color: 'inherit',
                    fontSize: 20,
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 20 }}
                  >
                    {item.icon}
                  </span>
                </ListItemIcon>
                <ListItemText
                  primary={item.name}
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontFamily: '"Manrope", sans-serif',
                      },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ px: 1, pb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            bgcolor: colors.surfaceContainerLowest,
            borderRadius: 3,
            boxShadow: '0 1px 4px rgba(11,28,48,0.06)',
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              flexShrink: 0,
              bgcolor: 'primary.main',
              fontSize: 14,
            }}
          >
            {user?.email?.[0]?.toUpperCase() ?? 'U'}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.email ?? ''}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => signOut(auth)}
            sx={{ color: 'text.secondary', flexShrink: 0 }}
            title="Cerrar sesión"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18 }}
            >
              logout
            </span>
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop: permanent drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            bgcolor: 'background.default',
            overflowX: 'hidden',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Mobile: temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            bgcolor: 'background.default',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};
