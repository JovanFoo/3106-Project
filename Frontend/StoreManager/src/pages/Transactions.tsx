import axios from "axios";
import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import Button from "../components/ui/button/Button";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import { set } from "date-fns";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

type Transaction = {
  id: string;
  bookingId: string;
  service: string;
  stylist: string;
  stylistName: string;
  paymentMethod: "Cash" | "Card";
  amount: number;
  status: "Pending" | "Completed" | "Cancelled" | "Confirmed";
};

type Stylist = {
  _id: string;
  name: string;
};

// const services = ["Haircut", "Beard Trim", "Shave", "Hair Coloring"];
// const paymentMethods = ["Cash", "Card"];
// const statuses = ["Pending", "Completed", "Cancelled"];
type Service = {
  _id: string;
  name: string;
  duration: number;
  description: string;
  serviceRates: ServiceRate[];
  expertiseRequired: string[];
};
type ServiceRate = {
  _id: string;
  name: string;
  rate: number;
  startDate: Date;
  endDate: Date;
};
export default function Transactions() {
  const config = {
    headers: {
      Authorization: sessionStorage.getItem("token"),
    },
  };
  const [services, setServices] = useState<Service[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);

  const {
    isOpen: isOpenEdit,
    openModal: openModalEdit,
    closeModal: closeModalEdit,
  } = useModal();
  const {
    isOpen: isOpenNew,
    openModal: openModalNew,
    closeModal: closeModalNew,
  } = useModal();

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction>();
  const [newTransaction, setNewTransaction] = useState<Transaction>();

  useEffect(() => {
    setNewTransaction({
      id: "",
      bookingId: "",
      service: services[0]?.name || "",
      stylist: "",
      stylistName: "string",
      paymentMethod: "Cash",
      amount: 0,
      status: "Pending",
    });
  }, []);

  // const [transactionData, setTransactionData] = useState<Transaction>({
  //   id: "",
  //   bookingId: "",
  //   service: services[0],
  //   stylist: "",
  //   stylistName: "string",
  //   paymentMethod: paymentMethods[0],
  //   amount: "",
  //   status: statuses[0],
  // });

  useEffect(() => {
    fetchAllServices();
    fetchTransactions();
    fetchStylists();
  }, []);

  const fetchAllServices = async () => {
    await axios
      .get(`${api_address}/api/services/all`, config)
      .then((response) => {
        // response.data;
        setServices(response.data);
        console.log("Services fetched successfully:", response.data);
      })
      .catch((error) => {
        console.error("Error fetching services:", error);
      });
  };

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${api_address}/api/transactions`, config);
      const mapped = res.data.map((txn: any) => ({
        id: txn._id,
        bookingId: txn.bookingId || "-",
        service: txn.service,
        stylist:
          typeof txn.stylist === "object" ? txn.stylist._id : txn.stylist,
        stylistName:
          typeof txn.stylist === "object" ? txn.stylist.name : txn.stylist,
        paymentMethod: txn.paymentMethod,
        amount: txn.amount.toString(),
        status: txn.status.toString(),
      }));
      setTransactions(mapped);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const fetchStylists = async () => {
    try {
      const res = await axios.get(`${api_address}/api/stylists`, config);
      setStylists(res.data);
      // if (res.data.length > 0) {
      //   // setTransactions((prev) => ({ ...prev, stylist: res.data[0]._id }));
      // }
    } catch (err) {
      console.error("Error fetching stylists:", err);
    }
  };

  const handleAddOrUpdate = async () => {
    const payload = {
      service: transactionData.service,
      stylist: transactionData.stylist,
      paymentMethod: transactionData.paymentMethod,
      amount: parseFloat(transactionData.amount),
      status: transactionData.status,
    };

    try {
      if (selectedTransaction) {
        await axios.put(
          `${api_address}/api/transactions/${selectedTransaction.id}`,
          payload,
          config
        );
      } else {
        const res = await axios.post(
          `${api_address}/api/transactions`,
          payload,
          config
        );
        payload["id"] = res.data._id;
      }

      await fetchTransactions();
      closeModal();
      resetFields();
    } catch (err: any) {
      console.error("Save error:", err);
      if (err.response) console.error("Backend error:", err.response.data);
    }
  };
  const handleAddNewTransaction = async (transaction: Transaction) => {
    try {
      const res = await axios.post(
        `${api_address}/api/transactions`,
        transaction,
        config
      );
      setTransactions((prev) => [
        ...prev,
        { ...transaction, id: res.data._id },
      ]);
      closeModalNew();
    } catch (err) {
      console.error("Error adding transaction:", err);
    }
  };
  const handleUpdateTransaction = async (transaction: Transaction) => {
    try {
      await axios.put(
        `${api_address}/api/transactions/${transaction.id}`,
        transaction,
        config
      );
      setTransactions((prev) =>
        prev.map((txn) => (txn.id === transaction.id ? transaction : txn))
      );
      closeModalEdit();
    } catch (err) {
      console.error("Error updating transaction:", err);
    }
  };

  // const resetFields = () => {
  //   setTransactionData({
  //     id: "",
  //     bookingId: "",
  //     service: services[0],
  //     stylist: stylists.length > 0 ? stylists[0]._id : "",
  //     stylistName: "string",
  //     paymentMethod: paymentMethods[0],
  //     amount: "",
  //     status: statuses[0],
  //   });
  //   setSelectedTransaction(null);
  // };

  const handleTransactionClick = (txn: Transaction) => {
    setSelectedTransaction(txn);
    openModalEdit();
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Transaction" />
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 w-full">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Transaction
          </h4>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              // resetFields();
              openModalNew();
            }}
          >
            Add Transaction +
          </Button>
        </div>

        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">#</th>
              <th className="border p-2">Service</th>
              <th className="border p-2">Stylist</th>
              <th className="border p-2">Payment Method</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn, index) => (
              <tr
                key={txn.id}
                className="text-center border cursor-pointer hover:bg-gray-100"
                onClick={() => handleTransactionClick(txn)}
              >
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{txn.service}</td>
                <td className="border p-2">{txn.stylistName || txn.stylist}</td>
                <td className="border p-2">{txn.paymentMethod}</td>
                <td className="border p-2">${txn.amount}</td>
                <td
                  className={
                    txn.status == "Cancelled"
                      ? "text-red-500 border p-2 font-semibold"
                      : txn.status == "Completed"
                      ? "text-green-500 border p-2 font-semibold"
                      : txn.status == "Pending"
                      ? "text-yellow-500 border p-2 font-semibold"
                      : txn.status == "Confirmed"
                      ? "text-blue-500 border p-2 font-semibold"
                      : "text-teal-300 border p-2 font-semibold"
                  }
                >
                  {txn.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <CustomerModal
          isOpen={isOpenNew}
          closeModal={closeModalNew}
          listOfServices={services}
          listOfStylists={stylists}
          onSave={handleAddNewTransaction}
        />
        <CustomerModal
          isOpen={isOpenEdit}
          closeModal={closeModalEdit}
          transaction={selectedTransaction}
          listOfServices={services}
          listOfStylists={stylists}
          onSave={handleUpdateTransaction}
        />
      </div>
    </div>
  );
}
interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
  transaction?: Transaction; // Optional prop to pass a service object for editing
  listOfServices: Service[]; // Optional prop to pass a list of services
  listOfStylists: Stylist[]; // Optional prop to pass a list of stylists
  onSave: (transaction: Transaction) => void; // Function to call when saving the service
  showCloseButton?: boolean; // New prop to control close button visibility
  isFullscreen?: boolean; // Default to false for backwards compatibility
}
const CustomerModal: React.FC<ModalProps> = ({
  isOpen,
  closeModal,
  transaction,
  listOfServices,
  listOfStylists,
  onSave,
  showCloseButton = true, // Default to true for backwards compatibility
  isFullscreen = false,
}) => {
  const [transactionData, setTransactionData] = useState<Transaction>({
    id: "",
    bookingId: "",
    service: "",
    stylist: "",
    stylistName: "",
    paymentMethod: "Cash",
    amount: 0,
    status: "Pending",
  });
  const handleSave = () => {
    onSave(transactionData);
  };
  useEffect(() => {
    setTransactionData({
      id: transaction ? transaction.id : "",
      bookingId: transaction ? transaction.bookingId : "",
      service: transaction ? transaction.service : "",
      stylist: transaction ? transaction.stylist : "",
      stylistName: transaction ? transaction.stylistName : "",
      paymentMethod: transaction ? transaction.paymentMethod : "Cash",
      amount: transaction ? transaction.amount : 0,
      status: transaction ? transaction.status : "Pending",
    });
  }, [isOpen]);
  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] p-6">
      <div className="flex flex-col px-2 overflow-y-auto">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          {transaction ? "Edit Transaction" : "Add Transaction"}
        </h4>
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Service
            </label>
            <select
              value={transactionData.service}
              onChange={(e) =>
                setTransactionData({
                  ...transactionData,
                  service: e.target.value,
                })
              }
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
              {listOfServices.map((option) => (
                <option key={option._id} value={option.name}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Stylist
            </label>
            <select
              value={transactionData.stylist}
              onChange={(e) =>
                setTransactionData({
                  ...transactionData,
                  stylist: e.target.value,
                })
              }
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
              {listOfStylists.map((stylist) => (
                <option key={stylist._id} value={stylist._id}>
                  {stylist.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Payment Method
            </label>
            <select
              value={transactionData.paymentMethod}
              onChange={(e) => {
                if (e.target.value === "Card" || e.target.value === "Cash") {
                  setTransactionData({
                    ...transactionData,
                    paymentMethod: e.target.value as "Cash" | "Card",
                  });
                }
              }}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
              {["Card", "Cash"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Status
            </label>
            <select
              value={transactionData.status}
              onChange={(e) => {
                if (
                  e.target.value === "Pending" ||
                  e.target.value === "Completed" ||
                  e.target.value === "Cancelled" ||
                  e.target.value === "Confirmed"
                ) {
                  setTransactionData({
                    ...transactionData,
                    status: e.target.value as
                      | "Pending"
                      | "Completed"
                      | "Cancelled"
                      | "Confirmed",
                  });
                }
              }}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
              {["Completed", "Pending", "Cancelled", "Confirmed"].map(
                (option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                )
              )}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Amount
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              pattern="^\d*(\.\d{0,2})?$"
              placeholder="Enter amount"
              value={transactionData.amount}
              onChange={(e) => {
                const { value } = e.target;

                // check if value includes a decimal point
                if (value.match(/\./g)) {
                  let [, decimal] = value.split(".");
                  decimal = decimal.substring(0, 2); // restrict value to only 2 decimal places
                  // restrict value to only 2 decimal places
                  if (decimal?.length > 2) {
                    // do nothing
                    console.log("Decimal places exceeded");
                    return;
                  }
                }
                setTransactionData({
                  ...transactionData,
                  amount: parseFloat(e.target.value),
                });
              }}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6 sm:justify-end">
          <button
            onClick={closeModal}
            type="button"
            className="rounded-lg border px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          >
            Close
          </button>
          <Button size="sm" variant="primary" onClick={handleSave}>
            {transaction ? "Update Transaction" : "Create"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
