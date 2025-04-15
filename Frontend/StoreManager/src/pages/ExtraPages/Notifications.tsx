import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import ToggleSwitch from "../../components/ui/button/ToggleSwitch";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import SettingsSidebar from "../SettingsPage/SettingsSidebar";

export default function Notifications() {
  const [preferences, setPreferences] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
  });
  const { isOpen, openModal, closeModal } = useModal();

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex min-h-4/5-screen">
      {/* Settings-specific Sidebar */}
      <SettingsSidebar />
      {/* Main Content */}
      <div className="flex-1 p-5">
        <PageBreadcrumb pageTitle="Notifications" />
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Notification Preferences
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Manage your notification settings to stay updated with important
            alerts.
          </p>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                Email Notifications
              </span>
              <ToggleSwitch disabled />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                SMS Notifications
              </span>
              <ToggleSwitch disabled />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                Push Notifications
              </span>
              <ToggleSwitch disabled />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                Marketing Emails
              </span>
              <ToggleSwitch disabled />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 lg:justify-end">
            <Button size="sm" onClick={openModal}>
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Modal for Editing Preferences */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] p-6">
        <div className="flex flex-col px-2 overflow-y-auto">
          <h4 className="text-lg text-white font-semibold mb-4">
            Edit Notification Preferences
          </h4>
          <div className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                Email Notifications
              </span>
              <ToggleSwitch
                checked={preferences.email}
                onChange={() => togglePreference("email")}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                SMS Notifications
              </span>
              <ToggleSwitch
                checked={preferences.sms}
                onChange={() => togglePreference("sms")}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                Push Notifications
              </span>
              <ToggleSwitch
                checked={preferences.push}
                onChange={() => togglePreference("push")}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                Marketing Emails
              </span>
              <ToggleSwitch
                checked={preferences.marketing}
                onChange={() => togglePreference("marketing")}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 sm:justify-end">
            <button
              onClick={closeModal}
              type="button"
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Close
            </button>
            <Button size="sm" variant="primary" onClick={closeModal}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
