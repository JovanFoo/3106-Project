import { useState } from "react";
import { Link } from "react-router";
import axios, { AxiosResponse } from "axios";
// import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
// import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useNavigate } from "react-router-dom";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_PROD;

export default function ForgetPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const handleForgetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      setError("Email are required");
      return;
    }
    const config = {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
      },
    };
    await axios
      .post(
        api_address + "/api/auth/admins/forget-password",
        {
          email,
        },
        config
      )
      .then((res: AxiosResponse) => {
        // console.log(res.data);
        if (res.status !== 200) {
          setError(res.data.message);
          return;
        }
        navigate("/signin");
      })
      .catch((err) => {
        // console.log(err);
        setError(err.message);
      });
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Forget Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email to reset your password!
            </p>
          </div>
          <div>
            <form onSubmit={handleForgetPassword}>
              {/* TODO: edit form */}
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder="Email Address"
                    name="email"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                  />
                </div>
                <div>
                  <Button className="w-full" size="sm">
                    Reset Password
                  </Button>
                </div>
              </div>
            </form>
            <div className="mt-1">
              <p className="text-sm font-normal text-center text-red-600 dark:text-red-400 sm:text-start">
                {error}
              </p>
            </div>
            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account?
                <Link
                  to="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
