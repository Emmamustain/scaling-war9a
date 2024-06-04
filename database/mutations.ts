"use server";
import { createClient } from "@/utils/supabase-server";
import { db } from ".";
import {
  business_services,
  business_workers,
  businesses,
  guichet_services,
  guichet_workers,
  guichets,
  notifications,
  queue_entries,
  services,
  user_businesses,
  users,
} from "./schema";
import { and, eq, asc, placeholder, sql } from "drizzle-orm";
import { UserData } from "@/components/Molecules/ActionQueueWorkerSide";

export async function addUser(user_id: string, username: string) {
  const prepared = db
    .insert(users)
    .values({
      user_id: placeholder("user_id"),
      username: placeholder("username"),
    })
    .prepare("add-user");

  const mutation = await prepared.execute({
    user_id: user_id,
    username: username,
  });

  return mutation;
}

export async function modifyUserProfile(user_id: string, username: string) {
  const prepared = db
    .update(users)
    .set({
      username: placeholder("username") as unknown as string,
    })
    .where(eq(users.user_id, placeholder("user_id")))
    .prepare("add-user");

  const mutation = await prepared.execute({
    user_id: user_id,
    username: username,
  });

  return mutation;
}

export async function addBusiness(
  owner_id: string,
  name: string,
  description: string,
  location: string,
  lat: number,
  lng: number,
  phone: string,
  city: string,
  zip_code: string,
  slug: string,
  image: string,
  cover_image: string,
) {
  slug =
    slug.trim() !== ""
      ? slug.toLowerCase()
      : name.replaceAll(" ", "-").toLowerCase();

  const prepared = db
    .insert(businesses)
    .values({
      owner_id: placeholder("owner_id"),
      name: placeholder("name"),
      description: placeholder("description"),
      location: placeholder("location"),
      latitude: placeholder("lat"),
      longitude : placeholder("lng"),
      phone: placeholder("phone"),
      city: placeholder("city"),
      zip_code: placeholder("zip_code"),
      slug: placeholder("slug"),
      image: placeholder("image"),
      cover_image: placeholder("cover_image"),
    })
    .prepare("add-business");

  try {
    const mutation = await prepared.execute({
      owner_id: owner_id,
      name: name,
      description: description,
      location: location,
      lat: lat,
      lng: lng,
      phone: phone,
      city: city,
      zip_code: zip_code,
      slug: slug,
      image: image,
      cover_image: cover_image,
    });
    return { error: null };
  } catch (e) {
    const error = (e as unknown as { message: string }).message;
    return { error: error };
  }
}

export async function addToQueue(user_id: string, service_id: string) {
  const prepared = db.insert(queue_entries).values({
    user_id: placeholder("user_id"),
    service_id: placeholder("service_id"),
  });

  try {
    const mutation = await prepared.execute({
      user_id: user_id,
      service_id: service_id,
    });
    return { error: null };
  } catch (e) {
    const error = (e as unknown as { message: string }).message;
    return { error: error };
  }
}

export async function removeFromQueue(user_id: string, service_id: string) {
  const prepared = db
    .delete(queue_entries)
    .where(
      and(
        eq(queue_entries.user_id, placeholder("user_id")),
        eq(queue_entries.service_id, placeholder("service_id")),
      ),
    );

  try {
    const mutation = await prepared.execute({
      user_id: user_id,
      service_id: service_id,
    });
    return { error: null };
  } catch (e) {
    const error = (e as unknown as { message: string }).message;
    return { error: error };
  }
}

export async function addUserToBusiness(user_id: string, slug: string) {
  const preparedBusinessData = db
    .select()
    .from(businesses)
    .where(eq(businesses.slug, placeholder("slug")))
    .limit(1)
    .prepare("fetch-business-by-slug");

  const businessData = await preparedBusinessData.execute({ slug: slug });
  const prepared = db.insert(business_workers).values({
    user_id: placeholder("user_id"),
    business_id: placeholder("business_id"),
  });

  try {
    const mutation = await prepared.execute({
      user_id: user_id,
      business_id: businessData[0].business_id,
    });
    return { error: null };
  } catch (e) {
    const error = (e as unknown as { message: string }).message;
    return { error: error };
  }
}

