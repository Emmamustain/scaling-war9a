"use client";
import { Button } from "@/components/ui/button";
import { addBusiness } from "@/database/mutations";
import { toast } from "../ui/use-toast";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/utils/get-current-session";

interface SafeFormButtonProps {
  session: string;
  name: string;
  slug: string;
  description: string;
  phone: string;
  location: string;
  city: string;
  zipCode: string;
}
export default function SafeFormButton({
  session,
  name,
  slug,
  description,
  phone,
  location,
  city,
  zipCode,
}: SafeFormButtonProps) {
  async function handleSubmitForm() {
    const mutation = await addBusiness(
      session,
      name,
      slug,
      description,
      phone,
      location,
      city,
      zipCode,
    );

    if (mutation.error !== null) {
      redirect("/forms/join-as-business?error=" + mutation.error);
    }
  }

  return (
    <div onClick={handleSubmitForm}>
      <Button type="submit" className="w-full">
        Submit
      </Button>
    </div>
  );
}
