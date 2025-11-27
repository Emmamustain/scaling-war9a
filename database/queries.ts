"use server";

import { and, eq, ilike, placeholder } from "drizzle-orm";
import { db } from ".";
import {
  business_categories,
  business_services,
  business_workers,
  businesses,
  categories,
  guichet_services,
  guichet_workers,
  notifications,
  queue_entries,
  services,
  user_businesses,
  users,
} from "./schema";
import { getCurrentSession } from "@/utils/get-current-session";

export async function getUserData() {
  const session = await getCurrentSession();

  if (session.data.session !== null) {
    const prepared = await db
      .select()
      .from(users)
      .where(eq(users.user_id, placeholder("session_user_id")))
      .limit(1)
      .prepare("get-user-data");

    const publicUser = await prepared.execute({
      session_user_id: session.data.session?.user.id as string,
    });

    return publicUser[0];
  } else return null;
}

export async function getScore(user_id: string) {
  const preparedworkerData = await db
    .select()
    .from(business_workers)
    .where(eq(business_workers.user_id, placeholder("user_id")))
    .limit(1)

    .prepare("search-score-by-worker-id");
  const query = await preparedworkerData.execute({ user_id });
  if (query.length === 0) {
    return null;
  }
  return query[0].score;
}

export async function getFeaturedBusinesses(limit?: number) {
  limit = limit ?? 3;
  const prepared = db
    .select()
    .from(businesses)
    .where(eq(businesses.featured, true))
    .limit(placeholder("limit"))
    .prepare("get-featured-businesses");
  const query = await prepared.execute({ limit: limit });
  return query;
}

export async function lazyGetClosestBusinesses(
  batchSize?: number,
  offset?: number,
) {
  batchSize = batchSize ?? 8;
  offset = offset ?? 0;
  const prepared = db
    .select()
    .from(businesses)
    .where(
      eq(businesses.city, placeholder("city")),
      // and(
      //   eq(businesses.city, users.city),
      //   eq(users.user_id, placeholder("user_id")),
      // ),
    )

    .orderBy(businesses.created_at)
    .limit(placeholder("limit"))
    .offset(placeholder("offset"))
    .prepare("lazy-get-closest-businesses");
  const userData = await getUserData();
  // const session = await getCurrentSession();
  const query = await prepared.execute({
    limit: batchSize,
    offset: offset,
    city: userData?.city,
  });
  return query;
}

export async function searchBusinessesByName(search: string, limit?: number) {
  limit = limit ?? 100;
  const prepared = db
    .select({
      name: businesses.name,
      business_id: businesses.business_id,
      slug: businesses.slug,
    })
    .from(businesses)
    .where(ilike(businesses.name, placeholder("search")))
    .limit(placeholder("limit"))
    .prepare("search-businesses-by-name");
  const query = await prepared.execute({ limit: limit, search: `%${search}%` });
  return query;
}

export async function fetchBusinessBySlug(slug: string) {
  const preparedBusinessData = db
    .select()
    .from(businesses)
    .where(eq(businesses.slug, placeholder("slug")))
    .limit(1)
    .prepare("fetch-business-by-slug");

  const businessData = await preparedBusinessData.execute({ slug: slug });

  if (businessData.length === 0) {
    return null;
  }

  const preparedCategoryData = db
    .select()
    .from(business_categories)
    .innerJoin(
      categories,
      eq(categories.category_id, business_categories.category_id),
    )
    .where(eq(business_categories.business_id, placeholder("business_id")))
    .prepare("fetch-categories-by-business-id");

  const categoryData = await preparedCategoryData.execute({
    business_id: businessData[0].business_id,
  });

  const result = {
    business: businessData[0],
    categories: categoryData.map((item) => ({
      category_id: item.categories.category_id,
      name: item.categories.name,
    })),
  };

  // console.log(result);
  return result;
}

export async function fetchworkerByuserId(user_id: string) {
  const preparedworkerData = db
    .select()
    .from(business_workers)
    .where(eq(business_workers.user_id, placeholder("user_id")))
    .limit(1)
    .prepare("fetch-worker-id-by-user-id");

  const workerData = await preparedworkerData.execute({ user_id: user_id });

  if (workerData.length === 0) {
    return null;
  }
  return workerData[0].worker_id;
}

