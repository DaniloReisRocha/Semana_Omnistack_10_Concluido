const axios = require('axios');
const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parsestringAsArray');
const {findConnections, sendMessage} = require('../websocket');
module.exports = {

    async index(req, res){
        const devs = await Dev.find();

        return res.json(devs);
    },

    async store (req, res){
        const {github_username, techs, latitude, longitude} = req.body;
        
        let dev = await Dev.findOne({github_username});
        
        if(!dev){
            const response =  await axios.get(`http://api.github.com/users/${github_username}`);
        
            const {name = login, avatar_url, bio } = response.data;
            const techsArray = parseStringAsArray(techs);
            const location = {
                type:'Point',
                coordinates:[longitude, latitude]
            }
            dev = await Dev.create({
                github_username,
                name,
                avatar_url,
                bio,
                techs:techsArray,
                location
            })
            const sendSocketmessageTo = findConnections(
                {latitude, longitude},
                techsArray
            )
            sendMessage(sendSocketmessageTo, 'newDev', dev);
        }
        else{
            dev = 'ERRO!'
        }
        return res.json(dev);
    },

    async update(req, res){

        const {id} = req.params;
        const {techs, bio,latitude, longitude} = req.body;
        const techsArray = parseStringAsArray(techs)
        const location = {
            type:'Point',
            coordinates:[longitude, latitude]
        }

        await Dev.updateOne({ _id: id },{ $set:{
            location,
            bio,
            techs:techsArray
        }});

        return res.json("Salvo!");
    },
    
    async destroy(req, res){
        const {id} = req.params;

        await Dev.deleteOne({ _id: id });
        return res.json("Deletado!");
    }
}