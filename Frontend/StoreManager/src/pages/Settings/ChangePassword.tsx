import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import SettingsSidebar from "../SettingsSidebar";
import Alert from "../../components/ui/alert/Alert";
import { useState } from "react";
import axios, { AxiosResponse } from "axios";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_PROD;
// const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;
const config = {
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
    Authorization: sessionStorage.getItem("token"),
  },
};

export default function ChangePassword() {
  const { isOpen, openModal, closeModal } = useModal();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [variant, setVariant] = useState<
    "success" | "error" | "warning" | "info"
  >("success");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Handle password change logic here
    console.log("Changing password...");
    closeModal();
    if (newPassword !== confirmNewPassword) {
      setVariant("error");
      setTitle("Error");
      setMessage("Passwords do not match.");
      return;
    }
    await axios
      .post(
        `${api_address}/api/auth/change-password`,
        {
          currentPassword: "currentPassword",
          newPassword: "newPassword",
        },
        config
      )
      .then((response: AxiosResponse) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="flex min-h-screen">
      {/* Settings-specific Sidebar */}
      <SettingsSidebar />
      {/* Main Content */}
      <div className="flex-1 p-5">
        <PageBreadcrumb pageTitle="Change Password" />
        <div className="mb-5">
          <Alert title={title} message={message} variant={variant} />
        </div>
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
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
            <button
              onClick={openModal}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
            >
              Change Password
            </button>
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
                  <Button size="sm" variant="outline" onClick={closeModal}>
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
