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
import Appointments from "./pages/AppointmentPage/Appointments";
import ForgetPassword from "./pages/AuthPages/ForgetPassword";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import Calendar from "./pages/CalenderPage/Calendar";
import LeaveApplicationApproval from "./pages/LeaveApplicationApproval";
import BarberLeaveManagement from "./pages/BarberLeaveManagement";
import NotFound from "./pages/OtherPage/NotFound";
import ChangePassword from "./pages/SettingsUIPages/ChangePassword";
import Expertise from "./pages/SettingsUIPages/Expertise";
import Notifications from "./pages/ExtraPages/Notifications";
import Portfolio from "./pages/SettingsUIPages/Portfolio";
import Testimonials from "./pages/SettingsUIPages/Testimonials";
import ShopSettings from "./pages/ShopSettingPage/ShopSettings";
import Teams from "./pages/TeamPage/Teams";
import Transactions from "./pages/TransactionPage/Transactions";
import UserProfiles from "./pages/SettingsUIPages/UserProfiles";

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
            {/* Main Page */}
            <Route path="/" element={<Appointments />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/shops" element={<ShopSettings />} />

            {/* Leave Management Routes */}
            <Route path="/leave-management" element={<LeaveApplicationApproval />} />
            <Route path="/leave-application-approval" element={<LeaveApplicationApproval />} />
            <Route path="/barber-leave" element={<BarberLeaveManagement />} />

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
            <Route path="/settings/notifications" element={<Notifications />} />
            <Route path="/settings/expertise" element={<Expertise />} />
            <Route path="/settings/portfolio" element={<Portfolio />} />
            <Route path="/settings/testimonials" element={<Testimonials />} />

            {/* Other Routes */}
            <Route path="/ratings-reviews" element={<Testimonials />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ForgetPassword />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