export async function removeWorkerFromBusiness(user_id: string, slug: string) {
  // Fetch the business data based on the provided slug
  const preparedBusinessData = db
    .select()
    .from(businesses)
    .where(eq(businesses.slug, placeholder("slug")))
    .limit(1)
    .prepare("fetch-business-by-slug");

  const businessData = await preparedBusinessData.execute({ slug: slug });

  // If no business is found with the provided slug, return an error
  if (businessData.length === 0) {
    return { error: "business not found" };
  }
  try {
    // Delete the worker entry from the business_workers table
    const prepared = db
      .delete(business_workers)
      .where(
        and(
          eq(business_workers.user_id, placeholder("user_id")),
          eq(business_workers.business_id, placeholder("business_id")),
        ),
      );

    const mutation = await prepared.execute({
      user_id: user_id,
      business_id: businessData[0].business_id,
    });
    return { error: null };
  } catch (e) {
    const error = (e as unknown as { message: string }).message;
    return { error: error };
  }
}

export async function assignWorkerToService(
  worker_id: string,
  service_id: string,
) {
  const prepared = await db
    .select()
    .from(guichet_workers)
    .where(eq(guichet_workers.current_worker_id, placeholder("worker_id")))
    .prepare("check-worker");

  const query = await prepared.execute({ worker_id: worker_id });
  console.log(query.length);
  if (query.length > 0) {
    return false;
  }
  const preparedCreateGuichet = db
    .insert(guichets)
    .values({ name: placeholder("guichet_name") })
    .returning();
  const guichetData = await preparedCreateGuichet.execute({
    guichet_name: "for_" + worker_id,
  });

  const preparedAssociateGuichetToService = db.insert(guichet_services).values({
    guichet_id: placeholder("guichet_id"),
    service_id: placeholder("service_id"),
  });

  const gsData = await preparedAssociateGuichetToService.execute({
    guichet_id: guichetData[0].guichet_id,
    service_id: service_id,
  });

  const preparedAssociateWorkerToGuichet = db.insert(guichet_workers).values({
    guichet_id: placeholder("guichet_id"),
    current_worker_id: placeholder("current_worker_id"),
  });

  const mutation = await preparedAssociateWorkerToGuichet.execute({
    guichet_id: guichetData[0].guichet_id,
    current_worker_id: worker_id,
  });
}

export async function removeWorkerFromService(
  worker_id: string,
  service_id: string,
  user_id: string,
) {
  console.log("worker_id", worker_id);
  console.log("service_id", service_id);
  console.log("user_id", user_id);

  try {
    // Fetch the guichet_id associated with the provided service_id
    const preparedGuichetData = db
      .select({ guichet_id: guichet_services.guichet_id })
      .from(guichet_services)
      .where(eq(guichet_services.service_id, placeholder("service_id")))
      .limit(1)
      .prepare("fetch-guichet-id-by-service-id");

    const guichetData = await preparedGuichetData.execute({
      service_id: service_id,
    });

    console.log("guichetData", guichetData);

    // If no guichet is found for the service, return an error
    if (guichetData.length === 0) {
      return { error: "Guichet not found for the service" };
    }

    // Delete the association between the worker and the guichet from the guichet_workers table
    const preparedDeleteWorkerFromGuichet = db
      .delete(guichet_workers)
      .where(
        and(
          eq(guichet_workers.current_worker_id, placeholder("worker_id")),
          eq(guichet_workers.guichet_id, placeholder("guichet_id")),
        ),
      )
      .prepare("delete-worker-from-guichet");

    await preparedDeleteWorkerFromGuichet.execute({
      guichet_id: guichetData[0].guichet_id,
      worker_id: user_id,
    });

    // Delete the association between the guichet and the service from the guichet_services table
    const preparedDeleteServiceFromGuichet = db
      .delete(guichet_services)
      .where(
        and(
          eq(guichet_services.service_id, placeholder("service_id")),
          eq(guichet_services.guichet_id, placeholder("guichet_id")),
        ),
      )
      .prepare("delete-service-from-guichet");

    await preparedDeleteServiceFromGuichet.execute({
      guichet_id: guichetData[0].guichet_id,
      service_id: service_id, //
    });

    return { success: true };
  } catch (error) {
    console.error("Error removing worker from service:", error);
    return { error: "Failed to remove worker from service" };
  }
}

