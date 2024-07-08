import { Container, Toolbar } from '@mui/material';
import { PropsWithChildren } from 'react';
import { NavBar } from '../components/NavBar';

export const BasePage = ({ children }: PropsWithChildren) => (
  <>
    <NavBar />
    <Container sx={{ height: '100vh' }}>
      <Toolbar />
      {children}
    </Container>
  </>
);
