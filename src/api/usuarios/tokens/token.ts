import { Usuario } from '../entities/usuario.entity';

export interface Session {
  token: string;
  user: Usuario;
}

// export async function validate(jwt: string): Promise<Session> {
//   return new Promise<Session>((resolve, reject) => {
// // Buscamos el token en redis
// cache.get(jwt, (error, data) => {
//   if (error) throw error;
//   if (data) {
// return resolve({
//   token: jwt,
//   user: JSON.parse(data) as GetUserDto,
// });
//   }
// });

// // Si no está en redis lo traemos del servicio auth
// const user = axios
//   .get<GetUserDto>(`${config.AUTH_API}/current`, {
// headers: {
//   Authorization: jwt,
// },
//   })
//   .then((res) => {
// cache.setex(jwt, Number(config.REDIS_EXP), JSON.stringify(res.data));
// resolve({
//   token: jwt,
//   user: res.data,
// });
//   })
//   .catch((err) => {
// reject('Unauthorized ' + err.toString());
//   });
//   });
// }

// export function invalidate(token: string) {
//   if (cache.get(token)) {
// cache.del(token);
// console.log('RabbitMQ session invalidada ' + token);
//   }
// }
