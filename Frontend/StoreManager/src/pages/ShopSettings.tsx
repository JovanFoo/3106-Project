import { useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import Button from "../components/ui/button/Button";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";

const openingHours = ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM"];

export default function ShopSettings() {
    const { isOpen, openModal, closeModal } = useModal();
    const [shopData, setShopData] = useState([]);
    const [tempShopData, setTempShopData] = useState({
        location: "",
        phone: "",
        weekdayOpen: "08:00 AM",
        weekdayClose: "06:00 PM",
        weekendOpen: "09:00 AM",
        weekendClose: "05:00 PM",
        holidayOpen: "10:00 AM",
        holidayClose: "04:00 PM",
    });

    const handleOpenModal = (isEdit = false, index = null) => {
        if (!isEdit) {
            setTempShopData({
                location: "",
                phone: "",
                weekdayOpen: "08:00 AM",
                weekdayClose: "06:00 PM",
                weekendOpen: "09:00 AM",
                weekendClose: "05:00 PM",
                holidayOpen: "10:00 AM",
                holidayClose: "04:00 PM",
            });
        } else {
            setTempShopData(shopData[index]);
        }
        openModal();
    };

    const handleSave = () => {
        setShopData([...shopData, tempShopData]);
        closeModal();
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Shop Settings" />
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 w-full">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">Shop Settings</h4>
                    <Button size="sm" variant="primary" onClick={() => handleOpenModal(false)}>Add Shop</Button>
                </div>
                {shopData.length > 0 && shopData.map((shop, index) => (
                    <div key={index} className="relative p-4 border rounded-md mb-4">
                        <p><strong>Location:</strong> {shop.location}</p>
                        <p><strong>Phone:</strong> {shop.phone}</p>
                        <p><strong>Weekdays:</strong> {shop.weekdayOpen} - {shop.weekdayClose}</p>
                        <p><strong>Weekends:</strong> {shop.weekendOpen} - {shop.weekendClose}</p>
                        <p><strong>Public Holiday:</strong> {shop.holidayOpen} - {shop.holidayClose}</p>
                        <div className="absolute bottom-2 right-2">
                            <Button size="sm" variant="primary" onClick={() => handleOpenModal(true, index)}>Edit</Button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] p-6">
                <div className="flex flex-col px-2 overflow-y-auto">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Shop Settings</h4>
                    <div className="grid grid-cols-1 gap-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Location</label>
                            <input type="text" value={tempShopData.location} onChange={(e) => setTempShopData({ ...tempShopData, location: e.target.value })} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Phone</label>
                            <input type="text" value={tempShopData.phone} onChange={(e) => setTempShopData({ ...tempShopData, phone: e.target.value })} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Weekdays (Monday - Friday)</label>
                            <div className="flex gap-2">
                                <select value={tempShopData.weekdayOpen} onChange={(e) => setTempShopData({ ...tempShopData, weekdayOpen: e.target.value })} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                                    {openingHours.map(hour => <option key={hour} value={hour}>{hour}</option>)}
                                </select>
                                <select value={tempShopData.weekdayClose} onChange={(e) => setTempShopData({ ...tempShopData, weekdayClose: e.target.value })} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                                    {openingHours.map(hour => <option key={hour} value={hour}>{hour}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Weekends (Saturday - Sunday)</label>
                            <div className="flex gap-2">
                                <select value={tempShopData.weekendOpen} onChange={(e) => setTempShopData({ ...tempShopData, weekendOpen: e.target.value })} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                                    {openingHours.map(hour => <option key={hour} value={hour}>{hour}</option>)}
                                </select>
                                <select value={tempShopData.weekendClose} onChange={(e) => setTempShopData({ ...tempShopData, weekendClose: e.target.value })} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                                    {openingHours.map(hour => <option key={hour} value={hour}>{hour}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center mt-6">
                        <Button className="button" variant="primary" onClick={handleSave}>Save</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}