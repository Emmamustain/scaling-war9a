"use client";
import { addServiceToBusiness } from "@/database/mutations";
import { ChangeEvent, SetStateAction, useState } from "react";

interface AddServiceFormProps {
  slug: string;
}

export default function AddServiceForm({ slug }: AddServiceFormProps) {
  const [serviceName, setServiceName] = useState("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setServiceName(e.target.value);
  };

  const handleButtonClick = async () => {
    try {
      const result = await addServiceToBusiness(serviceName, slug);
      console.log(serviceName); // Log the result of the mutation
    } catch (error) {
      console.error("Error adding service:", error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={serviceName}
        onChange={handleInputChange}
        placeholder="Enter service name"
      />
      <button onClick={handleButtonClick}>Add Service</button>
    </div>
  );
}
