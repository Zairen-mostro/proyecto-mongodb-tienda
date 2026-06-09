# Guia para el documento de evidencia

## Parte 1: explicacion escrita

Mi modelo de datos:

- `Customer`: representa clientes. Guarda `name`, `email`, `phone`, `status` y `notes`.
- `Order`: representa pedidos. Guarda `customer`, `product`, `quantity`, `unitPrice`, `status` y `notes`.

Mi relacion:

Uso referencia con `ObjectId` desde `Order.customer` hacia `Customer`. Lo elegi porque un cliente puede tener muchos pedidos y asi evito duplicar todos los datos del cliente en cada pedido.

Un CRUD paso a paso:

Cuando presiono Guardar cliente, el formulario manda los datos a una Server Action de Next.js. La accion valida que exista una sesion, conecta con MongoDB usando Mongoose y crea el documento en la coleccion `customers`. Despues redirige al listado. Al recargar, el registro sigue ahi porque fue guardado en MongoDB, no en memoria.

Uso de IA:

Use IA como asistente para generar una base del proyecto, revisar la rubrica y organizar los pasos de despliegue. Una decision que debo explicar con mis palabras es por que use referencia `ObjectId` entre pedidos y clientes.

## Capturas obligatorias

1. Login con `demo@demo.com`.
2. Formulario de creacion y registro nuevo en el listado.
3. Mismo registro despues de recargar la pagina.
4. Registro editado y confirmacion de borrado.
5. Atlas mostrando MongoDB 7.0.x.
6. Data Explorer de Atlas mostrando documentos reales en `customers` y `orders`.
