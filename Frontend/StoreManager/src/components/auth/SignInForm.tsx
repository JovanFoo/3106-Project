import { useEffect, useState } from "react";
import { Link } from "react-router";
import axios, { AxiosResponse } from "axios";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useNavigate } from "react-router-dom";
import Alert from "../ui/alert/Alert";
import { useUser } from "../../context/UserContext";
import { Modal } from "../ui/modal";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_PROD;
// const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [showAlert, setShowAlert] = useState(false);
  const [variant, setVariant] = useState<
    "success" | "error" | "warning" | "info"
  >("error");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const user = useUser();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (username === "" || password === "") {
      setVariant("error");
      setTitle("Error");
      setMessage("Please fill in all fields.");
      setShowAlert(true);
      return;
    }
    setIsLoading(true);
    await axios
      .post(`${api_address}/api/auth/stylists/login`, {
        username,
        password,
      })
      .then((res: AxiosResponse) => {
        user.setId(res.data.stylist._id);
        user.setUsername(res.data.stylist.username);
        user.setName(res.data.stylist.name);
        user.setEmail(res.data.stylist.email);
        user.setProfilePicture(res.data.stylist.profilePicture);
        user.setPhoneNumber(res.data.stylist.phoneNumber);
        user.setBio(res.data.stylist.bio);
        user.setRole(
          res.data.stylist.stylists.length > 0 ? "Manager" : "Stylist"
        );
        user.setStylists(res.data.stylist.stylists || []);
        user.setExpertises(res.data.stylist.expertises || []);
        user.setGalleries(res.data.stylist.galleries || []);
        user.setAppointments(res.data.stylist.appointments || []);
        user.saveUserContext(
          res.data.stylist._id,
          res.data.stylist.username,
          res.data.stylist.name,
          res.data.stylist.email,
          res.data.stylist.profilePicture || "/images/user/owner.jpg",
          res.data.stylist.phoneNumber || "Phone number has not been set yet.",
          res.data.stylist.bio || "Bio has not been set yet.",
          res.data.stylist.stylists.length > 0 ? "Manager" : "Stylist",
          res.data.stylist.stylists || [],
          res.data.stylist.expertises || [],
          res.data.stylist.galleries || [],
          res.data.stylist.appointments || []
        );
        sessionStorage.setItem("stylistId", res.data.stylist._id);
        sessionStorage.setItem("token", res.data.tokens.token);
        sessionStorage.setItem("refreshToken", res.data.tokens.refreshToken);
        navigate("/");
        setIsLoading(false);
      })
      .catch((err) => {
        setVariant("error");
        setTitle("Error");
        setMessage("Invalid credentials.");
        setShowAlert(true);
        setIsLoading(false);
      });
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            <form onSubmit={handleSignIn}>
              {/* TODO: edit form */}
              <div className="space-y-6">
                <div>
                  <Label>
                    Username <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder="username"
                    name="username"
                    type="text"
                    onChange={(e) => setUsername(e.target.value)}
                    value={username}
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      name="password"
                      onChange={(e) => setPassword(e.target.value)}
                      value={password}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div>
                  <Button className="w-full" size="sm">
                    Sign in
                  </Button>
                </div>
              </div>
            </form>
            <div className={showAlert ? " mt-5" : "mt-5 hidden"}>
              <Alert variant={variant} title={title} message={message} />
            </div>
            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account? {""}
                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isLoading}
        onClose={() => {}}
        showCloseButton={false}
        isFullscreen={true}
        className="bg-black dark:bg-gray-900 opacity-50 z-10 justify-center items-center"
      >
        <div className="w-full h-full flex flex-col justify-center items-center">
          <div className="text-white text-2xl font-semibold mb-4">
            Signing in...
          </div>
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
          <div className="text-white text-center mt-2">Loading...</div>
        </div>
      </Modal>
    </div>
  );
}
