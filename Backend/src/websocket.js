const socketio = require('socket.io');
const parseStringAsArray = require('./utils/parsestringAsArray');
const calculateDistance = require('./utils/calculateDistance');

const connections = [];

let io;

exports.setupWebsocket = (server) => {
    
    io = socketio(server);

    io.on('connection', soket =>{
        const {latitude, longitude, techs} = soket.handshake.query;
        console.log(soket.handshake.query);
        connections.push({
            id:soket.id,
            coordinates:{
                latitude: Number(latitude),
                longitude:Number(longitude)
            },
            techs: parseStringAsArray(techs)
        });
    });
};

exports.findConnections = ( coordinates, techs) =>{  
    
    return connections.filter(connection =>{
        return calculateDistance(coordinates, connection.coordinates) < 10
        && connection.techs.some(item => techs.includes(item))
    })
};

exports.sendMessage = (to, message, data) =>{
    to.forEach( connection => {
        io.to(connection.id).emit(message, data);
    });
}