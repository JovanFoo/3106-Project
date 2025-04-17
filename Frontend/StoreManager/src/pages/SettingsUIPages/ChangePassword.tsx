import axios, { AxiosResponse } from "axios";
import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Alert from "../../components/ui/alert/Alert";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import SettingsSidebar from "../SettingsPage/SettingsSidebar";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_PROD;
// const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

export default function ChangePassword() {
  const config = {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
      Authorization: sessionStorage.getItem("token"),
    },
  };
  const { isOpen, openModal, closeModal } = useModal();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [variant, setVariant] = useState<
    "success" | "error" | "warning" | "info"
  >("success");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Handle password change logic here
    console.log("Changing password...");
    closeModal();
    if (newPassword !== confirmNewPassword) {
      setShowAlert(true);
      setVariant("error");
      setTitle("Error");
      setMessage("Passwords do not match.");
      return;
    } else if (newPassword.length < 8) {
      setShowAlert(true);
      setVariant("error");
      setTitle("Error");
      setMessage("Password must be at least 8 characters long.");
      return;
    } else if (newPassword === currentPassword) {
      setShowAlert(true);
      setVariant("error");
      setTitle("Error");
      setMessage("New password cannot be the same as the current password.");
      return;
    } else if (newPassword === "") {
      setShowAlert(true);
      setVariant("error");
      setTitle("Error");
      setMessage("Please enter a new password.");
      return;
    }
    setVariant("info");
    setTitle("Updating Password");
    setMessage("Please wait...");
    setShowAlert(true);
    setIsUpdating(true);
    await axios
      .put(
        `${api_address}/api/auth/stylists/update-password`,
        {
          currentPassword: currentPassword,
          newPassword: newPassword,
        },
        config
      )
      .then((response: AxiosResponse) => {
        console.log(response.data);
        setVariant("success");
        setTitle("Success");
        setMessage("Password changed successfully.");
        setShowAlert(true);
        setConfirmNewPassword("");
        setCurrentPassword("");
        setNewPassword("");
        setIsUpdating(false);
      })
      .catch((error) => {
        console.log(error);
        setVariant("error");
        setTitle("Error");
        setMessage(error.response.data.message);
        setShowAlert(true);
        setIsUpdating(false);
      });
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  return (
    <div className="flex ">
      {/* Settings-specific Sidebar */}
      <SettingsSidebar />
      {/* Main Content */}
      <div className="flex-1 p-5  min-h-[80vh]">
        <PageBreadcrumb pageTitle="Change Password" />
        <div className="rounded-2xl  min-h-[80vh] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className={showAlert ? "mb-5" : "hidden"}>
            <Alert title={title} message={message} variant={variant} />
          </div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                Change Password
              </h4>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ensure your account is secure by updating your password
                regularly.
              </p>
            </div>
            <Button onClick={openModal} disabled={isUpdating}>
              Change Password
            </Button>
          </div>

          <Modal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-[500px] m-4"
          >
            <div className="relative w-full max-w-[500px] rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Update Password
              </h4>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                Enter your current password and set a new one.
              </p>

              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => handleSave(e)}
              >
                <div>
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div>
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-3 mt-4 lg:justify-end">
                  <Button size="sm" type='neutral' onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button size="sm">Save Changes</Button>
                </div>
              </form>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}
