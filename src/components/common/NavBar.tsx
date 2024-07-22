import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import { LinkProps, useNavigate } from 'react-router-dom';
import { Logout, Menu } from '@mui/icons-material';
import { signOut } from 'firebase/auth';
import { auth } from 'firestore/config';
import { PAGES } from 'lib';
import { useMatchPath } from 'hooks/useMatchPath';
import MioLogo from 'assets/mio_logo.png';

export const NavBarLink = ({ to, children }: LinkProps) => {
  const { palette } = useTheme();
  const { primary, background, common } = palette;
  const navigate = useNavigate();
  const match = useMatchPath(to);
  return (
    <Button
      onClick={() => {
        navigate(to);
      }}
      size="small"
      variant={match ? 'contained' : 'text'}
      sx={{
        '&:hover': {
          backgroundColor: background.default,
          color: primary.main,
        },
        backgroundColor: match ? primary.contrastText : primary.main,
        color: match ? primary.main : common.white,
        my: 2,
        display: 'block',
      }}
    >
      <Typography sx={{ textTransform: 'none' }}>{children}</Typography>
    </Button>
  );
};

export const MobileNavBarLink = ({
  name,
  to,
}: LinkProps & { name: string }) => {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const match = useMatchPath(to);
  return (
    <ListItem
      disablePadding
      onClick={() => navigate(to)}
      sx={{
        backgroundColor: match
          ? palette.primary.main
          : palette.primary.contrastText,
        color: match ? palette.common.white : palette.text.primary,
      }}
    >
      <ListItemButton sx={{ textAlign: 'center' }}>
        <ListItemText primary={name} />
      </ListItemButton>
    </ListItem>
  );
};

export const NavBar = () => {
  const { palette } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <AppBar component="nav">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <Menu />
            </IconButton>
            <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <img src={MioLogo} alt="logo" width={90} />
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2 }}>
              {PAGES.map(({ name, url }) => (
                <NavBarLink key={name} to={url}>
                  {name}
                </NavBarLink>
              ))}
            </Box>
          </Box>
          <Button
            variant="text"
            sx={{ color: palette.common.white }}
            startIcon={<Logout />}
            onClick={() => signOut(auth)}
          >
            Salir
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 180 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingY: 1,
          }}
        >
          <img src={MioLogo} alt="logo" width={140} />
        </Box>
        <Divider />
        <List>
          {PAGES.map(({ name, url }) => (
            <MobileNavBarLink key={name} to={url} name={name} />
          ))}
        </List>
      </Drawer>
    </>
  );
};
