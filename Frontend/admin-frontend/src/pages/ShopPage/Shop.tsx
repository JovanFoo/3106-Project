import type { AxiosResponse } from "axios";
import axios from "axios";
import { useEffect, useState } from "react";
import "react-clock/dist/Clock.css";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import { toast, ToastContainer } from "react-toastify";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Select from "../../components/form/Select";
import { TrashBinIcon } from "../../icons";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

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
  const [editingShopId, setEditingShopId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [shopToDelete, setShopToDelete] = useState<string | null>(null);
  const [selectedStylists, setSelectedStylists] = useState<Stylist[]>([]);
  const [allStylists, setAllStylists] = useState<Stylist[]>([]);
  const [manager, setManager] = useState<Stylist | null>(null);
  const [updatedManager, setUpdatedManager] = useState<Stylist | null>(null);
  const [addedStylist, setAddedStylist] = useState<Stylist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const config = {
    headers: {
      Authorization: sessionStorage.getItem("token"),
    },
  };

  type Stylist = {
    _id: string;
    name: string;
    stylists?: Stylist[];
  };
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
    manager?: Stylist;
    stylists?: Stylist[];
  };

  const fetchShops = async () => {
    //   console.log("Fetching shops...");
    try {
      const response = await axios.get(`${api_address}/api/branches`, config);
      setShops(response.data);
      // console.log("Shops fetched:", response.data);
    } catch (error) {
      console.error("Error fetching shops:", error);
    }
  };
  const fetchStylists = async () => {
    try {
      const response = await axios.get(`${api_address}/api/stylists`, config);
      setAllStylists(response.data);
    } catch (error) {
      console.error("Error fetching stylists:", error);
    }
  };
  useEffect(() => {
    if (isLoading) {
      // console.log("Loading...");
      return;
    } // Prevent multiple fetches
    fetchStylists();
    fetchShops();
  }, [isLoading]);

  const handleCreateShop = async () => {
    setIsLoading(true);
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
    try {
      let response: AxiosResponse<Shop>;
      if (editingShopId) {
        response = await axios.put(
          `${api_address}/api/branches/${editingShopId}`,
          newShop,
          config
        );
        // setShops((prev) =>
        //   prev.map((shop) =>
        //     shop._id === editingShopId ? response.data : shop
        //   )
        // );
        toast.success("Shop updated successfully.");
        setIsLoading(false);
      } else {
        response = await axios.post(
          `${api_address}/api/branches`,
          newShop,
          config
        );
        setShops((prev) => [...prev, response.data]);
        toast.success("Shop created successfully.");
      }

      resetForm();
      closeModal();
    } catch (error: any) {
      console.error("Error creating/updating shop:", error);
      toast.error("Something went wrong.");
    }
  };

  const confirmDeleteShop = (id: string) => {
    setShopToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteShop = async () => {
    if (!shopToDelete) return;
    setIsLoading(true);

    try {
      await axios.delete(`${api_address}/api/branches/${shopToDelete}`, config);
      setShops((prev) => prev.filter((shop) => shop._id !== shopToDelete));
      toast.success("Shop deleted successfully.");
      setIsLoading(false);
    } catch (error: any) {
      console.error("Error deleting shop:", error);
      toast.error("Failed to delete shop.");
    }

    closeModal();
    setShopToDelete(null);
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
    setSelectedStylists([]);
    setManager(null);
    setEditingShopId(null);
    setUpdatedManager(null);
    setAddedStylist(null);
  };

  const handleEdit = async (shop: any) => {
    try {
      const response = await axios.get(
        `${api_address}/api/branches/${shop._id}`,
        config
      );
      const updatedShop = response.data;

      setEditingShopId(updatedShop._id);
      setLocation(updatedShop.location);
      setPhoneNumber(updatedShop.phoneNumber);
      setWeekdayOpeningTime(updatedShop.weekdayOpeningTime);
      setWeekdayClosingTime(updatedShop.weekdayClosingTime);
      setWeekendOpeningTime(updatedShop.weekendOpeningTime);
      setWeekendClosingTime(updatedShop.weekendClosingTime);
      setHolidayOpeningTime(updatedShop.holidayOpeningTime);
      setHolidayClosingTime(updatedShop.holidayClosingTime);

      // Make sure to set stylists and manager from latest data
      setSelectedStylists(updatedShop.stylists || []);
      setManager(updatedShop.manager || null);

      openModal();
    } catch (err) {
      console.error("Error loading shop data:", err);
      toast.error("Failed to load shop data.");
    }
  };

  const handleChangeManager = async (stylistId: string) => {
    setIsLoading(true);
    closeModal();
    await axios
      .put(
        `${api_address}/api/branches/assign/manager/${editingShopId}`,
        { stylistId: stylistId },
        config
      )
      .then(() => {
        toast.success("Manager updated successfully.");
        setIsLoading(false);
        fetchShops();
      })
      .catch((error) => {
        console.error("Error updating manager:", error);
        toast.error("Failed to update manager.");
      });
  };
  const handleAddStylist = async (stylistId: string) => {
    setIsLoading(true);
    await axios
      .put(
        `${api_address}/api/branches/add/stylist/${editingShopId}`,
        { stylistId: stylistId },
        config
      )
      .then((response) => {
        const updatedShop = response.data;
        console.log("Updated shop:", updatedShop);
        setManager(updatedShop.manager);
        setSelectedStylists(updatedShop.stylists || []);
        toast.success("Added stylist successfully.");
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error adding stylist:", error);
        toast.error("Failed to add stylist.");
      });
  };

  // to format time to 24hr
  const formatTime = (time: string): string => {
    const date = new Date(`1970-01-01T${time}`);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const timeFields: [
    string,
    string,
    React.Dispatch<React.SetStateAction<string>>
  ][] = [
    ["Weekday Opening", weekdayOpeningTime, setWeekdayOpeningTime],
    ["Weekday Closing", weekdayClosingTime, setWeekdayClosingTime],
    ["Weekend Opening", weekendOpeningTime, setWeekendOpeningTime],
    ["Weekend Closing", weekendClosingTime, setWeekendClosingTime],
    ["Holiday Opening", holidayOpeningTime, setHolidayOpeningTime],
    ["Holiday Closing", holidayClosingTime, setHolidayClosingTime],
  ];

  const handleRemoveStylist = async (stylistId: string) => {
    if (!editingShopId || !manager?._id) return;
    setIsLoading(true);
    try {
      await axios.put(
        `${api_address}/api/branches/remove/${editingShopId}`,
        {
          stylistManagerId: manager._id,
          stylistId: stylistId,
        },
        config
      );

      setSelectedStylists((prev) =>
        prev.filter((stylist) => stylist._id !== stylistId)
      );
      setIsLoading(false);

      toast.success("Stylist removed successfully.");
    } catch (error: any) {
      console.error("Error removing stylist:", error);
      toast.error("Failed to remove stylist.");
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-5">
        <PageMeta title="Shops" description="Manage Shops" />
        <PageBreadcrumb pageTitle="Shops" />

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:text-white/90">
              All Shops
            </h3>
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
                <h5 className="font-semibold text-md mb-1 dark:text-white">
                  {shop.location}
                </h5>
                <p className="text-sm text-gray-500 mb-1 dark:text-white">
                  📞 {shop.phoneNumber}
                </p>
                <p className="text-sm text-gray-500 mb-1 dark:text-white">
                  Weekday: {formatTime(shop.weekdayOpeningTime)} -{" "}
                  {formatTime(shop.weekdayClosingTime)}
                </p>
                <p className="text-sm text-gray-500 mb-1 dark:text-white">
                  Weekend: {formatTime(shop.weekendOpeningTime)} -{" "}
                  {formatTime(shop.weekendClosingTime)}
                </p>
                <p className="text-sm text-gray-500 dark:text-white">
                  Holiday: {formatTime(shop.holidayOpeningTime)} -{" "}
                  {formatTime(shop.holidayClosingTime)}
                </p>

                <p className="text-sm text-gray-500 dark:text-white">
                  <strong>Manager:</strong> {shop.manager?.name || "None"}
                </p>
                <p className="text-sm text-gray-500 dark:text-white">
                  <strong>Stylists:</strong>{" "}
                  {shop.stylists
                    ?.filter((s: Stylist) => s._id !== shop.manager?._id)
                    .map((s: Stylist) => s.name)
                    .join(", ") || "None"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[700px] p-6"
        >
          <div className="flex flex-col px-2">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
              {editingShopId ? "Edit Shop" : "Create New Shop"}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:text-white"
                  placeholder="e.g. 123 Katong Ave"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                {/* <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  maxLength={8}
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g. 61234567"
                /> */}
                {/* Stricter control */}
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow digits and max 8 characters
                    if (/^\d{0,8}$/.test(value)) {
                      setPhoneNumber(value);
                    }
                  }}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:text-white"
                  placeholder="e.g. 61234567"
                />
              </div>
              {timeFields.map(([label, value, setter]) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  <TimePicker
                    onChange={(val: string | null) => setter(val || "")}
                    value={value}
                    format="HH:mm"
                    disableClock
                    clearIcon={null}
                    className="custom-time-input w-full"
                  />
                </div>
              ))}
            </div>

            <div className="mt-3 space-y-1">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Team
              </h4>
              {manager && (
                <div className="rounded-xl border border-gray-500 p-4 dark:border-gray-700 w-full">
                  {/* Manager Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* <div className="mb-4 col-span-1">
                      <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                        👑 Manager
                      </h4>
                      <div className="flex items-center border border-gray-400 rounded-md p-2 dark:border-gray-600 dark:bg-gray-800 w-full">
                        <span className="text-gray-700 dark:text-white">
                          {manager.name}
                        </span>
                      </div>
                    </div> */}
                    {/* Change Manager Button */}
                    <div className="mb-5 col-span-1">
                      <h5 className="font-medium text-gray-800 dark:text-white mb-2">
                        👑 Manager
                      </h5>
                      <Select
                        options={selectedStylists.map((stylist) => ({
                          value: stylist._id,
                          label: stylist.name,
                        }))}
                        defaultValue={manager._id}
                        onChange={(e) => {
                          console.log("Selected stylist ID:", e);
                          const selectedId = e;
                          const selectedStylist = selectedStylists.find(
                            (stylist) => stylist._id === selectedId
                          );
                          if (selectedStylist) {
                            setUpdatedManager(selectedStylist);
                          }
                        }}
                      />
                      {/* <Button
                        className="mt-2 w-full"
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          handleChangeManager(updatedManager?._id || "");
                        }}
                      >
                        Change Manager
                      </Button> */}
                    </div>
                  </div>
                  {/* Stylists */}
                  <div>
                    <h5 className="font-medium text-gray-800 dark:text-white mb-2 ">
                      ✂️ Stylists (
                      {
                        selectedStylists.filter((s) => s._id !== manager._id)
                          .length
                      }
                      )
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-[100px] overflow-y-auto mb-5">
                      {selectedStylists
                        .filter((stylist) => stylist._id !== manager._id) // <-- this line filters out manager
                        .map((stylist) => (
                          <div
                            key={stylist._id}
                            className="h-fit flex justify-between items-center border border-gray-400  rounded-md p-1 dark:border-gray-600 dark:bg-gray-800"
                          >
                            <span className="text-gray-700 dark:text-white ml-3">
                              {stylist.name}
                            </span>
                            <Button
                              className="p-0"
                              size="sm"
                              type="danger"
                              onClick={() => handleRemoveStylist(stylist._id)}
                            >
                              <TrashBinIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    <div className="col-span-3">
                      {" "}
                      <h5 className="font-medium text-gray-800 dark:text-white ">
                        ➕ Add stylist
                      </h5>
                    </div>
                    {/* Add stylist Button */}
                    <div className=" col-span-1">
                      <Select
                        options={allStylists
                          .filter((stylist) => stylist._id !== manager?._id)
                          .filter((stylist) => stylist.stylists?.length === 0) // Filter out stylists already in the shop
                          .filter(
                            (stylist) =>
                              !selectedStylists.some(
                                (s) => s._id === stylist._id
                              )
                          )
                          .map((stylist) => ({
                            value: stylist._id,
                            label: stylist.name,
                          }))}
                        onChange={(e) => {
                          const selectedId = e;
                          const selectedStylist = allStylists.find(
                            (stylist) => stylist._id === selectedId
                          );
                          console.log("Selected stylist ID:", selectedStylist);
                          if (selectedStylist) {
                            setAddedStylist(selectedStylist);
                          }
                        }}
                      />
                    </div>
                    <div className=" col-span-1">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          handleAddStylist(addedStylist?._id || "");
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between gap-3">
              <div className="flex justify-end gap-3 mt-6 mb-2">
                {editingShopId && (
                  <Button
                    size="sm"
                    type="danger"
                    onClick={() => {
                      confirmDeleteShop(editingShopId);
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-6 mb-2">
                <Button
                  onClick={() => {
                    closeModal();
                    resetForm();
                  }}
                  size="sm"
                  type="neutral"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    if (updatedManager) {
                      console.log("Updated manager:", updatedManager);
                      handleChangeManager(updatedManager?._id || "");
                    }
                    handleCreateShop();
                  }}
                >
                  {editingShopId ? "Update Shop" : "Create Shop"}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          className="max-w-md p-6"
        >
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Delete
            </h4>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this shop? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                size="sm"
                type="neutral"
              >
                Cancel
              </Button>
              <Button size="sm" type="danger" onClick={handleDeleteShop}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        className={"z-999999"}
      />
    </div>
  );
}
