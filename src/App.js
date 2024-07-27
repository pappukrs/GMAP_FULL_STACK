import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const vehicleIcon = (angle) => new L.Icon({
    iconUrl: 'https://vectorified.com/image/car-png-vector-33.png', 
    iconSize: [100, 100], 
    iconAnchor: [50, 50], 
    className: 'rotating-icon', 
});

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
});

const containerStyle = {
    width: '100%',
    height: '100vh'
};

const center = [17.385044, 78.486671]; 


const App = () => {
    const [vehicleData, setVehicleData] = useState([]);
    const [path, setPath] = useState([]);
    const [rotation, setRotation] = useState(0); 

    useEffect(() => {
        const socket = io('http://localhost:3000');

        socket.on('vehicleLocation', (data) => {
            setVehicleData(prevData => [...prevData, data]);
            console.log("data", data);
        });

        socket.on('alka', (data) => {
            console.log("alka", data);
        });

        return () => socket.disconnect();
    }, []);

    useEffect(() => {
        if (vehicleData.length) {
            const newPath = vehicleData.map(point => [point.latitude, point.longitude]);
            setPath(newPath);
            console.log("path", newPath);
            
            
            if (newPath.length > 1) {
                const angle = getAngle(newPath[newPath.length - 2], newPath[newPath.length - 1]);
                setRotation(angle);
            }
        }
    }, [vehicleData]);

    const getAngle = (prev, current) => {
        const latDiff = current[0] - prev[0];
        const lngDiff = current[1] - prev[1];
        return Math.atan2(latDiff, lngDiff) * (180 / Math.PI); 
    };

    const MapUpdater = () => {
        const map = useMap();
        const prevPathLength = useRef(path.length);

        useEffect(() => {
            if (path.length) {
                
                map.setView(path[path.length - 1], 15); 
                prevPathLength.current = path.length;
            }
        }, [path, map]);

        return null;
    };

    return (
        <div style={containerStyle}>
            <MapContainer center={center} zoom={15} style={containerStyle}>
                <MapUpdater />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {path.length > 0 && (
                    <>
                        <Marker 
                            position={path[path.length - 1]} 
                            icon={vehicleIcon(rotation)} 
                            rotationAngle={rotation} 
                        />
                        <Polyline positions={path} color="red" />
                    </>
                )}
            </MapContainer>
        </div>
    );
};

export default App;
