import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DrizzleDB, schema } from '@shared/drizzle';
import { and, eq, gte } from '@shared/drizzle/operators';
import { DRIZZLE } from '../drizzle/drizzle.module';

@Injectable()
export class AppointmentsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async getMyAppointments(userId: string) {
    return this.db.query.appointments.findMany({
      where: and(
        eq(schema.appointments.userId, userId),
        gte(schema.appointments.scheduledAt, new Date()),
      ),
      with: {
        service: {
          with: { business: { columns: { id: true, name: true, logoUrl: true, location: true } } },
        },
      },
      orderBy: (a, { asc }) => [asc(a.scheduledAt)],
    });
  }

  async book(
    userId: string,
    data: {
      serviceId: string;
      scheduledAt: Date;
      durationMinutes?: number;
      notes?: string;
    },
  ) {
    const [appointment] = await this.db
      .insert(schema.appointments)
      .values({
        userId,
        ...data,
        status: 'scheduled',
      })
      .returning();
    return appointment;
  }

  async cancel(appointmentId: string, userId: string) {
    const appointment = await this.db.query.appointments.findFirst({
      where: and(
        eq(schema.appointments.id, appointmentId),
        eq(schema.appointments.userId, userId),
      ),
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    const [updated] = await this.db
      .update(schema.appointments)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(schema.appointments.id, appointmentId))
      .returning();
    return updated;
  }

  async getServiceAvailability(serviceId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const booked = await this.db.query.appointments.findMany({
      where: and(
        eq(schema.appointments.serviceId, serviceId),
        gte(schema.appointments.scheduledAt, startOfDay),
      ),
      columns: { scheduledAt: true, durationMinutes: true },
    });

    return { booked };
  }
}
