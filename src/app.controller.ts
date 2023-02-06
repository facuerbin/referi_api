import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Inicio')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Get('/v1')
  // // @Redirect('/v1', 301)
  // getDocs(@Query('version') version) {
  //   if (version && version === '1') {
  //     return { url: '/v1' };
  //   }
  // }
}
