import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizacionDto } from './create-organizacione.dto';

export class UpdateOrganizacionDto extends PartialType(CreateOrganizacionDto) {}
