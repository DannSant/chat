const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios')

const { crearMensaje } = require('../utils/utils');

let usuarios = new Usuarios();

io.on('connection', (client) => {

    client.on("entrarChat", (usuario, callback) => {

        if (!usuario.nombre || !usuario.sala) {
            return callback("el nombre y la sala es necesario");
        }

        client.join(usuario.sala);

        let personas = usuarios.agregarPersona(client.id, usuario.nombre, usuario.sala);

        client.broadcast.to(usuario.sala).emit("listaPersonas", usuarios.getPersonasPorSala(usuario.sala));
        client.broadcast.to(usuario.sala).emit("crearMensaje", crearMensaje("admin", `${usuario.nombre} ha entrado al chat`));

        callback(usuarios.getPersonasPorSala(usuario.sala));
    })

    client.on("crearMensaje", (data, callback) => {

        let persona = usuarios.getPersona(client.id);
        let mensaje = crearMensaje(persona.nombre, data.mensaje);

        client.broadcast.to(persona.sala).emit("crearMensaje", mensaje);
        callback(mensaje);

    });

    client.on("disconnect", () => {
        let personaBorrada = usuarios.borrarPersona(client.id);

        client.broadcast.to(personaBorrada.sala).emit("crearMensaje", crearMensaje("admin", `${personaBorrada.nombre} ha salido del chat`));
        client.broadcast.to(personaBorrada.sala).emit("listaPersonas", usuarios.getPersonasPorSala(personaBorrada.sala));

    });

    //mensajes privadis
    client.on("mensajePrivado", data => {

        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit("mensajePrivado", crearMensaje(persona.nombre, data.mensaje));
    });



});