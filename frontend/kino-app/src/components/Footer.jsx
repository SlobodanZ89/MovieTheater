import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                py: 3,
                px: 2,
                mt: 'auto',
                bgcolor: 'background.paper',
                borderTop: 1,
                borderColor: 'divider',
            }}
        >
            <Container maxWidth="lg">
                <Typography variant="body1" align="center">
                    &Copy; 2025 KinoApp. All rights reserved.
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;