export async function incrementWorkerScore(user_id: string): Promise<void> {
  try {
    // Increment the score for the specific worker
    const prepareincrementWorkerScore = await db
      .update(business_workers)
      .set({ score: sql`${business_workers.score} + 1` })
      .where(eq(business_workers.user_id, placeholder("user_id")))
      .prepare("increment-score-of-workers");

    const incScore = prepareincrementWorkerScore.execute({
      user_id: user_id,
    });

    console.log("Worker's score incremented successfully.");
  } catch (error) {
    console.error("Error incrementing worker's score:", error);
    throw error;
  }
}

// export async function removeUserFromService(service_id: string) {

export type UserRole =
  | "regular"
  | "owner"
  | "manager"
  | "worker"
  | "super"
  | "admin"
  | "founder";
// Change Worker to Manager
export async function changeEmployeeRole(worker_id: string, role: UserRole) {
  // Update the role of the user to manager in the user_businesses table
  const updateWorker = db
    .update(business_workers)
    .set({ role: placeholder("role") as unknown as UserRole })
    .where(eq(business_workers.worker_id, placeholder("worker_id")))
    .returning()
    .prepare("change-worker-role");

  const updateUsers = db
    .update(users)
    .set({ role: placeholder("role") as unknown as UserRole })
    .where(eq(users.user_id, placeholder("user_id")))
    .prepare("change-user-role");

  try {
    const execUpdateWorker = await updateWorker.execute({
      role: role,
      worker_id: worker_id,
    });
    const execUpdateUsers = await updateUsers.execute({
      role: role,
      user_id: execUpdateWorker[0].user_id,
    });
    return { error: null };
  } catch (e) {
    const error = (e as unknown as { message: string }).message;
    return { error };
  }
}

