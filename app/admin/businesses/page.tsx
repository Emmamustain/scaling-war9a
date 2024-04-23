import Expandable from "@/components/Atoms/expandable";
import AdminHeader from "@/components/Compounds/AdminHeader";
import AdminTable from "@/components/Compounds/AdminTable";
import { openAtom } from "@/components/Compounds/AdminHeader";
export default function AdminBusinesses() {
  return (
    <div className="flex min-h-screen w-screen bg-neutral-800">
      <div>
        <AdminHeader active="businesses" />
      </div>

      <div className="w-full bg-neutral-800  pt-12">
        <div>
          <Expandable atom={openAtom}>
            <AdminTable />
          </Expandable>
        </div>
      </div>
    </div>
  );
}
