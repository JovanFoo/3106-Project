import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Alert from "../../components/ui/alert/Alert";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { useUser } from "../../context/UserContext";
import { Navigate } from "react-router-dom";

// const api_address = import.meta.env.VITE_APP_API_ADDRESS_PROD;
const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

const openingHours = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
  "09:00 PM",
];

type Shop = {
  _id: string;
  location: string;
  phoneNumber: string;
  weekdayOpeningTime: string;
  weekdayClosingTime: string;
  weekendOpeningTime: string;
  weekendClosingTime: string;
  holidayOpeningTime: string;
  holidayClosingTime: string;
};

export default function ShopSettings() {
  const user = useUser();
  const { isOpen, openModal, closeModal } = useModal();
  const config = {
    headers: {
      Authorization: sessionStorage.getItem("token"),
    },
  };

  const [shopData, setShopData] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [variant, setVariant] = useState<
    "success" | "error" | "warning" | "info"
  >("error");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stylistId = sessionStorage.getItem("stylistId");
    if (!stylistId || isLoading) return;

    const fetchShop = async () => {
      try {
        setIsLoading(true);
        const res: AxiosResponse = await axios.get(
          `${api_address}/api/branches/shops`,
          config
        );
        if (res.status === 200 && res.data) {
          if (Array.isArray(res.data) && res.data.length > 0) {
            setShopData(res.data[0]); // just pick the first shop
          } else {
            setShopData(null);
          }
          setShowAlert(false);
        }
      } catch (err) {
        setShowAlert(true);
        setVariant("error");
        setTitle("Error");
        setMessage("Failed to fetch shop data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchShop();
  }, []);

  const handleOpenModal = () => {
    openModal();
  };

  const handleSave = async () => {
    try {
      if (!shopData?._id) return;
      const updated = { ...shopData };
      await axios.put(
        `${api_address}/api/branches/${updated._id}`,
        updated,
        config
      );
      setShopData(updated);
      closeModal();
      setVariant("success");
      setTitle("Success");
      setMessage("Shop details updated.");
      setShowAlert(true);
    } catch (err) {
      setVariant("error");
      setTitle("Error");
      setMessage("Failed to update shop.");
      setShowAlert(true);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-5">
        <PageMeta
          title="Shop Settings"
          description="Stylist's assigned shop details"
        />
        <PageBreadcrumb pageTitle="Shop Settings" />

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
            My Assigned Shop
          </h3>
          <div className={showAlert ? "mb-5" : "mb-5 hidden"}>
            <Alert variant={variant} title={title} message={message} />
          </div>

          {shopData ? (
            <div className="relative p-4 border rounded-md mb-4 dark:bg-gray-800 dark:border-gray-700 dark:text-white/90">
              <p>
                <strong>Location:</strong> {shopData.location}
              </p>
              <p>
                <strong>Phone:</strong> {shopData.phoneNumber}
              </p>
              <p>
                <strong>WeekdayOpeningTime:</strong>{" "}
                {shopData.weekdayOpeningTime}
              </p>
              <p>
                <strong>WeekdayClosingTime:</strong>{" "}
                {shopData.weekdayClosingTime}
              </p>
              <p>
                <strong>WeekendOpeningTime:</strong>{" "}
                {shopData.weekendOpeningTime}
              </p>
              <p>
                <strong>WeekendClosingTime:</strong>{" "}
                {shopData.weekendClosingTime}
              </p>
              <p>
                <strong>Public Holiday Opening Time:</strong>{" "}
                {shopData.holidayOpeningTime}
              </p>
              <p>
                <strong>Public Holiday Closing Time:</strong>{" "}
                {shopData.holidayClosingTime}
              </p>
              <div className="absolute bottom-2 right-2">
                <Button size="sm" variant="primary" onClick={handleOpenModal}>
                  Edit
                </Button>
              </div>
            </div>
          ) : (
            <p>No shop assigned to you.</p>
          )}
        </div>

        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[600px] p-6"
        >
          {shopData && (
            <div className="flex flex-col px-2 overflow-y-auto">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                Edit Shop
              </h4>
              <div className="grid grid-cols-1 gap-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Location
                  </label>
                  <input
                    type="text"
                    value={shopData.location}
                    onChange={(e) =>
                      setShopData({ ...shopData, location: e.target.value })
                    }
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white/90"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={shopData.phoneNumber}
                    onChange={(e) =>
                      setShopData({ ...shopData, phoneNumber: e.target.value })
                    }
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white/90"
                  />
                </div>
                {["weekday", "weekend", "holiday"].map((key) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 capitalize">
                      {key} hours
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={
                          shopData[`${key}OpeningTime` as keyof Shop] as string
                        }
                        onChange={(e) =>
                          setShopData({
                            ...shopData,
                            [`${key}OpeningTime`]: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white/90"
                      >
                        {openingHours.map((hour) => (
                          <option key={hour} value={hour}>
                            {hour}
                          </option>
                        ))}
                      </select>
                      <select
                        value={
                          shopData[`${key}ClosingTime` as keyof Shop] as string
                        }
                        onChange={(e) =>
                          setShopData({
                            ...shopData,
                            [`${key}ClosingTime`]: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white/90"
                      >
                        {openingHours.map((hour) => (
                          <option key={hour} value={hour}>
                            {hour}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-6">
                <Button
                  className="button"
                  variant="primary"
                  onClick={handleSave}
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
