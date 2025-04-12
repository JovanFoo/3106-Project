import Button from "../button/Button";
import { useState, useEffect } from "react";
import { Modal } from ".";

interface InputProps<T> {
  label: String;
  placeholder: string;
  value: string | number;
  type: "Text" | "Number";
  onChange: (value: any) => void;
}
interface ModalProps<T> {
  isOpen: boolean;
  closeModal: () => void;
  editObject?: T; // Optional prop to pass a T object for editing
  defaultObject: T; // Default value for the T object
  onSave?: (t: T) => void; // Function to call when saving the T
  onDelete?: (t: T) => void; // Function to call when deleting the T
  showCloseButton?: boolean; // New prop to control close button visibility
  isFullscreen?: boolean; // Default to false for backwards compatibility
  isDelete?: boolean; // Flag to indicate if the modal is for deletion
  inputs: InputProps<T>[]; // Array of input props for dynamic rendering
}
export function CustomModal<V>({
  isOpen,
  closeModal,
  editObject,
  defaultObject,
  onSave = () => {},
  onDelete = () => {},
  isDelete = false,
  showCloseButton = true, // Default to true for backwards compatibility
  isFullscreen = false,
  inputs,
}: ModalProps<V>) {
  const [v, setV] = useState<V>(defaultObject);
  const handleSave = () => {
    onSave(v);
  };
  useEffect(() => {
    setV(defaultObject);
  }, [isOpen]);
  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] p-6">
      <div className="flex flex-col px-2">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          {editObject ? "Edit Expertise" : "Add New Expertise"}
        </h4>
        {inputs.map((input, index) => {
          const { label, placeholder, value, type, onChange } = input;
          return (
            <div key={index} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                {label}
              </label>
              <input
                type={type === "Text" ? "text" : "number"}
                className="p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            </div>
          );
        })}
        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={closeModal} variant="outline" type="info">
            Cancel
          </Button>
          <Button
            size="sm"
            variant="outline"
            type={v ? "warning" : "success"}
            onClick={() => handleSave()}
          >
            {v ? `Update ${typeof v}` : `Create ${typeof v}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
