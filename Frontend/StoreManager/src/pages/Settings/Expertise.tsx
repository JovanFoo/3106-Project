import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import SettingsSidebar from "../SettingsSidebar";

const expertiseOptions = [
    "Haircut",
    "Hair Treatments",
    "Men’s Grooming",
    "Color Treatments",
    "Bridal & Event Styling",
    "Classic Perms",
    "Digital Perms",
    "Spiral Perms",
    "Hair Reborn Restoration",
    "Total Reborn",
    "Scalp Massage",
    "Highlight",
];

export default function Expertise() {
    const [selectedExpertise, setSelectedExpertise] = useState(["Men’s Grooming", "Total Reborn"]);
    const { isOpen, openModal, closeModal } = useModal();

    const toggleSelection = (expertise) => {
        setSelectedExpertise((prev) =>
            prev.includes(expertise)
                ? prev.filter((item) => item !== expertise)
                : [...prev, expertise]
        );
    };

    return (
        <div className="flex min-h-screen">
            <SettingsSidebar />
            <div className="flex-1 p-5">
                <PageBreadcrumb pageTitle="Expertise" />
                <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">Expertise</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Select your areas of expertise below.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {selectedExpertise.map((expertise) => (
                            <span key={expertise} className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium shadow-md">
                                {expertise}
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 mt-6 lg:justify-end">
                        <Button size="sm" onClick={openModal}>
                            Edit
                        </Button>
                    </div>
                </div>
            </div>
            
            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] p-6">
                <div className="flex flex-col px-2 overflow-y-auto">
                    <h4 className="text-lg text-white font-semibold mb-4">Edit Expertise</h4>
                    <div className="flex flex-wrap gap-3">
                        {expertiseOptions.map((expertise) => (
                            <button
                                key={expertise}
                                onClick={() => toggleSelection(expertise)}
                                className={`px-4 py-2 rounded-full text-sm font-medium shadow-md transition ${selectedExpertise.includes(expertise)
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-gray-800 dark:bg-gray-700 dark:text-white border border-gray-300"
                                    }`}
                            >
                                {expertise}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 mt-6 sm:justify-end">
                        <button
                            onClick={closeModal}
                            type="button"
                            className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                        >
                            Close
                        </button>
                        <Button size="sm" variant="primary" onClick={closeModal}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
