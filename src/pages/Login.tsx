import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants';
import { UserContext } from '../context/UserContext';

export const Login = () => {
  const navigate = useNavigate();
  const { setLoading, loading, user } = useContext(UserContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
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
      navigate(ROUTES.HOME);
    }
  }, [navigate, user]);

  if (loading) {
    return <CircularProgress />;
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
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlined />
        </Avatar>
        <Typography component="h1" variant="h5">
          Iniciar sesion
        </Typography>
        <Box sx={{ mt: 1 }}>
          <TextField
            value={email}
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
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
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleSubmit}
          >
            Sign In
          </Button>
          {error && (
            <Typography sx={{ color: (theme) => theme.palette.error.main }}>
              {error}
            </Typography>
          )}
        </Box>
      </Box>
    </Container>
  );
};
