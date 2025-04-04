import axios from "axios";
import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Alert from "../components/ui/alert/Alert";
import Button from "../components/ui/button/Button";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

type Expertise = {
    _id: string;
    name: string;
    active: boolean;
};

export default function Expertise() {

    const [expertises, setExpertises] = useState<Expertise[]>([]);
    const [newName, setNewName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [variant, setVariant] = useState<"success" | "error" | "warning" | "info">("info");
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const { isOpen, openModal, closeModal } = useModal();

    const config = {
        headers: {
            Authorization: sessionStorage.getItem("token"),
        },
    };

    const fetchExpertises = async () => {
        try {
            setIsLoading(true);
            const res = await axios.get(`${api_address}/api/expertises`, config);
            setExpertises(res.data);
        } catch (err) {
            console.error(err);
            setVariant("error");
            setTitle("Error");
            setMessage("Failed to fetch expertises");
            setShowAlert(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchExpertises();
    }, []);

    const createExpertise = async () => {
        if (!newName.trim()) return;
        try {
            await axios.post(`${api_address}/api/expertises`, { name: newName }, config);
            setNewName("");
            fetchExpertises();
            setVariant("success");
            setTitle("Success");
            setMessage("Expertise added successfully");
            setShowAlert(true);
        } catch (err) {
            console.error(err);
            setVariant("error");
            setTitle("Error");
            setMessage("Failed to add expertise");
            setShowAlert(true);
        }
    };

    const toggleActive = async (id: string, currentState: boolean) => {
        try {
            await axios.put(`${api_address}/api/expertises/${id}`, { active: !currentState }, config);
            fetchExpertises();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteExpertise = async (id: string) => {
        try {
            await axios.delete(`${api_address}/api/expertises/${id}`, config);
            fetchExpertises();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex min-h-screen">
            <div className="flex-1 p-5">
                <PageMeta title="Expertise Management" description="Manage expertise tags" />
                <PageBreadcrumb pageTitle="Expertise" />

                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Manage Expertise Tags
                        </h3>
                        <Button size="sm" variant="primary" onClick={openModal}>
                            Add Expertise +
                        </Button>
                    </div>

                    {showAlert && (
                        <div className="mb-5">
                            <Alert variant={variant} title={title} message={message} />
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 dark:text-white/90">
                        {expertises.map((exp) => (
                            <div
                                key={exp._id}
                                className="p-4 border rounded-lg shadow-sm flex flex-col gap-2"
                            >
                                <p className="font-semibold text-md dark:text-white/90">{exp.name}</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
                                    <input
                                        type="checkbox"
                                        checked={exp.active}
                                        onChange={() => toggleActive(exp._id, exp.active)}
                                    />
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => deleteExpertise(exp._id)}
                                >
                                    Delete
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] p-6">
                    <div className="flex flex-col px-2">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                            Add New Expertise
                        </h4>

                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                            Expertise Name
                        </label>
                        <input
                            type="text"
                            className="p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                            placeholder="e.g. Haircut, Digital Perms"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={closeModal}
                                className="rounded-lg border px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                            >
                                Cancel
                            </button>
                            <Button size="sm" variant="primary" onClick={createExpertise}>
                                Add
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
}
