import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import ToggleSwitch from "../../components/ui/button/ToggleSwitch";
import SettingsSidebar from "../SettingsSidebar";

export default function Notifications() {
    return (
        <div className="flex min-h-screen">
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
                        Manage your notification settings to stay updated with important alerts.
                    </p>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-800 dark:text-white/90">Email Notifications</span>
                            <ToggleSwitch defaultChecked={true} />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-800 dark:text-white/90">SMS Notifications</span>
                            <ToggleSwitch defaultChecked={false} />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-800 dark:text-white/90">Push Notifications</span>
                            <ToggleSwitch defaultChecked={true} />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-800 dark:text-white/90">Marketing Emails</span>
                            <ToggleSwitch defaultChecked={false} />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-6 lg:justify-end">
                        <Button size="sm" variant="outline">
                            Cancel
                        </Button>
                        <Button size="sm">
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}