export async function getBusinessServices(business_id: string) {
  const prepared = db
    .select({ service_id: services.service_id, name: services.name })
    .from(services)
    .innerJoin(
      business_services,
      eq(services.service_id, business_services.service_id),
    )
    .where(eq(business_services.business_id, placeholder("business_id")))
    .prepare("get-business-services");

  const queryResult = await prepared.execute({ business_id: business_id });

  const servicesData = queryResult.map((row) => ({
    service_id: row.service_id,
    name: row.name,
  }));

  return servicesData;
}

export async function getBusinessServicesAndWorkers(business_id: string) {
  const prepared = db
    .select()
    .from(services)
    .innerJoin(
      business_services,
      eq(services.service_id, business_services.service_id),
    )
    .leftJoin(
      guichet_services,
      eq(services.service_id, guichet_services.service_id),
    )
    .leftJoin(
      guichet_workers,
      eq(guichet_services.guichet_id, guichet_workers.guichet_id),
    )
    .leftJoin(
      business_workers,
      eq(business_workers.user_id, guichet_workers.current_worker_id),
    )
    .leftJoin(users, eq(users.user_id, guichet_workers.current_worker_id))

    .where(eq(business_services.business_id, placeholder("business_id")))
    .prepare("get-business-services");

  const queryResult = await prepared.execute({ business_id: business_id });

  // Group the query result by service_id
  const servicesMap = new Map<string, any>();
  queryResult.forEach(async (row: any) => {
    const service_id = row.services.service_id;
    if (!servicesMap.has(service_id)) {
      servicesMap.set(service_id, {
        service: row.services,
        users: [],
        workers: [],
      });
    }
    const service = servicesMap.get(service_id);
    if (row.users && row.users.user_id) {
      service.users.push(row.users);
    }

    if (row.workers && row.workers.user_id) {
      service.workers.push(row.workers);
    }
  });

  const servicesWithUsersAndWorkers = Array.from(servicesMap.values());

  return servicesWithUsersAndWorkers;
}

export async function getQueue(service_id: string) {
  try {
    const prepared = db
      .select()
      .from(queue_entries)
      .where(eq(queue_entries.service_id, placeholder("service_id")))
      .innerJoin(users, eq(queue_entries.user_id, users.user_id));

    const queueEntries = await prepared.execute({ service_id: service_id });

    return queueEntries;
  } catch (error) {
    console.error("Error in getQueue:", error);
    return null; // Or you can return an empty array or a default value
  }
}

// manager side
export async function getBusinessEmployees(bizid: string, limit?: number) {
  limit = limit ?? 25;
  const preparedBusinessData = db
    .select()
    .from(businesses)
    .where(eq(businesses.slug, placeholder("slug")))
    .limit(1)
    .prepare("fetch-business-by-slug");

  const businessData = await preparedBusinessData.execute({ slug: bizid });

  console.log("businessData", { bizid });

  const prepared = db
    .select()
    .from(business_workers)
    .where(eq(business_workers.business_id, placeholder("business_id")))
    .innerJoin(users, eq(business_workers.user_id, users.user_id))
    .limit(placeholder("limit"))
    .prepare("get-business-employees");
  const query = await prepared.execute({
    business_id: businessData[0].business_id,
    limit: limit,
  });
  return query;
}

export async function searchUsersByName(search: string, limit?: number) {
  limit = limit ?? 100;
  const prepared = db
    .select({
      username: users.username,
      user_id: users.user_id,
      role: users.role,
    })
    .from(users)
    .where(ilike(users.username, placeholder("search")))
    .limit(placeholder("limit"))
    .prepare("search-users-by-name");
  const query = await prepared.execute({ limit: limit, search: `%${search}%` });
  return query;
}

export async function searchServiceByName(
  search: string,
  business_slug: string,
  limit?: number,
) {
  limit = limit ?? 100;
  const preparedBusinessData = db
    .select()
    .from(businesses)
    .where(eq(businesses.slug, placeholder("slug")))
    .limit(1)
    .prepare("fetch-business-by-slug");

  const businessData = await preparedBusinessData.execute({
    slug: business_slug,
  });
  const prepared = db
    .select({
      name: services.name,
      service_id: services.service_id,
    })
    .from(services)
    .innerJoin(
      business_services,
      eq(business_services.service_id, services.service_id),
    )
    .where(
      and(
        eq(business_services.business_id, placeholder("business_id")),
        ilike(services.name, placeholder("search")),
      ),
    )
    .limit(placeholder("limit"))
    .prepare("search-services-by-name");
  const query = await prepared.execute({
    limit: limit,
    search: `%${search}%`,
    business_id: businessData[0].business_id,
  });
  return query;
}

