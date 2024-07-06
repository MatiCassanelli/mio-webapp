import { Box, Button, Container, Typography } from '@mui/material';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../Routes';
import { useContext } from 'react';
import { UserContext } from '../context/UserContext';

export const Home = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const logOut = async () => {
    try {
      await signOut(auth);
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Container>
      <Typography>{user?.email}</Typography>
      <Button
        variant="contained"
        fullWidth
        color="success"
        sx={{ background: '#3AF3AF' }}
        onClick={logOut}
      >
        Cerrar sesion
      </Button>
    </Container>
  );
};
