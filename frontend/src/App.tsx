import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, CircularProgress, Grid, Card, CardContent, CardMedia, CardActions } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AuthClient } from '@dfinity/auth-client';
import { backend } from '../declarations/backend';

type Certificate = {
  id: bigint;
  energySource: string;
  details: string;
  price: bigint;
  owner: [] | [Principal];
  createdAt: bigint;
  imageUrl: string;
};

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
}));

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const StyledCardMedia = styled(CardMedia)({
  paddingTop: '56.25%', // 16:9 aspect ratio
});

const StyledCardContent = styled(CardContent)({
  flexGrow: 1,
});

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const client = await AuthClient.create();
      setAuthClient(client);
      const isAuthenticated = await client.isAuthenticated();
      setIsAuthenticated(isAuthenticated);
      setLoading(false);
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCertificates();
    }
  }, [isAuthenticated]);

  const login = async () => {
    if (authClient) {
      await authClient.login({
        identityProvider: 'https://identity.ic0.app/#authorize',
        onSuccess: () => {
          setIsAuthenticated(true);
          backend.login();
        },
      });
    }
  };

  const logout = async () => {
    if (authClient) {
      await authClient.logout();
      setIsAuthenticated(false);
      backend.logout();
    }
  };

  const fetchCertificates = async () => {
    try {
      const certs = await backend.getCertificates();
      setCertificates(certs);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  if (loading) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <div className="App">
      <StyledAppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Renewable Energy Certificate Market
          </Typography>
          {isAuthenticated ? (
            <Button color="inherit" onClick={logout}>Logout</Button>
          ) : (
            <Button color="inherit" onClick={login}>Login</Button>
          )}
        </Toolbar>
      </StyledAppBar>

      <StyledContainer>
        <nav>
          <Button component={Link} to="/" color="primary">Home</Button>
          <Button component={Link} to="/list" color="primary">List Certificate</Button>
        </nav>

        <Routes>
          <Route path="/" element={<Home certificates={certificates} />} />
          <Route path="/list" element={<ListCertificate isAuthenticated={isAuthenticated} />} />
        </Routes>
      </StyledContainer>
    </div>
  );
};

const Home: React.FC<{ certificates: Certificate[] }> = ({ certificates }) => (
  <div>
    <Typography variant="h4" component="h1" gutterBottom>
      Available Certificates
    </Typography>
    <Grid container spacing={4}>
      {certificates.map((cert) => (
        <Grid item key={cert.id.toString()} xs={12} sm={6} md={4}>
          <StyledCard>
            <StyledCardMedia
              image={cert.imageUrl}
              title={cert.energySource}
            />
            <StyledCardContent>
              <Typography gutterBottom variant="h5" component="h2">
                {cert.energySource}
              </Typography>
              <Typography>
                {cert.details}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Price: {cert.price.toString()}
              </Typography>
            </StyledCardContent>
            <CardActions>
              <Button size="small" color="primary">View Details</Button>
            </CardActions>
          </StyledCard>
        </Grid>
      ))}
    </Grid>
  </div>
);

const ListCertificate: React.FC<{ isAuthenticated: boolean }> = ({ isAuthenticated }) => {
  const [energySource, setEnergySource] = useState('');
  const [details, setDetails] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      try {
        const result = await backend.addCertificate(energySource, details, BigInt(price), imageUrl);
        console.log('Certificate added:', result);
        // Reset form or show success message
      } catch (error) {
        console.error('Error adding certificate:', error);
      }
    } else {
      console.log('User not authenticated');
    }
  };

  if (!isAuthenticated) {
    return <Typography>Please login to list a certificate.</Typography>;
  }

  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        List Your Certificate
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Energy Source"
              value={energySource}
              onChange={(e) => setEnergySource(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Certificate Details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              label="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              List Certificate
            </Button>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

export default App;