import axios from "axios";
import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import Button from "../components/ui/button/Button";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

const config = {
    headers: {
        Authorization: sessionStorage.getItem("token"),
    },
};

type Transaction = {
    id: string;
    bookingId: string;
    service: string;
    stylist: string;
    stylistName: string;
    paymentMethod: string;
    amount: string;
    status: string;
};

type Stylist = {
    _id: string;
    name: string;
};

const services = ["Haircut", "Beard Trim", "Shave", "Hair Coloring"];
const paymentMethods = ["Cash", "Card"];
const statuses = ["Pending", "Completed", "Cancelled"];

export default function Transactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [stylists, setStylists] = useState<Stylist[]>([]);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [transactionData, setTransactionData] = useState<Transaction>({
        id: "",
        bookingId: "",
        service: services[0],
        stylist: "",
        stylistName: "",
        paymentMethod: paymentMethods[0],
        amount: "",
        status: statuses[0],
    });
    const { isOpen, openModal, closeModal } = useModal();

    useEffect(() => {
        fetchTransactions();
        fetchStylists();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await axios.get(`${api_address}/api/transactions`, config);
            const mapped = res.data.map((txn: any) => ({
                id: txn._id,
                bookingId: txn.bookingId || "-",
                service: txn.service,
                stylist: typeof txn.stylist === "object" ? txn.stylist._id : txn.stylist,
                stylistName: typeof txn.stylist === "object" ? txn.stylist.name : txn.stylist,
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
            if (res.data.length > 0) {
                setTransactionData((prev) => ({ ...prev, stylist: res.data[0]._id }));
            }
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
                await axios.put(`${api_address}/api/transactions/${selectedTransaction.id}`, payload, config);
            } else {
                const res = await axios.post(`${api_address}/api/transactions`, payload, config);
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

    const resetFields = () => {
        setTransactionData({
            id: "",
            bookingId: "",
            service: services[0],
            stylist: stylists.length > 0 ? stylists[0]._id : "",
            stylistName: "", // ✅ Add this line
            paymentMethod: paymentMethods[0],
            amount: "",
            status: statuses[0],
        });
        setSelectedTransaction(null);
    };

    const handleTransactionClick = (txn: Transaction) => {
        setSelectedTransaction(txn);
        setTransactionData({
            id: txn.id,
            bookingId: txn.bookingId,
            service: txn.service,
            stylist: txn.stylist,
            stylistName: txn.stylistName,
            paymentMethod: txn.paymentMethod,
            amount: txn.amount,
            status: txn.status,
        });
        openModal();
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Transaction" />
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 w-full">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">Transaction</h4>
                    <Button size="sm" variant="primary" onClick={() => { resetFields(); openModal(); }}>
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
                                <td className="border p-2">{txn.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] p-6">
                <div className="flex flex-col px-2 overflow-y-auto">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                        {selectedTransaction ? "Edit Transaction" : "Add Transaction"}
                    </h4>

                    <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Service</label>
                            <select
                                value={transactionData.service}
                                onChange={(e) => setTransactionData({ ...transactionData, service: e.target.value })}
                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                            >
                                {services.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Stylist</label>
                            <select
                                value={transactionData.stylist}
                                onChange={(e) => setTransactionData({ ...transactionData, stylist: e.target.value })}
                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                            >
                                {stylists.map((stylist) => (
                                    <option key={stylist._id} value={stylist._id}>{stylist.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Payment Method</label>
                            <select
                                value={transactionData.paymentMethod}
                                onChange={(e) => setTransactionData({ ...transactionData, paymentMethod: e.target.value })}
                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                            >
                                {paymentMethods.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Status</label>
                            <select
                                value={transactionData.status}
                                onChange={(e) => setTransactionData({ ...transactionData, status: e.target.value })}
                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                            >
                                {statuses.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Amount</label>
                            <input
                                type="number"
                                value={transactionData.amount}
                                onChange={(e) => setTransactionData({ ...transactionData, amount: e.target.value })}
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
                        <Button size="sm" variant="primary" onClick={handleAddOrUpdate}>
                            {selectedTransaction ? "Update Transaction" : "Create"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
