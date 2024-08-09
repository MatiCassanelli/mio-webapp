import { Box, Button, Container, TextField, Typography } from '@mui/material';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from 'firestore/config';
import { FormEvent, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from 'lib';
import { UserContext } from 'context/UserContext';
import MioLogo from 'assets/mio_logo.png';
import { Loading } from './Loading';

export const Login = () => {
  const navigate = useNavigate();
  const { setLoading, loading, user } = useContext(UserContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError('');
    } catch (error) {
      console.log(error);
      setLoading(false);
      setError('Algo salió mal. Volvé a intentarlo');
    }
  };

  useEffect(() => {
    if (user) {
      navigate(ROUTES.TRANSACTIONS);
    }
  }, [navigate, user]);

  if (loading) {
    return <Loading />;
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
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
          <img src={MioLogo} alt="logo" width={180} />
        </Box>
        <Typography component="h1" variant="h5">
          Iniciar sesion
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            value={email}
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            value={password}
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            type="submit"
          >
            Sign In
          </Button>
          {error && (
            <Typography sx={{ color: (theme) => theme.palette.error.main }}>
              {error}
            </Typography>
          )}
        </form>
      </Box>
    </Container>
  );
};
