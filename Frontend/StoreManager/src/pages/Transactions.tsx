import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import Button from "../components/ui/button/Button";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [transactionData, setTransactionData] = useState({
        bookingId: "",
        paymentMethod: "Cash",
        amount: "",
    });
    const { isOpen, openModal, closeModal } = useModal();

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await fetch("/api/transactions");
                const data = await response.json();
                setTransactions(data);
            } catch (error) {
                console.error("Error fetching transactions:", error);
            }
        };

        fetchTransactions();
    }, []);

    const handleAddTransaction = () => {
        if (selectedTransaction) {
            // Update existing transaction
            setTransactions((prev) =>
                prev.map((txn) =>
                    txn.id === selectedTransaction.id
                        ? { ...txn, ...transactionData }
                        : txn
                )
            );
        } else {
            // Add new transaction
            setTransactions((prev) => [
                ...prev,
                { id: Date.now().toString(), ...transactionData },
            ]);
        }
        closeModal();
        resetTransactionFields();
    };

    const resetTransactionFields = () => {
        setTransactionData({ bookingId: "", paymentMethod: "Cash", amount: "" });
        setSelectedTransaction(null);
    };

    const handleTransactionClick = (transaction) => {
        setSelectedTransaction(transaction);
        setTransactionData({
            bookingId: transaction.bookingId,
            paymentMethod: transaction.paymentMethod,
            amount: transaction.amount,
        });
        openModal();
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Transaction" />
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 w-full">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Transaction
                    </h4>
                    <Button size="sm" variant="primary" onClick={openModal}>
                        Add Transaction +
                    </Button>
                </div>
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2">Id</th>
                            <th className="border p-2">Service</th>
                            <th className="border p-2">Barber</th>
                            <th className="border p-2">Datetime</th>
                            <th className="border p-2">Payment Method</th>
                            <th className="border p-2">Amount</th>
                            <th className="border p-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction, index) => (
                            <tr
                                key={index}
                                className="text-center border cursor-pointer hover:bg-gray-100"
                                onClick={() => handleTransactionClick(transaction)}
                            >
                                <td className="border p-2">{transaction.id}</td>
                                <td className="border p-2">{transaction.service}</td>
                                <td className="border p-2">{transaction.barber}</td>
                                <td className="border p-2">{transaction.datetime}</td>
                                <td className="border p-2">{transaction.paymentMethod}</td>
                                <td className="border p-2">${transaction.amount}</td>
                                <td className="border p-2">{transaction.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] p-6">
                <div className="flex flex-col px-2 overflow-y-auto">
                    <h4 className="text-lg text-white font-semibold mb-4">
                        {selectedTransaction ? "Edit Transaction" : "Add Transaction"}
                    </h4>
                    
                    <div className="mt-6">
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Current Booking
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Booking ID"
                                value={transactionData.bookingId}
                                onChange={(e) =>
                                    setTransactionData({ ...transactionData, bookingId: e.target.value })
                                }
                                className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Payment Method
                        </label>
                        <div className="relative">
                            <select
                                className="w-full p-2 border rounded-md"
                                value={transactionData.paymentMethod}
                                onChange={(e) =>
                                    setTransactionData({ ...transactionData, paymentMethod: e.target.value })
                                }
                            >
                                <option value="Cash">Cash</option>
                                <option value="Card">Card</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Amount
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="Amount Paid"
                                value={transactionData.amount}
                                onChange={(e) =>
                                    setTransactionData({ ...transactionData, amount: e.target.value })
                                }
                                className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">                        <button
                        onClick={closeModal}
                        type="button"
                        className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                    >
                        Close
                    </button>
                        <Button size="sm" variant="primary" onClick={handleAddTransaction}>
                            {selectedTransaction ? "Update Transaction" : "Create"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
