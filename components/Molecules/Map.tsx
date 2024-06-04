"use client"
import React, { useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup,useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from "leaflet"
import { useRouter } from 'next/navigation'

interface MapProps {
  center?: {lat:number, lng: number};
  marker?: {lat:number, lng: number};
  zoom?: number;
}

export default function Map({center={lat:36.896765,lng:7.748155}, marker, zoom=13}:MapProps){
    const mapRef = useRef(null);
  



    return <div  className='bg-emerald-300 h-full w-full'>
      <MapContainer center={center} zoom={zoom} ref={mapRef} className='bg-emerald-300 h-full w-full'>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    />
  
    <CustomMarker m={marker} />
  </MapContainer>
    </div>
}


interface CustomMarkerProps {
  m?: {lat:number, lng: number};
}

function CustomMarker({m}:CustomMarkerProps){
  const [marker, setMarker] = useState({lat:36.896765,lng:7.748155})

  const router = useRouter();

  const myIcon = L.icon({
    iconUrl: "/images/marker.svg",
    iconSize: [64,64],
    iconAnchor: [32, 64],
});

const map = useMapEvents({
  click: async(e) => {
    map.locate()
    setMarker(e.latlng)
    const addy = await ( await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${e.latlng.lat}&lon=${e.latlng.lng}&format=json`)).json()
    console.log(e);
    if(!m || m.lat == null){
      router.replace("/forms/join-as-business?lat="+e.latlng.lat+"&lng="+e.latlng.lng+"&addy="+addy.display_name);
    }
  },
})

  return     <Marker position={m && m.lat != null ? m : marker} icon={myIcon}>
      
  </Marker>
}