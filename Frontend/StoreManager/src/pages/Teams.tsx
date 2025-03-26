import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import Button from "../components/ui/button/Button";

export default function Teams() {
    const [teamMembers, setTeamMembers] = useState([]);

    useEffect(() => {
        const fetchTeamMembers = async () => {
            try {
                const response = await fetch("/api/team-members"); // Replace with actual API endpoint
                const data = await response.json();
                setTeamMembers(data);
            } catch (error) {
                console.error("Error fetching team members:", error);
            }
        };

        fetchTeamMembers();
    }, []);

    return (
        <div>
            <PageBreadcrumb pageTitle="Team" />
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 w-full">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Team
                    </h4>
                    <Button size="sm" variant="primary">Add Team Member +</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {teamMembers.map((member) => (
                        <div key={member._id} className="p-4 border rounded-lg shadow-sm flex flex-col items-center">
                            <img
                                src={member.image || "/images/default-avatar.jpg"}
                                alt={member.name}
                                className="w-24 h-24 object-cover rounded-full border"
                            />
                            <h5 className="font-semibold text-md mt-2">{member.name}</h5>
                            <p className="text-sm text-gray-500">{member.role}</p>
                            <p className="text-yellow-500">⭐ {member.rating}</p>
                            <Button size="sm" variant="primary" className="mt-3 w-full">
                                View More
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}