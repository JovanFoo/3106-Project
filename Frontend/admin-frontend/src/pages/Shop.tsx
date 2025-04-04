import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import Alert from "../components/ui/alert/Alert";
import Button from "../components/ui/button/Button";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";

export default function CreateShop() {
    const { isOpen, openModal, closeModal } = useModal();
    const [location, setLocation] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [weekdayOpeningTime, setWeekdayOpeningTime] = useState("");
    const [weekdayClosingTime, setWeekdayClosingTime] = useState("");
    const [weekendOpeningTime, setWeekendOpeningTime] = useState("");
    const [weekendClosingTime, setWeekendClosingTime] = useState("");
    const [holidayOpeningTime, setHolidayOpeningTime] = useState("");
    const [holidayClosingTime, setHolidayClosingTime] = useState("");
    const [shops, setShops] = useState<any[]>([]);
    const [showAlert, setShowAlert] = useState(false);
    const [variant, setVariant] = useState<"success" | "error" | "warning" | "info">("info");
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [editingShopId, setEditingShopId] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [shopToDelete, setShopToDelete] = useState<string | null>(null);


    useEffect(() => {
        const dummyShops = [
            {
                _id: "1",
                location: "123 Katong Ave",
                phoneNumber: "61234567",
                weekdayOpeningTime: "09:00",
                weekdayClosingTime: "18:00",
                weekendOpeningTime: "10:00",
                weekendClosingTime: "16:00",
                holidayOpeningTime: "10:00",
                holidayClosingTime: "14:00",
            },
        ];
        setShops(dummyShops);
    }, []);

    const handleCreateShop = () => {
        const newShop = {
            _id: editingShopId || Date.now().toString(),
            location,
            phoneNumber,
            weekdayOpeningTime,
            weekdayClosingTime,
            weekendOpeningTime,
            weekendClosingTime,
            holidayOpeningTime,
            holidayClosingTime,
        };

        if (editingShopId) {
            setShops((prev) =>
                prev.map((shop) => (shop._id === editingShopId ? newShop : shop))
            );
            setTitle("Updated");
            setMessage("Shop updated successfully.");
            setTimeout(() => {
                setShowAlert(false);
            }, 3000);
        } else {
            setShops((prev) => [...prev, newShop]);
            setTitle("Success");
            setMessage("Shop created successfully.");
            setTimeout(() => {
                setShowAlert(false);
            }, 3000);
        }

        setShowAlert(true);
        setVariant("success");
        resetForm();
        closeModal();
    };


    const confirmDeleteShop = (id: string) => {
        setShopToDelete(id);
        setShowDeleteConfirm(true);
    };

    const handleDeleteShop = () => {
        if (shopToDelete) {
            setShops((prev) => prev.filter((shop) => shop._id !== shopToDelete));
            setShowAlert(true);
            setVariant("success");
            setTitle("Deleted");
            setMessage("Shop deleted successfully.");
            setShopToDelete(null);
        }
        setShowDeleteConfirm(false);
    };


    const resetForm = () => {
        setLocation("");
        setPhoneNumber("");
        setWeekdayOpeningTime("");
        setWeekdayClosingTime("");
        setWeekendOpeningTime("");
        setWeekendClosingTime("");
        setHolidayOpeningTime("");
        setHolidayClosingTime("");
        setEditingShopId(null);
    };

    const handleEdit = (shop: any) => {
        setEditingShopId(shop._id);
        setLocation(shop.location);
        setPhoneNumber(shop.phoneNumber);
        setWeekdayOpeningTime(shop.weekdayOpeningTime);
        setWeekdayClosingTime(shop.weekdayClosingTime);
        setWeekendOpeningTime(shop.weekendOpeningTime);
        setWeekendClosingTime(shop.weekendClosingTime);
        setHolidayOpeningTime(shop.holidayOpeningTime);
        setHolidayClosingTime(shop.holidayClosingTime);
        openModal();
    };

    return (
        <div className="flex min-h-screen">
            <div className="flex-1 p-5">
                <PageBreadcrumb pageTitle="Shops" />

                {showAlert && (
                    <div className="mb-5">
                        <Alert variant={variant} title={title} message={message} />
                    </div>
                )}

                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:text-white/90">All Shops</h3>
                        <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                                resetForm(); // Clear all fields
                                openModal(); // Open the modal in "create" mode
                            }}
                        >
                            Add Shop +
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {shops.map((shop) => (
                            <div
                                key={shop._id}
                                className="p-4 border rounded-lg shadow-sm hover:cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                onClick={() => handleEdit(shop)}
                            >
                                <h5 className="font-semibold text-md mb-1 dark:text-white">{shop.location}</h5>
                                <p className="text-sm text-gray-500 mb-1 dark:text-white">📞 {shop.phoneNumber}</p>
                                <p className="text-sm text-gray-500 mb-1 dark:text-white">Weekday: {shop.weekdayOpeningTime} - {shop.weekdayClosingTime}</p>
                                <p className="text-sm text-gray-500 mb-1 dark:text-white">Weekend: {shop.weekendOpeningTime} - {shop.weekendClosingTime}</p>
                                <p className="text-sm text-gray-500 dark:text-white">Holiday: {shop.holidayOpeningTime} - {shop.holidayClosingTime}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] p-6">
                    <div className="flex flex-col px-2">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                            {editingShopId ? "Edit Shop" : "Create New Shop"}
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="e.g. 123 Katong Ave"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="e.g. 61234567"
                                />
                            </div>
                            {[
                                ["Weekday Opening", weekdayOpeningTime, setWeekdayOpeningTime],
                                ["Weekday Closing", weekdayClosingTime, setWeekdayClosingTime],
                                ["Weekend Opening", weekendOpeningTime, setWeekendOpeningTime],
                                ["Weekend Closing", weekendClosingTime, setWeekendClosingTime],
                                ["Holiday Opening", holidayOpeningTime, setHolidayOpeningTime],
                                ["Holiday Closing", holidayClosingTime, setHolidayClosingTime],
                            ].map(([label, value, setter]) => (
                                <div key={label as string}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                                    <input
                                        type="time"
                                        value={value as string}
                                        onChange={(e) => setter(e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                        step="60"
                                    />
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex justify-between gap-3">
                        <div className="flex justify-end gap-3 mt-6">
                        {editingShopId && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        type="danger"
                                        onClick={() => confirmDeleteShop(editingShopId)}
                                    >
                                        Delete
                                    </Button>
                                )}
                        </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        closeModal();
                                        resetForm();
                                    }}
                                    className="rounded-lg border px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                >
                                    Cancel
                                </button>
                                <Button size="sm" variant="primary" onClick={handleCreateShop}>
                                    {editingShopId ? "Update Shop" : "Create Shop"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Modal>
                <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} className="max-w-md p-6">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h4>
                        <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this shop? This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="rounded-lg border px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <Button size="sm" variant="outline" type="danger" onClick={handleDeleteShop}>
                                Delete
                            </Button>
                        </div>
                    </div>
        </Modal>
            </div>
        </div>
    );
}