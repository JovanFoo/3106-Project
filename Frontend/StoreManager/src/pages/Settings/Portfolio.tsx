import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import SettingsSidebar from "../SettingsSidebar";

const portfolioItems = [
    { id: 1, title: "2 block", image: "/images/2block1.jpg" },
    { id: 2, title: "Low Taper Fade", image: "/images/lowtaper1.jpg" },
    { id: 3, title: "Wolf Cut", image: "/images/wolfcut1.jpg" },
    { id: 4, title: "2 block", image: "/images/2block2.jpg" },
    { id: 5, title: "Low Taper Fade", image: "/images/lowtaper2.jpg" },
    { id: 6, title: "Wolf Cut", image: "/images/wolfcut2.jpg" },
];

export default function PortfolioGallery() {
    const [selected, setSelected] = useState(null);

    return (
        <div className="flex min-h-screen">
            <SettingsSidebar />
            <div className="flex-1 p-5">
                <PageBreadcrumb pageTitle="Portfolio/Gallery" />
                <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Portfolio/Gallery
                        </h4>
                        <Button size="sm" variant="primary">Add Photos +</Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {portfolioItems.map((item) => (
                            <div
                                key={item.id}
                                className={`p-2 rounded-lg border cursor-pointer transition ${selected === item.id ? "border-blue-500" : "border-transparent"
                                    }`}
                                onClick={() => setSelected(item.id)}
                            >
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-40 object-cover rounded-md"
                                />
                                <p className="text-center mt-2 text-sm font-medium text-gray-800 dark:text-white">
                                    {item.title}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
