import React, { useState,useEffect} from 'react';
import {StyleSheet, Image, Text, TextInput, TouchableOpacity, View} from 'react-native'
import MapView, {Marker, Callout} from 'react-native-maps';
import { requestPermissionsAsync, getCurrentPositionAsync } from 'expo-location';
import {MaterialIcons} from '@expo/vector-icons'
import api from '../services/api';
import {connect, disconnect, newdevinsert} from '../services/socket';

export default function Main({navigation}){

    const [currentRegion, setCurrentRegion] =  useState(null);
    const [devs, setDevs] =  useState([]);
    const [techs, setTechs] =  useState('');
    
    useEffect(()=>{
        async function loadInitialPosition(){
            const { granted } = await requestPermissionsAsync();
            if(granted){
                const { coords } = await getCurrentPositionAsync({
                    enableHighAccuracy: true
                });
                const {latitude, longitude} = coords;
                
                setCurrentRegion({
                    latitude,
                    longitude,
                    latitudeDelta:0.04,
                    longitudeDelta:0.04
                });
            }
        }
        loadInitialPosition();  
    },[]);

    useEffect(()=>{
        newdevinsert( dev =>setDevs([...devs,dev]));
    },[devs]);

    if(!currentRegion){
        return null;
    }

    function handleRegionChange(region){
        setCurrentRegion(region);
    }

    function setupWebsocket(){
        disconnect();

        const {latitude, longitude} = currentRegion;
        
        connect(
            latitude,
            longitude,
            techs
        );
    }

    async function serchDevs(){
        const {latitude, longitude} = currentRegion;
        const response = await api.get('/search',{
            params:{
                latitude,
                longitude,
                techs
            }
        });

        setDevs(response.data.devs);
        setupWebsocket();
    }

    return(
        <>
        <MapView onRegionChangeComplete={handleRegionChange} initialRegion= { currentRegion } style={[ Styles.map ]}>
            {devs.map(d=>(
            <Marker key={d._id} coordinate ={{ 
                latitude: d.location.coordinates[1], 
                longitude: d.location.coordinates[0] 
                }}>
                <Image style={[Styles.avatar]} source={{uri: d.avatar_url}} />
                <Callout style ={Styles.call} onPress={() =>{navigation.navigate('Profile', {github_username:d.github_username})}}>
                <Text style ={Styles.devName}>{d.github_username}</Text>
                    <Text style ={Styles.devBio}> {d.bio} </Text>
                    <Text style ={Styles.devTechs}> {d.techs.join(',')} </Text>
                </Callout>
            </Marker>    
            ))}
        </MapView>
        <View style={Styles.form}>
            <TextInput
                style={Styles.tinput}
                placeholder ='Buscar devs por tecnologias...'
                placeholderTextColor ='#666'
                autoCapitalize='words'
                autoCorrect = {false}
                value={techs}
                onChangeText ={setTechs}
            />
            <TouchableOpacity onPress={serchDevs} style={Styles.searchButton}>
                <MaterialIcons name ='my-location' size ={20} color='#FFF' />
            </TouchableOpacity>
        </View>
        </>
    );
}

const Styles = StyleSheet.create({
    map:{
        flex: 1,
    },
    avatar:{
        width:54,
        height:54,
        borderRadius:50,
        borderWidth:4,
        borderColor:'#FFF'
    },
    call:{
        width:260
    },
    devName:{
        fontWeight:'bold'
    },
    devBio:{
        color:'#666',
        marginTop: 5
    },
    devTechs:{
        marginTop:5
    },
    form:{
        position:'absolute',
        flexDirection:'row',
        top:20,
        marginHorizontal:20,
        zIndex:5
    },
    tinput:{
        flex:1,
        height:50,
        backgroundColor:'#FFF',
        borderRadius:25,
        paddingHorizontal:20,
        fontSize: 16,
        elevation: 3
    },
    searchButton:{
        width:50,
        height:50,
        backgroundColor:'#8E4DFF',
        borderRadius: 25,
        justifyContent:'center',
        alignItems:'center',
        marginLeft: 15
    }
})