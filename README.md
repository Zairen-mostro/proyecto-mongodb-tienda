# Tienda MongoDB 7

Proyecto final de Base de Datos Avanzado: aplicacion web con login real, dos CRUD completos y persistencia en MongoDB 7.

Tema: Tienda.  
Entidad 1: Cliente.  
Entidad 2: Pedido.

## Modelo de datos

La coleccion `customers` guarda clientes con nombre, email, telefono, estado y notas.

La coleccion `orders` guarda pedidos con producto, cantidad, precio unitario, estado, notas y el campo `customer`, que referencia a un cliente mediante `ObjectId`.

Elegí referencia porque un cliente puede tener muchos pedidos. Si el cliente cambia su telefono o email, no conviene actualizar datos duplicados dentro de todos sus pedidos.

## Indices y validacion

`User.email` y `Customer.email` tienen indice unico. Tambien hay indices para consultar pedidos por cliente y por estado.

Mongoose valida campos obligatorios, formatos de email, minimos numericos y valores permitidos en estados.

## Variables de entorno

Copia `.env.example` a `.env.local` y ajusta:

```bash
MONGODB_URI="mongodb+srv://usuario:password@cluster.mongodb.net/tienda_mongodb?retryWrites=true&w=majority"
AUTH_SECRET="una-clave-larga-y-aleatoria"
```

## Correr localmente

```bash
npm install
npm run seed
npm run dev
```

Usuario de prueba:

```text
demo@demo.com / Demo1234
```

## Version de MongoDB

Confirmar en MongoDB Atlas que el cluster reporta version 7.0.x.

## Despliegue

La app esta preparada para Vercel. En Vercel agrega las variables `MONGODB_URI` y `AUTH_SECRET`, despliega desde GitHub y ejecuta el seed localmente apuntando a Atlas antes de entregar.

## Ficha de entrega

NOMBRE COMPLETO:  
MATRICULA:  
CARRERA:  
GRUPO:  
TEMA: Tienda  
URL DESPLEGADA:  
REPOSITORIO GITHUB:  
USUARIO DEMO: demo@demo.com / Demo1234  
ENTIDAD 1: Cliente   ENTIDAD 2: Pedido  
RELACION: Referencia (ObjectId)  
VERSION MONGODB CONFIRMADA: 7.0.x  
INDICE DECLARADO: `Customer.email` unique  
