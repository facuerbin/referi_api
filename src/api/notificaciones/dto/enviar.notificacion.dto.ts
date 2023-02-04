export class EnviarNotifiacionDto {
  idRemitente: string;
  tipoRemitente: string;
  idDestinatario?: string;
  tipoDestinatario: string;
  titulo: string;
  cuerpo: string;
}
