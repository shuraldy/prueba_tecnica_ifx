import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Vm } from '../../domain/entities/vm.entity';
import { VmStats } from '../../domain/repositories/vm.repository.abstract';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:4200',
    credentials: true,
  },
})
export class VmsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  emitVmCreated(vm: Vm) {
    this.server.emit('vm:created', vm);
  }

  emitVmUpdated(vm: Vm) {
    this.server.emit('vm:updated', vm);
  }

  emitVmDeleted(id: string) {
    this.server.emit('vm:deleted', id);
  }

  emitVmStats(stats: VmStats) {
    this.server.emit('vm:stats', stats);
  }
}
