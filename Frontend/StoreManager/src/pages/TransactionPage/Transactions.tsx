import axios from "axios";
import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Alert from "../../components/ui/alert/Alert";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

type Transaction = {
  _id: string;
  bookingId: string;
  service: Service;
  stylist: Stylist;
  date: Date;
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
const dummyService: Service = {
  _id: "1",
  name: "Dummy",
  duration: 30,
  description: "Dummy service",
  serviceRates: [
    {
      _id: "1",
      name: "Dummy Rate",
      rate: 20,
      startDate: new Date(),
      endDate: new Date(),
    },
  ],
  expertiseRequired: [],
};
const dummyStylist: Stylist = {
  _id: "1",
  name: "Dummy Stylist",
};
type PaginationData = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  transactions: Transaction[];
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
  // For pagination
  const [pageSizeOptions] = useState([5, 10, 20, 50]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[1]); // Default to 10
  const [totalPages, setTotalPages] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction>();

  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [variant, setVariant] = useState<
    "success" | "error" | "warning" | "info"
  >("info");
  const [title, setTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
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

  useEffect(() => {
    fetchAllServices();
    fetchTransactions();
    fetchStylists();
  }, [pageNumber, pageSize, isLoading]);

  const fetchAllServices = async () => {
    await axios
      .get(`${api_address}/api/services/all`, config)
      .then((response) => {
        setServices(response.data);
      })
      .catch((error) => {
        console.error("Error fetching services:", error);
      });
  };

  const fetchTransactions = async () => {
    await axios
      .get(
        `${api_address}/api/transactions?page=${pageNumber}&limit=${pageSize}`,
        config
      )
      .then((response) => {
        console.log(response.data);
        const res: PaginationData = response.data;

        setTotalTransactions(res.total);

        setTotalPages(res.totalPages);
        setHasNextPage(res.hasNextPage);
        const mapped: Transaction[] = res.transactions.map(
          (txn: Transaction) => ({
            _id: txn._id,
            bookingId: txn.bookingId || "-",
            service: txn.service,
            stylist: txn.stylist,
            date: new Date(txn.date),
            paymentMethod: txn.paymentMethod,
            amount: txn.amount,
            status: txn.status,
          })
        );
        setTransactions(mapped);
      })
      .catch((error) => {
        console.error("Error fetching transactions:", error);
      });
  };

  const fetchStylists = async () => {
    try {
      const res = await axios.get(`${api_address}/api/stylists`, config);
      setStylists(res.data);
    } catch (err) {
      console.error("Error fetching stylists:", err);
    }
  };
  const handleAddNewTransaction = async (transaction: Transaction) => {
    setIsLoading(true);

    closeModalNew();
    setShowAlert(true);
    setVariant("info");
    setTitle("Adding!");
    setMessage("Adding transaction!");
    try {
      const res = await axios.post(
        `${api_address}/api/transactions`,
        transaction,
        config
      );
      setTransactions((prev) => [
        { ...transaction, id: res.data._id },
        ...prev,
      ]);
      setShowAlert(true);
      setVariant("success");
      setTitle("Success!");
      setMessage("Transaction added successfully!");
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    } catch (err) {
      console.error("Error adding transaction:", err);
      setShowAlert(true);
      setVariant("error");
      setTitle("Error!");
      setMessage("Error adding transaction!");
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    }
    setIsLoading(false);
  };
  const handleUpdateTransaction = async (transaction: Transaction) => {
    closeModalEdit();
    setShowAlert(true);
    setVariant("info");
    setTitle("Updating!");
    setMessage("Updating transaction!");
    try {
      await axios.put(
        `${api_address}/api/transactions/${transaction._id}`,
        transaction,
        config
      );
      setTransactions((prev) =>
        prev.map((txn) => (txn._id === transaction._id ? transaction : txn))
      );
      setShowAlert(true);
      setVariant("success");
      setTitle("Success!");
      setMessage("Transaction updated successfully!");
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    } catch (err) {
      console.error("Error updating transaction:", err);
      setShowAlert(true);
      setVariant("error");
      setTitle("Error!");
      setMessage("Error updating transaction!");
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    }
  };

  const handleTransactionClick = (txn: Transaction) => {
    setSelectedTransaction(txn);
    openModalEdit();
  };

  const handleNext = () => {
    if (pageNumber < totalPages) {
      setPageNumber(pageNumber + 1);
    }
  };
  const handlePrev = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNumber(1); // Reset to first page on page size change
  };
  return (
    <div className="flex">
      <div className="flex-1 ">
        <PageMeta title="Transactions" description="Manage your Transactions" />
        <PageBreadcrumb pageTitle="Transaction" />
        <div className="rounded-2xl  h-full border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          {showAlert && (
            <div className="mb-5">
              <Alert variant={variant} title={title} message={message} />
            </div>
          )}
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
            <thead className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300">
              <tr className="text-center">
                <th className="border p-2">#</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Service</th>
                <th className="border p-2">Stylist</th>
                <th className="border p-2">Payment Method</th>
                <th className="border p-2">Amount</th>
                <th className="border p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {[...transactions].slice().map((txn, index) => (
                <tr
                  key={txn._id}
                  className="text-center border cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-slate-300"
                  onClick={() => handleTransactionClick(txn)}
                >
                  <td className="border p-2">
                    {totalTransactions - index - (pageNumber - 1) * pageSize}
                  </td>{" "}
                  {/* Reverse index */}
                  <td className="border p-2">
                    {txn.date.toLocaleDateString("SG")}{" "}
                    {txn.date.toLocaleTimeString("SG", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </td>
                  <td className="border p-2">{txn.service.name}</td>
                  <td className="border p-2">{txn.stylist.name}</td>
                  <td className="border p-2">{txn.paymentMethod}</td>
                  <td className="border p-2">
                    ${parseFloat(txn.amount.toString()).toFixed(2)}
                  </td>
                  <td
                    className={
                      txn.status == "Cancelled"
                        ? "text-red-500 border p-2 font-semibold dark:text-red-300"
                        : txn.status == "Completed"
                        ? "text-green-500 border p-2 font-semibold dark:text-green-300"
                        : txn.status == "Pending"
                        ? "text-yellow-500 border p-2 font-semibold dark:text-yellow-300"
                        : txn.status == "Confirmed"
                        ? "text-blue-500 border p-2 font-semibold dark:text-blue-300"
                        : "text-teal-500 border p-2 font-semibold dark:text-teal-300"
                    }
                  >
                    {txn.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2 items-center">
              <span className="text-gray-700 dark:text-gray-400 mt-4">
                Page {pageNumber} of {totalPages}
              </span>
              <span className="text-gray-700 dark:text-gray-400 mt-4 ml-2">
                Showing {transactions.length} of {totalTransactions}{" "}
                transactions
              </span>
              <span className="text-gray-700 dark:text-gray-400 mt-4 ">
                Page Size:
              </span>
              {pageSizeOptions.map((size) => (
                <span
                  key={size}
                  onClick={() => handlePageSizeChange(size)}
                  className={`text-gray-700 dark:text-gray-400 mt-4 cursor-pointer hover:text-blue-500 ${
                    pageSize === size
                      ? "font-bold text-black dark:text-white"
                      : ""
                  }`}
                >
                  {size}
                </span>
              ))}
            </div>
            <div className="flex gap-2 items-center mt-4 ml-2">
              <Button onClick={handlePrev} disabled={pageNumber === 1}>
                Previous
              </Button>
              <Button onClick={handleNext} disabled={pageNumber === totalPages}>
                Next
              </Button>
            </div>
          </div>
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
  listOfServices = [],
  listOfStylists = [],
  onSave,
  showCloseButton = true, // Default to true for backwards compatibility
  isFullscreen = false,
}) => {
  const [transactionData, setTransactionData] = useState<Transaction>({
    _id: "",
    bookingId: "",
    service: listOfServices[0] || dummyService,
    stylist: listOfStylists[0] || dummyStylist,
    paymentMethod: "Cash",
    date: new Date(),
    amount: 0,
    status: "Pending",
  });
  const handleSave = () => {
    onSave(transactionData);
  };
  useEffect(() => {
    setTransactionData({
      _id: transaction ? transaction._id : "",
      bookingId: transaction ? transaction.bookingId : "",
      service: transaction
        ? transaction.service
        : listOfServices[0] || dummyService,
      stylist: transaction
        ? transaction.stylist
        : listOfStylists[0] || dummyStylist,
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
              value={transactionData.service._id}
              onChange={(e) => {
                if (
                  listOfServices.filter((x) => x._id == e.target.value).length >
                  0
                ) {
                  setTransactionData({
                    ...transactionData,
                    service: listOfServices.filter(
                      (x) => x._id == e.target.value
                    )[0],
                  });
                }
              }}
              title="Select Service"
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-slate-300"
            >
              {listOfServices &&
                listOfServices.map((option) => (
                  <option key={option._id} value={option._id}>
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
              value={transactionData.stylist._id}
              onChange={(e) => {
                if (
                  listOfStylists.filter((x) => x._id == e.target.value).length >
                  0
                ) {
                  setTransactionData({
                    ...transactionData,
                    stylist: listOfStylists.filter(
                      (x) => x._id == e.target.value
                    )[0],
                  });
                }
              }}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-slate-300"
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
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-slate-300"
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
              disabled={
                transactionData.status === "Completed" ||
                transactionData.status === "Cancelled"
              }
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-slate-300"
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
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-slate-300"
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
