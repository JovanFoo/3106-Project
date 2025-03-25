import { Route, BrowserRouter as Router, Routes } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AppLayout from "./layout/AppLayout";
import Analytics from "./pages/Analytics";
import Appointments from "./pages/Appointments";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ForgetPassword from "./pages/AuthPages/ForgetPassword";
import Blank from "./pages/Blank";
import Calendar from "./pages/Calendar";
import BarChart from "./pages/Charts/BarChart";
import LineChart from "./pages/Charts/LineChart";
import Home from "./pages/Dashboard/Home";
import NotFound from "./pages/OtherPage/NotFound";
import Settings from "./pages/Settings";
import ChangePassword from "./pages/Settings/ChangePassword";
import Expertise from "./pages/Settings/Expertise";
import Notifications from "./pages/Settings/Notifications";
import Portfolio from "./pages/Settings/Portfolio";
import Testimonials from "./pages/Settings/Testimonials";
import ShopSettings from "./pages/ShopSettings";
import Teams from "./pages/Teams";
import Transactions from "./pages/Transactions";
import Alerts from "./pages/UiElements/Alerts";
import Avatars from "./pages/UiElements/Avatars";
import Badges from "./pages/UiElements/Badges";
import Buttons from "./pages/UiElements/Buttons";
import Images from "./pages/UiElements/Images";
import Videos from "./pages/UiElements/Videos";
import UserProfiles from "./pages/UserProfiles";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Main Page */}
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/shopSettings" element={<ShopSettings />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/blank" element={<Blank />} />

            {/* Settings */}
              
              <Route path="/settings/profile" element={<UserProfiles />} />
              <Route path="/settings/change-password" element={<ChangePassword />} />
              <Route path="/settings/notifications" element={<Notifications />} />
              <Route path="/settings/expertise" element={<Expertise />} />
              <Route path="/settings/portfolio" element={<Portfolio />} />
              <Route path="/settings/testimonials" element={<Testimonials />} />


            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forget-password" element={<ForgetPassword />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
