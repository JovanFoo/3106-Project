import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "simplebar-react/dist/simplebar.min.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider as CustomThemeProvider } from "./context/ThemeContext.tsx";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { UserProvider } from "./context/UserContext.tsx";
import { LocalizationProvider } from "@mui/x-date-pickers";
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UserProvider>
      <CustomThemeProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppWrapper>
            <App />
          </AppWrapper>
        </ThemeProvider>
      </CustomThemeProvider>
    </UserProvider>
  </StrictMode>
);
