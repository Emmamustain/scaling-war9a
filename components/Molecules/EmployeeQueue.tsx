"use client";

import { fetchBusinessBySlug, getQueue } from "@/database/queries";
import { HourglassIcon } from "lucide-react";
import { UnwrapPromise } from "next/dist/lib/coalesced-function";
import { useEffect, useState } from "react";
import QueueCard from "./QueueCard";
import { Button } from "../ui/button";

export type BusinessDataType = UnwrapPromise<
  ReturnType<typeof fetchBusinessBySlug>
>;
export type QueueEntryData = UnwrapPromise<ReturnType<typeof getQueue>>;

interface EmployeeQueueProps {
  service_id: string;
  businessData: BusinessDataType;
}

const EmployeeQueue = ({ service_id, businessData }: EmployeeQueueProps) => {
  const [queue, setQueue] = useState<QueueEntryData>(null);

  useEffect(() => {
    async function getQueueData() {
      const queueData = (await getQueue(service_id ?? "")) ?? [];
      var sortedQueue = queueData.sort(
        (a, b) =>
          a.queue_entries.updated_at.getTime() -
          b.queue_entries.updated_at.getTime(),
      );

      setQueue(sortedQueue);
    }

    getQueueData();
  }, [service_id]);

  async function organizeQueue() {
    console.log(
      businessData?.business.latitude,
      businessData?.business.longitude,
    );
    let question = `
    ${JSON.stringify(
      queue,
    )}
Reorder the provided queue entries based on the proximity of users to our business located at latitude ${businessData
      ?.business.latitude} and longitude ${businessData?.business
      .longitude} by comparing it to each user's latitude and longitude in the items users object using the harvensine formula. Each entry in the queue should be reordered from closest to farthest user. Maintain the original structure of each queue entry (each enty is an object and within it are the objects "queue_entries" and "users") in the JSON response.

      the result must be of type: {"result": Array<{
        "queue_entries": {
            "entry_id": String,
            "service_id": String,
            "user_id": String,
            "entry_time": Date,
            "status": "waiting",
            "present": boolean,
            "created_at": Date,
            "updated_at": Date
        },
        "users": {
            "user_id": String,
            "username": String,
            "role": String,
            "city": String,
            "longitude_user": String,
            "latitude_user": String,
            "created_at": Date,
            "updated_at": Date
        }
      }>}
      Conditions:
      - Your response MUST BE A JSON!
      - Your JSON must have the same number of elements!
`;

    console.log(question)

    let smartQueue = undefined;

    while(smartQueue == undefined){
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ content: question, role: "user" }],
          response_format: { type: "json_object" },
        }),
      });

      

      if (!response.ok) {
        throw new Error("Failed to fetch response from OpenAI API");
      }
      // Read the response body as text
      const responseBodyText = await response.text();
      console.log(responseBodyText)
      // Parse the response body text as JSON
      const responseData = JSON.parse(responseBodyText);
      // console.log(
      //   "Response from OpenAI:",
      //   responseData.choices[0].message.content,
      // );

      smartQueue = JSON.parse(responseData.choices[0].message.content)
        .result as typeof queue;
    }

    console.log("old", queue);
    console.log("new", smartQueue);
    setQueue(smartQueue);
  }
  return (
    <>
      <Button
        onClick={() => organizeQueue()}
        className="absolute -top-[12px] left-1/2 transform -translate-x-1/2 flex h-max w-[400px]"
      >
        Smart AI Reorganize Queue
      </Button>
      {queue &&
        queue.length > 0 &&
        queue.map((card, index) => (
          <QueueCard
            key={index}
            name={card.users.username}
            isPresent={card.queue_entries.present ?? false}
            source={"Web"}
            position={index + 1}
          />
        ))}

      {queue && queue.length === 0 && (
        <div className="relative flex h-[157px] w-full min-w-[400px] flex-col justify-center rounded bg-white">
          <HourglassIcon
            size={80}
            className="mb-2 w-full text-center text-neutral-400"
          />
          <p className="text-center text-xl font-bold text-neutral-400">
            No one in the queue for the moment.
          </p>
        </div>
      )}
    </>
  );
};

export default EmployeeQueue;
