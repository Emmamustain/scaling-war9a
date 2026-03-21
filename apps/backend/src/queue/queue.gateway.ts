import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export type QueuePositionUpdate = {
  entryId: string;
  serviceId: string;
  position: number;
  estimatedWaitMinutes: number;
  /** Unix ms — client counts down to this timestamp */
  deadlineAt: number;
  status: string;
};

export type QueueCalledEvent = {
  entryId: string;
  serviceId: string;
  guichetName: string;
  userId?: string;
};

export type QueueStatusChange = {
  serviceId: string;
  businessId: string;
  status: 'open' | 'closed' | 'paused';
  waitingCount: number;
};

export type QueueSnapshot = {
  serviceId: string;
  entries: unknown[];
  total: number;
  hasMore: boolean;
};

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/queue',
})
export class QueueGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(QueueGateway.name);
  private readonly MAX_SERVICE_SUBSCRIPTIONS = 5;

  handleConnection(client: Socket) {
    this.logger.debug(`client_connected id=${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`client_disconnected id=${client.id}`);
  }

  private getServiceRoomCount(client: Socket): number {
    return [...client.rooms].filter((r) => r.startsWith('service:')).length;
  }

  @SubscribeMessage('subscribe:service')
  async handleSubscribeService(
    @MessageBody() data: { serviceId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (this.getServiceRoomCount(client) >= this.MAX_SERVICE_SUBSCRIPTIONS) {
      return { event: 'error', data: { message: 'Max service subscriptions reached', code: 'SUBSCRIPTION_LIMIT' } };
    }
    await client.join(`service:${data.serviceId}`);
    this.logger.debug(`client_subscribed_service id=${client.id} serviceId=${data.serviceId}`);
    return { event: 'subscribed', data: { serviceId: data.serviceId } };
  }

  @SubscribeMessage('subscribe:entry')
  async handleSubscribeEntry(
    @MessageBody() data: { entryId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(`entry:${data.entryId}`);
    return { event: 'subscribed', data: { entryId: data.entryId } };
  }

  @SubscribeMessage('subscribe:business')
  async handleSubscribeBusiness(
    @MessageBody() data: { businessId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(`business:${data.businessId}`);
    return { event: 'subscribed', data: { businessId: data.businessId } };
  }

  @SubscribeMessage('unsubscribe:service')
  async handleUnsubscribeService(
    @MessageBody() data: { serviceId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(`service:${data.serviceId}`);
    return { event: 'unsubscribed', data: { serviceId: data.serviceId } };
  }

  /** Individual entry-room update — keeps personal queue tracker in sync */
  broadcastPositionUpdate(update: QueuePositionUpdate) {
    this.server.to(`entry:${update.entryId}`).emit('queue:position-update', update);
  }

  /** Personal "it's your turn" notification — entry room only */
  broadcastQueueCalled(event: QueueCalledEvent) {
    this.server.to(`entry:${event.entryId}`).emit('queue:called', event);
  }

  /** Personal "you've been served" notification — entry room only */
  broadcastEntryServed(event: { entryId: string; serviceId: string }) {
    this.server.to(`entry:${event.entryId}`).emit('queue:served', event);
  }

  /** Full queue snapshot — replaces per-event invalidation on the service room */
  broadcastQueueSnapshot(snapshot: QueueSnapshot) {
    this.server.to(`service:${snapshot.serviceId}`).emit('queue:snapshot', snapshot);
  }

  broadcastServiceStatusChange(event: QueueStatusChange) {
    this.server
      .to(`service:${event.serviceId}`)
      .emit('queue:status-change', event);
    this.server
      .to(`business:${event.businessId}`)
      .emit('queue:status-change', event);
  }
}
