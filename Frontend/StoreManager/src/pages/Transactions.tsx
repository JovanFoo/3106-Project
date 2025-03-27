import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import Button from "../components/ui/button/Button";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";

interface Transaction {
    id: string;
    bookingId: string;
    service: string;
    barber: string;
    datetime: string;
    paymentMethod: string;
    amount: string;
    status: string;
}

const services = ["Haircut", "Beard Trim", "Shave", "Hair Coloring"];
const barbers = ["John Doe", "Jane Smith", "Alex Johnson", "Sam Lee"];
const paymentMethods = ["Cash", "Card"];
const statuses = ["Pending", "Completed", "Cancelled"];

export default function Transactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [transactionData, setTransactionData] = useState<Transaction>({
        id: "",
        bookingId: "",
        service: services[0],
        barber: barbers[0],
        datetime: "",
        paymentMethod: paymentMethods[0],
        amount: "",
        status: statuses[0],
    });
    const { isOpen, openModal, closeModal } = useModal();

    useEffect(() => {
        setTransactions([
            {
                id: "1",
                bookingId: "BKG1001",
                service: "Haircut",
                barber: "John Doe",
                datetime: "2025-03-26 14:30",
                paymentMethod: "Cash",
                amount: "25.00",
                status: "Completed",
            },
            {
                id: "2",
                bookingId: "BKG1002",
                service: "Beard Trim",
                barber: "Jane Smith",
                datetime: "2025-03-26 15:00",
                paymentMethod: "Card",
                amount: "15.00",
                status: "Completed",
            }
        ]);
    }, []);

    const handleAddTransaction = () => {
        const newTransaction = { ...transactionData, id: Date.now().toString() };
        if (selectedTransaction) {
            setTransactions((prev) =>
                prev.map((txn) => (txn.id === selectedTransaction.id ? newTransaction : txn))
            );
        } else {
            setTransactions((prev) => [...prev, newTransaction]);
        }
        closeModal();
        resetTransactionFields();
    };

    const resetTransactionFields = () => {
        setTransactionData({
            id: "",
            bookingId: "",
            service: services[0],
            barber: barbers[0],
            datetime: "",
            paymentMethod: paymentMethods[0],
            amount: "",
            status: statuses[0],
        });
        setSelectedTransaction(null);
    };

    const handleTransactionClick = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setTransactionData(transaction);
        openModal();
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Transaction" />
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 w-full">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">Transaction</h4>
                    <Button size="sm" variant="primary" onClick={openModal}>Add Transaction +</Button>
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
            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] p-6">
                <div className="flex flex-col px-2 overflow-y-auto">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">{selectedTransaction ? "Edit Transaction" : "Add Transaction"}</h4>
                    <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                        {["service", "barber", "paymentMethod", "status"].map((key) => (
                            <div key={key} className="col-span-2 lg:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                                <select
                                    value={transactionData[key as keyof Transaction]}
                                    onChange={(e) => setTransactionData({ ...transactionData, [key]: e.target.value })}
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                >
                                    {(key === "service" ? services : key === "barber" ? barbers : key === "paymentMethod" ? paymentMethods : statuses).map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
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
                        <button onClick={closeModal} type="button" className="rounded-lg border px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">Close</button>
                        <Button size="sm" variant="primary" onClick={handleAddTransaction}>{selectedTransaction ? "Update Transaction" : "Create"}</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}