export async function searchWorkersByName(
  search: string,
  business_slug: string,
  limit?: number,
) {
  limit = limit ?? 100;
  const preparedBusinessData = db
    .select()
    .from(businesses)
    .where(eq(businesses.slug, placeholder("slug")))
    .limit(1)
    .prepare("fetch-business-by-slug");

  const businessData = await preparedBusinessData.execute({
    slug: business_slug,
  });

  const prepared = db
    .select({
      username: users.username,
      user_id: users.user_id,
      role: users.role,
    })
    .from(business_workers)
    .innerJoin(users, eq(business_workers.user_id, users.user_id))
    .where(
      and(
        eq(business_workers.business_id, placeholder("business_id")),
        ilike(users.username, placeholder("search")),
      ),
    )
    .limit(placeholder("limit"))
    .prepare("search-workers-by-name");
  const query = await prepared.execute({
    limit: limit,
    search: `%${search}%`,
    business_id: businessData[0].business_id,
  });
  return query;
}

export async function getBusinessByCategories(category_name: string) {
  const prepared = db
    .select()
    .from(businesses)
    .innerJoin(
      business_categories,
      eq(business_categories.business_id, businesses.business_id),
    )
    .innerJoin(
      categories,
      eq(categories.category_id, business_categories.category_id),
    )
    .where(eq(categories.name, placeholder("category_name")))
    .prepare("get-Business-By-Categories");

  const queryResult = await prepared.execute({ category_name: category_name });
  return queryResult;
}

export async function getUserRoleAndBusinessSlug(user_id: string | null) {
  if (!user_id) {
    return null;
  }
  try {
    const userData = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.user_id, placeholder("user_id")))
      .limit(1)
      .execute({ user_id: user_id });

    if (!userData || userData.length === 0) {
      // throw new Error("User not found.");
      return { error: "User not found" };
    }

    const userRole = userData[0].role;

    let businessData;
    if (userRole === "owner") {
      businessData = await db
        .select({ business_slug: businesses.slug })
        .from(businesses)
        .where(eq(businesses.owner_id, placeholder("user_id")))
        .limit(1)
        .execute({ user_id: user_id });
    } else {
      businessData = await db
        .select({ business_slug: businesses.slug })
        .from(business_workers)
        .leftJoin(
          businesses,
          eq(business_workers.business_id, businesses.business_id),
        )
        .where(eq(business_workers.user_id, placeholder("user_id")))
        .limit(1)
        .execute({ user_id: user_id });
    }

    if (!businessData || businessData.length === 0) {
      // throw new Error("Business not found for the worker.");
      return { user_role: userRole, business_slug: null };
    }

    const businessSlug = businessData[0].business_slug;

    return { business_slug: businessSlug, user_role: userRole };
  } catch (error) {
    console.error("Error fetching user role and business slug:", error);
    throw error;
  }
}

export async function getWorkerServiceId(worker_user_id: string) {
  const query = await db
    .select({
      service_id: services.service_id,
      name: services.name,
      avg_time: services.average_time,
    })
    .from(guichet_workers)
    .innerJoin(
      guichet_services,
      eq(guichet_services.guichet_id, guichet_workers.guichet_id),
    )
    .innerJoin(services, eq(services.service_id, guichet_services.service_id))

    .where(eq(guichet_workers.current_worker_id, placeholder("user_id")))
    .execute({ user_id: worker_user_id });
  console.log("Query result:", query[0]);
  return query[0];
}

export async function getAverageTime(service_id: string) {
  const getAvgTime = await db
    .select({ average_time: services.average_time })
    .from(services)
    .where(eq(services.service_id, placeholder("service_id")))
    .prepare("get-estimated-waiting-time");
  const estimated_waiting_time = getAvgTime.execute({ service_id: service_id });
  return estimated_waiting_time;
}

export async function getNotification(user_id: string) {
  if (!user_id) return [];
  const getNotif = await db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.to_user_id, placeholder("to_user_id")),
        eq(notifications.consumed, false),
      ),
    )
    .prepare("get-notifications");
  const revceiveNotif = await getNotif.execute({ to_user_id: user_id });
  return revceiveNotif;
}