export async function addServiceToBusiness(serviceName: string, slug: string) {
  // Fetch the business data by slug
  const businessData = await db
    .select()
    .from(businesses)
    .where(eq(businesses.slug, placeholder("slug")))
    .limit(1)
    .execute({ slug: slug });

  if (!businessData || businessData.length === 0) {
    return { error: "Business not found" };
  }

  const business_id = businessData[0].business_id;

  try {
    // Insert service into services table
    const serviceData = await db
      .insert(services)
      .values({
        name: placeholder("serviceName"),
      })
      .returning() // Return all fields for the inserted row
      .prepare("add-new-service");

    const serviceexec = await serviceData.execute({ serviceName: serviceName });

    const service_id = serviceexec[0].service_id;

    // Insert association into business_services table
    const prepare = await db
      .insert(business_services)
      .values({
        business_id: placeholder("business_id"),
        service_id: placeholder("service_id"),
      })
      .prepare("associate-service-to-business");

    const assservice = await prepare.execute({
      business_id: business_id,
      service_id: service_id,
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding service to business:", error);
    return { error: "Failed to add service to business" };
  }
}

export async function removeServiceFromBusiness(
  service_id: string,
  slug: string,
) {
  try {
    // Fetch the business data by slug
    const businessData = await db
      .select({ business_id: businesses.business_id })
      .from(businesses)
      .where(eq(businesses.slug, placeholder("slug")))
      .limit(1)
      .prepare("get-business-by-slug");

    const businessResult = await businessData.execute({ slug });

    if (!businessResult || businessResult.length === 0) {
      return { error: "Business not found" };
    }

    const business_id = businessResult[0].business_id;

    // Remove association from business_services table
    const removeAssociation = await db
      .delete(business_services)
      .where(
        and(
          eq(business_services.business_id, placeholder("business_id")),
          eq(business_services.service_id, placeholder("service_id")),
        ),
      )
      .prepare("remove-association");

    await removeAssociation.execute({ business_id, service_id });

    // Delete the service from the services table
    const deleteService = await db
      .delete(services)
      .where(eq(services.service_id, placeholder("service_id")))
      .prepare("remove-service");

    await deleteService.execute({ service_id });

    return { success: true };
  } catch (error) {
    console.error("Error removing service from business:", error);
    return { error: "Failed to remove service from business" };
  }
}

// // Worker side
export async function removeUserFromQueue(
  user_id: string,
  next_users: (UserData | null)[],
) {
  // Delete the worker entry from the business_workers table
  const prepared = await db
    .delete(queue_entries)
    .where(eq(queue_entries.user_id, placeholder("user_id")))
    .returning()
    .prepare("remove-from-queue");

  try {
    const mutation = await prepared.execute({
      user_id: user_id,
    });

    // Calculate AvgTime
    const currentTime = new Date();
    const entryTime = new Date(mutation[0].created_at);

    const differenceMilliseconds = currentTime.getTime() - entryTime.getTime();
    const differenceSeconds = differenceMilliseconds / 1000;

    const service_id = mutation[0].service_id;

    // get service row, then do average_time + differenceSeconds / 2 and then put it inside average_time
    // get service row
    const serviceRow = await db
      .select({ average_time: services.average_time })
      .from(services)
      .where(eq(services.service_id, placeholder("service_id")))
      .limit(1)
      .execute({ service_id: service_id });

    //Doing average _time + differenceSeconds / 2
    const average_time = serviceRow[0].average_time
      ? parseFloat(serviceRow[0].average_time)
      : 0;

    const estimated_waiting_time = (average_time + differenceSeconds) / 2;
    console.log("estimated_waiting_time:", estimated_waiting_time);

    // put it inside average_time
    const avgTimeFromServices = await db
      .update(services)
      .set({ average_time: sql`${estimated_waiting_time}` })
      .where(eq(services.service_id, placeholder("service_id")))
      .prepare("update-average-time");
    await avgTimeFromServices.execute({ service_id: service_id });

    const addNotif = await db
      .insert(notifications)
      .values({
        to_user_id: placeholder("to_user_id"),
        message: placeholder("message"),
      })
      .prepare("add-notification");

    next_users.forEach(async (user, index) => {
      let message = "";
      switch (index) {
        case 0:
          message =
            "Your turn has arrived. You have to be present in 5 minutes or else you will forfeit your position.";
          break;
        case 1:
          message = `Average time remaining: ${Math.floor(estimated_waiting_time / 3600)} minutes.`;
          break;
        case 2:
          message = `Average time remaining: ${
            Math.floor(estimated_waiting_time * 2 /  3600)
          } minutes.`;
          break;
        case 3:
          message = `Average time remaining:  ${
            Math.floor(estimated_waiting_time * 3 /  3600)
          } minutes.`;
          break;
        case 4:
          message = `Average time remaining: ${
            Math.floor(estimated_waiting_time * 4 /  3600)
          } minutes.`;
          break;
        default:
          message = "Notification message not specified.";
      }
      await addNotif.execute({
        to_user_id: user?.user_id,
        message: message,
      });
    });

    return { error: null };
  } catch (e) {
    const error = (e as unknown as { message: string }).message;
    return { error: error };
  }
}

export async function markAsRead(user_id: string) {
  const markAsRead = await db
    .update(notifications)
    .set({ consumed: true })
    .where(eq(notifications.to_user_id, placeholder("to_user_id")))
    .prepare("mark-as-read");

  const markAsReadQuery = await markAsRead.execute({ to_user_id: user_id }); // Execute the query to mark notifications as read

  return markAsReadQuery;
}
