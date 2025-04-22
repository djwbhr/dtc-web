import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";

export const AppBar = () => {
  return (
    <MuiAppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Новости
        </Typography>
        <Box>
          <Button color="inherit" component={RouterLink} to="/" sx={{ mx: 1 }}>
            Главная
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/favorites"
            sx={{ mx: 1 }}
          >
            Избранное
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/upload"
            startIcon={<CloudUploadIcon />}
            sx={{ mx: 1 }}
          >
            Загрузить
          </Button>
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
};
