import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import Button from "../components/ui/button/Button";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";

export default function Teams() {
    const [teamMembers, setTeamMembers] = useState([]);
    const { isOpen, openModal, closeModal } = useModal();

    const [memberData, setMemberData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        role: "stylist",
        bio: "",
    });

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

    const handleAddMember = () => {
        console.log("Member data submitted:", memberData);
        closeModal();
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Team" />
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 w-full">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">Team</h4>
                    <Button size="sm" variant="primary" onClick={openModal}>
                        Add Team Member +
                    </Button>
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

            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] p-6">
                <div className="flex flex-col px-2 overflow-y-auto">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Add Team Member</h4>

                    <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                        <div className="col-span-2 lg:col-span-1">
                            <Label>First Name</Label>
                            <Input
                                type="text"
                                placeholder="First Name"
                                value={memberData.firstName}
                                onChange={(e) => setMemberData({ ...memberData, firstName: e.target.value })}
                            />
                        </div>

                        <div className="col-span-2 lg:col-span-1">
                            <Label>Last Name</Label>
                            <Input
                                type="text"
                                placeholder="Last Name"
                                value={memberData.lastName}
                                onChange={(e) => setMemberData({ ...memberData, lastName: e.target.value })}
                            />
                        </div>

                        <div className="col-span-2 lg:col-span-1">
                            <Label>Email Address</Label>
                            <Input
                                type="email"
                                placeholder="Email"
                                value={memberData.email}
                                onChange={(e) => setMemberData({ ...memberData, email: e.target.value })}
                            />
                        </div>

                        <div className="col-span-2 lg:col-span-1">
                            <Label>Phone</Label>
                            <Input
                                type="text"
                                placeholder="Phone"
                                value={memberData.phone}
                                onChange={(e) => setMemberData({ ...memberData, phone: e.target.value })}
                            />
                        </div>

                        <div className="col-span-2">
                            <Label>Role</Label>
                            <select
                                value={memberData.role}
                                onChange={(e) => setMemberData({ ...memberData, role: e.target.value })}
                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            >
                                <option value="stylist">Stylist</option>
                                <option value="branch manager">Branch Manager</option>
                                <option value="admin">Admin</option>
                            </select>
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
                        <Button size="sm" variant="primary" onClick={handleAddMember}>
                            Create
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}