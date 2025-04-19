import axios from "axios";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useUser } from "../../context/UserContext";
import { useModal } from "../../hooks/useModal";
import SettingsSidebar from "../SettingsPage/SettingsSidebar";

const api_address = import.meta.env.VITE_APP_API_ADDRESS_DEV;

type GalleryItem = {
  _id: string;
  title: string;
  image: string;
};
export default function PortfolioGallery() {
  const [selected, setSelected] = useState("");
  const { isOpen, openModal, closeModal } = useModal();

  const user = useUser();
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const [currentImage, setCurrentImage] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const config = {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
      Authorization: sessionStorage.getItem("token"),
    },
  };
  useEffect(() => {
    const fetchGallery = async () => {
      if (!user._id) return;
      try {
        await axios
          .get(`${api_address}/api/galleries/all/${user._id}`, config)
          .then((response: any) => {
            setGallery(response.data);
          })
          .catch(() => {
            toast.error("Failed to fetch gallery items.");
          });
      } catch (error) {
        toast.error("Failed to fetch gallery items.");
      }
    };
    fetchGallery();
  }, [user._id]);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Adding photos...");
    setIsUpdating(true);

    if (!currentImage) {
      toast.info("Please select an image.");
      setIsUpdating(false);
      setCurrentImage("");
      setCurrentTitle("");
      closeModal();
      return;
    }
    if (!currentTitle) {
      toast.info("Please enter a title.");
      setIsUpdating(false);
      setCurrentImage("");
      setCurrentTitle("");
      closeModal();
      return;
    }
    try {
      await axios
        .post(
          `${api_address}/api/galleries/`,
          {
            title: currentTitle,
            image: currentImage,
          },
          config
        )
        .then((response: any) => {
          toast.success("Photos added successfully.");
          setGallery((prev) => [...prev, response.data]);
          user.addGalleries(response.data._id);
        })
        .catch((error: any) => {
          toast.error("Failed to add photos.");
          console.log(error);
        });
    } catch (error) {
      toast.error("Failed to add photos.");
    }
    setIsUpdating(false);
    setCurrentImage("");
    setCurrentTitle("");
    closeModal();
  };
  return (
    <div className="flex ">
      <SettingsSidebar />
      <div className="flex-1 p-5">
        <PageBreadcrumb pageTitle="Portfolio/Gallery" />
        <div className="rounded-2xl  min-h-[80vh] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Portfolio/Gallery
            </h4>
            <Button
              size="sm"
              variant="primary"
              onClick={openModal}
              disabled={isUpdating}
            >
              Add Photos +
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-4 overflow-auto max-h-[65vh]">
            {gallery.map((item) => (
              <div
                key={item._id}
                className={`p-2 rounded-lg border cursor-pointer transition ${
                  selected === item._id
                    ? "border-blue-500"
                    : "border-transparent"
                }`}
                onClick={() => setSelected(item._id)}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full  object-cover rounded-md"
                />
                <p className="text-center mt-2 text-sm font-medium text-gray-800 dark:text-white">
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        </div>
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[500px] m-4"
        >
          <div className="relative w-full max-w-[500px] rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Update Password
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Enter your current password and set a new one.
            </p>

            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => handleAdd(e)}
            >
              <div>
                <Label>Image title</Label>
                <Input
                  type="text"
                  placeholder="Enter image title"
                  value={currentTitle}
                  onChange={(e) => setCurrentTitle(e.target.value)}
                />
              </div>

              <div>
                <Input
                  type="file"
                  name="image"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (!files) return;
                    const file = files[0];
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setCurrentImage(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </div>
              {currentImage && (
                <div className="mt-4 overflow-auto h-40 ">
                  <img
                    src={currentImage}
                    alt="Selected"
                    className="w-full object-cover rounded-md"
                  />
                </div>
              )}

              <div className="flex items-center gap-3 mt-4 lg:justify-end">
                <Button size="sm" type="neutral" onClick={closeModal}>
                  Cancel
                </Button>
                <Button size="sm">Save Changes</Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        style={{ zIndex: 999999 }}
      />
    </div>
  );
}
