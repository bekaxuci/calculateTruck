import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import CalculateDistance from '../component/calcualateDistance';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Heading,
  Grid,
  Card,
  CardBody,
  Text,
  Table,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  HStack,
  Flex,
  GridItem
} from '@chakra-ui/react';

export const Profile = () => {
  const apiOptions = { apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY };
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loader = new Loader({
      apiKey: apiOptions.apiKey,
      version: "weekly",
      libraries: ["places"]
    });

    loader.load().then(() => {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 40.416775, lng: -3.703790 },
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
    <Container maxW="container.xl" p={4}>
      <Flex minH="100vh" flexDirection="column">
        <Grid templateColumns="repeat(4, 1fr)" gap={4}>
          <GridItem colSpan={{ base: 4, lg: 1 }}>
            <Card>
              <CardBody>
                <VStack align="start">
                  <Heading as="h1" size="lg">Planner</Heading>
                  <CalculateDistance
                    map={map}
                    onRouteCalculated={handleRouteCalculated}
                    onRouteInfo={handleRouteInfo}
                    onClearRoute={clearRoute}
                  />
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem colSpan={{ base: 4, lg: 3 }}>
            <Card>
              <CardBody>
                <Box
                  ref={mapRef}
                  height="100%"
                  minHeight="500px"
                  borderRadius="10px"
                  borderWidth="1px"
                  borderColor="blue.400"
                ></Box>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {routeInfo && (
          <Box mt={4}>
            <Card>
              <CardBody>
                <Heading as="h3" size="md">Información de la ruta</Heading>
                <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                  <Box>
                    <Table variant="striped" colorScheme="teal">
                      <Tbody>
                        <Tr>
                          <Th>Distancia</Th>
                          <Td>{routeInfo.distance}</Td>
                        </Tr>
                        <Tr>
                          <Th>Duración</Th>
                          <Td>{routeInfo.duration}</Td>
                        </Tr>
                        <Tr>
                          <Th>Precio por km</Th>
                          <Td>{routeInfo.pricePerKm}</Td>
                        </Tr>
                        <Tr>
                          <Th>Costo operacional</Th>
                          <Td>{routeInfo.operationalCost}</Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </Box>
                  <Box>
                    <Table variant="striped" colorScheme="teal">
                      <Tbody>
                        <Tr>
                          <Th>Precio base</Th>
                          <Td>{routeInfo.basePrice}</Td>
                        </Tr>
                        <Tr>
                          <Th>Recargo por peso</Th>
                          <Td>{routeInfo.weightSurcharge}</Td>
                        </Tr>
                        <Tr>
                          <Th>Adicionales</Th>
                          <Td>{routeInfo.optionsSurcharge}</Td>
                        </Tr>
                        <Tr>
                          <Th>Precio final</Th>
                          <Td>{routeInfo.finalPrice}</Td>
                        </Tr>
                        <Tr>
                          <Th>Beneficio</Th>
                          <Td>{routeInfo.profit}</Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </Box>
                </Grid>
              </CardBody>
            </Card>
          </Box>
        )}
      </Flex>
    </Container>
  );
};
