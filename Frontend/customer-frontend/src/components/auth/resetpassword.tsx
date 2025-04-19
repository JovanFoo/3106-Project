import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";

const API_URL = import.meta.env.VITE_API_URL;

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/auth/customers/forget-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(
          "Password reset link sent successfully. Redirecting back..."
        );
        setTimeout(() => navigate("/signin"), 3000); // redirect after 3 seconds
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.log(err);
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1); // go back to the previous page
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-md p-6 rounded-2xl shadow-xl border border-border bg-card dark:border-2 dark:border-gray-600">
        <h1 className="mb-6 text-3xl font-bold text-center dark:text-gray-200">
          Reset Password
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 mb-4">
            <Input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleChange}
            />
          </div>
          <div>
            {message && <p className="text-green-500 text-center">{message}</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}
          </div>

          <Button className="w-full" size="sm" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Button className="w-full" size="sm" onClick={handleBack}>
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}
