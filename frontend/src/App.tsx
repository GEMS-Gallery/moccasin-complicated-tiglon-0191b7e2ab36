import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, CircularProgress } from '@mui/material';
import { AuthClient } from '@dfinity/auth-client';
import { backend } from '../declarations/backend';

type Certificate = {
  id: bigint;
  energySource: string;
  details: string;
  price: bigint;
  owner: [] | [Principal];
  createdAt: bigint;
};

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
    return <CircularProgress />;
  }

  return (
    <div className="App">
      <AppBar position="static">
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
      </AppBar>

      <Container>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/list">List Certificate</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home certificates={certificates} />} />
          <Route path="/list" element={<ListCertificate isAuthenticated={isAuthenticated} />} />
        </Routes>
      </Container>
    </div>
  );
};

const Home: React.FC<{ certificates: Certificate[] }> = ({ certificates }) => (
  <div>
    <h1>Available Certificates</h1>
    {certificates.map((cert) => (
      <div key={cert.id.toString()}>
        <h2>{cert.energySource}</h2>
        <p>{cert.details}</p>
        <p>Price: {cert.price.toString()}</p>
      </div>
    ))}
  </div>
);

const ListCertificate: React.FC<{ isAuthenticated: boolean }> = ({ isAuthenticated }) => {
  const [energySource, setEnergySource] = useState('');
  const [details, setDetails] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      try {
        const result = await backend.addCertificate(energySource, details, BigInt(price));
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
    return <p>Please login to list a certificate.</p>;
  }

  return (
    <div>
      <h1>List Your Certificate</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={energySource}
          onChange={(e) => setEnergySource(e.target.value)}
          placeholder="Energy Source"
          required
        />
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Certificate Details"
          required
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          required
        />
        <button type="submit">List Certificate</button>
      </form>
    </div>
  );
};

export default App;