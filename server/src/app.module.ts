import { Controller, Get, Module, Post } from '@nestjs/common';
import { RoomsGateway } from './rooms.gateway';
import { RoomsService } from './rooms.service';

@Controller()
export class AppController {
  constructor(private readonly rooms: RoomsService) {}

  @Get('health')
  health(): { status: string } {
    return { status: 'ok' };
  }

  @Post('rooms')
  createRoom(): { roomId: string } {
    const room = this.rooms.createRoom();
    return { roomId: room.id };
  }
}

@Module({
  controllers: [AppController],
  providers: [RoomsService, RoomsGateway],
})
export class AppModule {}
