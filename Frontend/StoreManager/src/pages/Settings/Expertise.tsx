import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
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

    const toggleSelection = (expertise: string) => {
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
                    <div className="flex items-center gap-3 mt-6 lg:justify-end">
                        <Button size="sm" variant="outline">
                            Cancel
                        </Button>
                        <Button size="sm">
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}