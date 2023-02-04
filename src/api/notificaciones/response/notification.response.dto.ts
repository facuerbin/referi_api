export class DestinatarioNotificacion {
  id: string;
  fechaLectura: Date | null;
  destinatario: {
    id: string;
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    dni: number;
    telefono: string;
    verificado: boolean;
    fechaNacimiento: Date;
    fotoPerfil: string;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    fechaBaja: Date | null;
  };
}

export class NotificationResponseSchema {
  id: string;
  idRemitente: string;
  nombreRemitente: string;
  tipoRemitente: string;
  tipoDestinatario: string;
  titulo: string;
  cuerpo: string;
  fecha: Date;
  destinatarios: DestinatarioNotificacion[];
}
