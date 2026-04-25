import { useContext, useMemo, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import { ColorModeContext } from '../theme/ColorModeProvider';
import { AuthContext } from '../auth/AuthContext';

const Navbar = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    useContext(ColorModeContext);
    const { role, isAuthenticated, clearAuth } = useContext(AuthContext);

    const isAdmin = useMemo(() => role === 'ROLE_ADMIN', [role]);

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    return (
        <>
            <AppBar position="static" color="transparent" elevation={0}>
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2, display: { sm: 'none' } }}
                        onClick={handleDrawerToggle}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography
                        variant="h6"
                        component={Link}
                        to="/"
                        sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
                    >
                        Kino
                    </Typography>

                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        <Button color="inherit" component={Link} to="/cinema">
                            Cinemas
                        </Button>
                        {isAdmin && (
                            <Button color="inherit" component={Link} to="/hall">
                                Halls
                            </Button>
                        )}
                        {isAdmin && (
                            <Button color="inherit" component={Link} to="/admin/cinemas">
                                Admin
                            </Button>
                        )}
                    </Box>

                    {!isAuthenticated ? (
                        <Button color="inherit" component={Link} to="/login" sx={{ ml: 1 }}>
                            Login
                        </Button>
                    ) : (
                        <Button
                            color="inherit"
                            sx={{ ml: 1 }}
                            onClick={() => {
                                clearAuth();
                            }}
                        >
                            Logout
                        </Button>
                    )}
                </Toolbar>
            </AppBar>
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={handleDrawerToggle}
                sx={{ display: { sm: 'none' } }}
            >
                <List>
                    <ListItem disablePadding>
                        <ListItemButton component={Link} to="/" onClick={handleDrawerToggle}>
                            <ListItemText primary="Kino" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton component={Link} to="/cinema" onClick={handleDrawerToggle}>
                            <ListItemText primary="Cinemas" />
                        </ListItemButton>
                    </ListItem>
                    {isAdmin && (
                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/hall" onClick={handleDrawerToggle}>
                                <ListItemText primary="Halls" />
                            </ListItemButton>
                        </ListItem>
                    )}
                    {isAdmin && (
                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/admin/cinemas" onClick={handleDrawerToggle}>
                                <ListItemText primary="Admin" />
                            </ListItemButton>
                        </ListItem>
                    )}
                    {!isAuthenticated ? (
                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/login" onClick={handleDrawerToggle}>
                                <ListItemText primary="Login" />
                            </ListItemButton>
                        </ListItem>
                    ) : (
                        <ListItem disablePadding>
                            <ListItemButton
                                onClick={() => {
                                    clearAuth();
                                    handleDrawerToggle();
                                }}
                            >
                                <ListItemText primary="Logout" />
                            </ListItemButton>
                        </ListItem>
                    )}
                </List>
            </Drawer>
        </>
    );
};

export default Navbar;