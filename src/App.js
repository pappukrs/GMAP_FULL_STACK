import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import io from 'socket.io-client';

const containerStyle = {
    width: '100%',
    height: '100vh'
};

const center = {
    lat: 17.385044,
    lng: 78.486671
};

const App = () => {
    const [vehicleData, setVehicleData] = useState([]);
    const [path, setPath] = useState([]);

    useEffect(() => {
        const socket = io('http://localhost:3000');

        socket.on('vehicleLocation', (data) => {
            setVehicleData(prevData => [...prevData, data]);
            console.log("data", data);
        });

        return () => socket.disconnect();
    }, []);

    useEffect(() => {
        if (vehicleData.length) {
            const newPath = vehicleData.map(point => ({
                lat: point.latitude,
                lng: point.longitude
            }));
            setPath(newPath);
            console.log("path", newPath);
        }
    }, [vehicleData]);

    return (
        <LoadScript googleMapsApiKey="AIzaSyAoH5aK6Qu8D5ECB72BzC3UbEXlyAc41GY">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={15}
                key={path.length} // force re-render when path changes
            >
                {path.length > 0 && (
                    <>
                        <Marker position={path[path.length - 1]} />
                        <Polyline path={path} options={{ strokeColor: '#FF0000' }} />
                    </>
                )}
            </GoogleMap>
        </LoadScript>
    );
};

export default App;
