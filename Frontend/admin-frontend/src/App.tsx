import axios, { AxiosResponse } from "axios";
import { useEffect } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AppLayout from "./layout/AppLayout";
import ForgetPassword from "./pages/AuthPages/ForgetPassword";
import SignIn from "./pages/AuthPages/SignIn";
import Blank from "./pages/Blank";
// import BarChart from "./pages/Charts/BarChart";
// import LineChart from "./pages/Charts/LineChart";
import Home from "./pages/Dashboard/Home";
import LeaveManagement from "./pages/LeaveManagement";
import ServiceRates from "./pages/ManagePages/ServiceRates";
import Service from "./pages/ManagePages/Services";
import NotFound from "./pages/OtherPage/NotFound";
import ChangePassword from "./pages/Settings/ChangePassword";
import Transactions from "./pages/Transactions";
// import Alerts from "./pages/UiElements/Alerts";
// import Avatars from "./pages/UiElements/Avatars";
// import Badges from "./pages/UiElements/Badges";
// import Buttons from "./pages/UiElements/Buttons";
// import Images from "./pages/UiElements/Images";
// import Videos from "./pages/UiElements/Videos";
import Expertise from "./pages/Expertise";
import Shop from "./pages/Shop";
import Stylists from "./pages/Stylists";
import UserProfiles from "./pages/UserProfiles";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_PROD;
// const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;
const config = {
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
  },
};
export default function App() {
  useEffect(() => {
    const refreshTokenFunction = () => {
      console.log("refreshing token");
      const jwttoken = sessionStorage.getItem("token");
      const refreshToken = sessionStorage.getItem("refreshToken");
      if (jwttoken) {
        axios
          .post(
            `${api_address}/api/auth/refresh-token`,
            { token: refreshToken },
            config
          )
          .then((res: AxiosResponse) => {
            sessionStorage.setItem("token", res.data.token);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    };
    refreshTokenFunction();
    setInterval(() => {
      refreshTokenFunction();
    }, 1000 * 60 * 15);
  }, []);
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Stylists />} />

            {/* Main Page */}
            {/* <Route path="/stylists" element={<Stylists />} /> */}
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/expertise" element={<Expertise />} />
            <Route path="/services" element={<Service />} />
            <Route path="/service-rates" element={<ServiceRates />} />

            {/* Leave Management Routes */}
            <Route path="/leave-management" element={<LeaveManagement />} />

            {/* Settings */}
            <Route
              path="/settings"
              element={<Navigate to="/settings/profile" replace />}
            />
            <Route path="/settings/profile" element={<UserProfiles />} />
            <Route
              path="/settings/change-password"
              element={<ChangePassword />}
            />

            {/* Others Page */}
            <Route path="/blank" element={<Blank />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          {/* <Route path="/signup" element={<SignUp />} /> */}
          <Route path="/reset-password" element={<ForgetPassword />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
