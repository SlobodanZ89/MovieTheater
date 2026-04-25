import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import MovieGalleryPage from './pages/MovieGalleryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CinemaListPage from './pages/CinemaListPage';
import CinemaDetailPage from './pages/CinemaDetailPage';
import HallListPage from './pages/HallListPage';
import HallDetailPage from './pages/HallDetailPage';
import MovieListPage from './pages/MovieListPage';
import MovieDetailPage from './pages/MovieDetailPage';
import ScreeningSeatSelectionPage from './pages/ScreeningSeatSelectionPage';
import CinemaMovieShowtimesPage from './pages/CinemaMovieShowtimesPage';
import RequireRole from './auth/RequireRole';
import AdminCinemasPage from './pages/admin/AdminCinemasPage';
import AdminScreeningsPage from './pages/admin/AdminScreeningsPage';
import { Box } from '@mui/material';

function App() {
  return (
    <Router>
      <Navbar />
      <Box
        component="main"
        sx={{
          minHeight: '80vh',
          bgcolor: 'background.default',
          color: 'text.primary',
        }}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/gallery" element={<MovieGalleryPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cinema" element={<CinemaListPage />} />
          <Route path="/cinema/:id" element={<CinemaDetailPage />} />
          <Route path="/cinema/:cinemaId/movie/:movieId" element={<CinemaMovieShowtimesPage />} />
          <Route path="/hall" element={<HallListPage />} />
          <Route path="/hall/:id" element={<HallDetailPage />} />
          <Route path="/movie" element={<MovieListPage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/screenings/:id/seats" element={<ScreeningSeatSelectionPage />} />

          <Route element={<RequireRole allow={['ROLE_ADMIN']} />}>
            <Route path="/admin/cinemas" element={<AdminCinemasPage />} />
            <Route path="/admin/movies" element={<MovieListPage />} />
            <Route path="/admin/halls" element={<HallListPage />} />
            <Route path="/admin/screenings" element={<AdminScreeningsPage />} />
          </Route>
        </Routes>
      </Box>
      <Footer />
    </Router>
  );
}

export default App;
