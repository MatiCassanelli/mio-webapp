import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import InputAdornment from '@mui/material/InputAdornment';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from 'firestore/config';
import { FormEvent, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from 'lib';
import { UserContext } from 'context/UserContext';
import { Loading } from './Loading';
import { colors } from 'theme';

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
      console.error(error);
      setLoading(false);
      setError('Email o contraseña incorrectos. Volvé a intentarlo.');
    }
  };

  useEffect(() => {
    if (user) navigate(ROUTES.TRANSACTIONS);
  }, [navigate, user]);

  if (loading) return <Loading />;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            sx={{
              fontFamily: '"Manrope", sans-serif',
              fontWeight: 900,
              fontSize: 32,
              color: 'primary.main',
              letterSpacing: '-1px',
              lineHeight: 1,
            }}
          >
            mio
          </Typography>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'text.secondary',
              mt: 0.5,
            }}
          >
            Gestor de finanzas
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(11,28,48,0.08)',
          }}
        >
          <Box sx={{ height: 4, background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }} />

          <Box sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h5" sx={{ fontFamily: '"Manrope", sans-serif', fontWeight: 800, mb: 0.5 }}>
              Iniciar sesión
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 4 }}>
              Ingresá tus credenciales para acceder
            </Typography>

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  value={email}
                  label="Email"
                  type="email"
                  required
                  fullWidth
                  autoComplete="email"
                  autoFocus
                  onChange={(e) => setEmail(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <span className="material-symbols-outlined" style={{ fontSize: 18, color: colors.outline }}>
                            mail
                          </span>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: colors.surfaceContainerLow,
                      borderRadius: 2,
                      '& fieldset': { border: 'none' },
                      '&:focus-within fieldset': { border: `2px solid ${colors.primary}33` },
                    },
                  }}
                />
                <TextField
                  value={password}
                  label="Contraseña"
                  type="password"
                  required
                  fullWidth
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <span className="material-symbols-outlined" style={{ fontSize: 18, color: colors.outline }}>
                            lock
                          </span>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: colors.surfaceContainerLow,
                      borderRadius: 2,
                      '& fieldset': { border: 'none' },
                      '&:focus-within fieldset': { border: `2px solid ${colors.primary}33` },
                    },
                  }}
                />

                {error && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: `${colors.tertiary}0d`, borderRadius: 2 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: colors.tertiary }}>error</span>
                    <Typography sx={{ fontSize: 13, color: colors.tertiary, fontWeight: 500 }}>{error}</Typography>
                  </Box>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    py: 1.75,
                    mt: 1,
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryContainer})`,
                    borderRadius: 2.5,
                    fontWeight: 700,
                    fontSize: 15,
                    boxShadow: `0 4px 14px ${colors.primary}33`,
                    '&:hover': { transform: 'scale(1.01)', boxShadow: `0 6px 20px ${colors.primary}4d` },
                    transition: 'all 0.3s',
                  }}
                >
                  Ingresar
                </Button>
              </Box>
            </form>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};
