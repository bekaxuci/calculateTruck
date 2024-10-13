import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Button, List, ListItem, Text } from "@chakra-ui/react";
import { Context } from "../store/appContext";
import { Loader } from '@googlemaps/js-api-loader';
import CalculateDistance from '../component/calculateDistance';

export const Profile = () => {
  const { store, actions } = useContext(Context);
  const apiOptions = { apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY };
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  
  // Iniciar el mapa y el servicio de rutas
  useEffect(() => {
    const loader = new Loader({
      apiKey: apiOptions.apiKey,
      version: "weekly",
      libraries: ["places"]
    });

    loader.load().then(() => {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 39.4699, lng: -0.3763 }, // Coordenadas de Valencia
        zoom: 6,
      });

      const directionsRendererInstance = new window.google.maps.DirectionsRenderer();
      directionsRendererInstance.setMap(mapInstance);

      setMap(mapInstance);
      setDirectionsRenderer(directionsRendererInstance);
    });
  }, []);

  const handleRouteCalculated = (result) => {
    if (directionsRenderer) {
      directionsRenderer.setDirections(result);
    }
  };

  const handleRouteInfo = (info) => {
    setRouteInfo(info);
  };

  const clearRoute = () => {
    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] });
    }
    setRouteInfo(null);
  };

  return (
    <Box className="container" p={5} bg="gray.100" borderRadius="md" boxShadow="md">
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Mi Perfil
      </Text>
      <List spacing={3}>
        <ListItem>
          <Link to="/planner">
            <Button colorScheme="teal" width="full">
              Planner (Ruta)
            </Button>
          </Link>
        </ListItem>
        <ListItem>
          <Link to="/mis-direcciones">
            <Button colorScheme="teal" width="full">
              Mis Direcciones
            </Button>
          </Link>
        </ListItem>
        <ListItem>
          <Link to="/vehiculos">
            <Button colorScheme="teal" width="full">
              Vehículos
            </Button>
          </Link>
        </ListItem>
        <ListItem>
          <Link to="/autonomos">
            <Button colorScheme="teal" width="full">
              Autónomos
            </Button>
          </Link>
        </ListItem>
        <ListItem>
          <Link to="/clientes">
            <Button colorScheme="teal" width="full">
              Clientes
            </Button>
          </Link>
        </ListItem>
      </List>

      <Box mt={6}>
        <Button colorScheme="red" width="full" onClick={() => actions.logout()}>
          Cerrar Sesión
        </Button>
      </Box>

      {/* Sección de Google Maps */}
      <Box mt={8} p={4} bg="white" borderRadius="md" boxShadow="md">
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Calculador de Rutas (Valencia a Madrid)
        </Text>
        <div style={{ height: "400px", borderRadius: "10px" }} ref={mapRef}></div>
        
        <CalculateDistance
          map={map}
          onRouteCalculated={handleRouteCalculated}
          onRouteInfo={handleRouteInfo}
          onClearRoute={clearRoute}
        />
      </Box>

      {/* Mostrar información de la ruta */}
      {routeInfo && (
        <Box mt={8} p={4} bg="white" borderRadius="md" boxShadow="md">
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Información de la ruta
          </Text>
          <table className="table table-striped table-bordered">
            <tbody>
              <tr>
                <th>Distancia</th>
                <td>{routeInfo.distance}</td>
              </tr>
              <tr>
                <th>Duración</th>
                <td>{routeInfo.duration}</td>
              </tr>
              <tr>
                <th>Precio por km</th>
                <td>{routeInfo.pricePerKm}</td>
              </tr>
              <tr>
                <th>Costo operacional</th>
                <td>{routeInfo.operationalCost}</td>
              </tr>
              <tr>
                <th>Precio final</th>
                <td>{routeInfo.finalPrice}</td>
              </tr>
              <tr>
                <th>Beneficio</th>
                <td>{routeInfo.profit}</td>
              </tr>
            </tbody>
          </table>
        </Box>
      )}
    </Box>
  );
};
