import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getBusinessEmployees,
  getScore,
  getUserData,
} from "@/database/queries";
import MinidenticonImg from "../Atoms/random-pfp";
import custompfpchecker from "@/utils/custom-pfp-checker";
import { getCurrentSession } from "@/utils/get-current-session";
import { revalidatePath } from "next/cache";

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type employeesData = UnwrapPromise<ReturnType<typeof getBusinessEmployees>>;

interface RecentScoresProps {
  employees: employeesData;
}

export default async function RecentScores({ employees }: RecentScoresProps) {
  const userData = await getUserData();
  const sortedEmployees = employees
    .filter((employee) => employee.users.role === "worker")
    .sort((a, b) => {
      const scoreA = a.workers.score ?? -Infinity; // Treat null score as lowest value
      const scoreB = b.workers.score ?? -Infinity; // Treat null score as lowest value
      return scoreB - scoreA;
    });

  const user_data = await getCurrentSession();
  console.log("userdata", user_data.data.session?.user.id);

  const incrementScore = await getScore(user_data.data.session?.user.id ?? "");

  return (
    <div className="space-y-8">
      {sortedEmployees &&
        sortedEmployees.map((employee, index) => (
          <div className="flex items-center" key={index}>
            <Avatar className="h-9 w-9">
              <MinidenticonImg
                username={custompfpchecker(employee.users.username ?? "random")}
              />
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {employee.users.username}
              </p>
              <p className="text-muted-foreground text-sm">
                {employee.users.role}
              </p>
            </div>
            <div className="ml-auto font-medium">{employee.workers.score}</div>
          </div>
        ))}
    </div>
  );
}
