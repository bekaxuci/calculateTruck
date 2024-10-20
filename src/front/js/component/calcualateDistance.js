import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Text,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';


const CalculateDistance = ({ map, onRouteCalculated, onRouteInfo, onClearRoute }) => {
  const [stops, setStops] = useState([
    { location: '', key: 0 },
    { location: '', key: 1 },
  ]);
  const [cargoWeight, setCargoWeight] = useState(0);
  const [containerType, setContainerType] = useState('');
  const [tarifa, setTarifa] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [showWeightAlert, setShowWeightAlert] = useState(false);
  const [truckMarker, setTruckMarker] = useState(null);

  const additionalOptions = [
    'Nocturnidad',
    'Mercancía peligrosa',
    'Festivo',
    'Basculante',
  ];

  useEffect(() => {
    if (window.google && map) {
      stops.forEach((stop, index) => {
        const autocomplete = new window.google.maps.places.Autocomplete(
          document.getElementById(`location-${index}`)
        );
        autocomplete.bindTo("bounds", map);
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.formatted_address) {
            updateStop(index, 'location', place.formatted_address);
          }
        });
      });
    }
  }, [map, stops]);

  useEffect(() => {
    if (window.google && map && truckMarker === null) {
      const marker = new window.google.maps.Marker({
        map: map,
        label: {
          text: '🚚', 
          fontSize: '32px', 
        },
        position: { lat: 0, lng: 0 }, // Posición inicial del marcador
      });
      setTruckMarker(marker);
    }
  }, [map, truckMarker]);
  

  useEffect(() => {
    checkWeightLimit();
  }, [cargoWeight, containerType]);

  const moveTruck = (route) => {
    if (!truckMarker) return;
  
    const steps = route.legs.flatMap(leg => leg.steps);
    let stepIndex = 0;
    let stepProgress = 0;
  
    const moveSpeed = 10; // Cambia este valor para ajustar la velocidad; mayor número = más rápido.
  
    const animateStep = () => {
      if (stepIndex >= steps.length) return;
  
      const step = steps[stepIndex];
  
      // Aumenta stepProgress en moveSpeed para avanzar más rápido
      for (let i = 0; i < moveSpeed; i++) {
        if (stepProgress < step.path.length) {
          const nextLatLng = step.path[stepProgress];
          truckMarker.setPosition(nextLatLng);
          stepProgress++;
        }
      }
  
      if (stepProgress >= step.path.length) {
        stepIndex++;
        stepProgress = 0;
      }
  
      requestAnimationFrame(animateStep); // Continuar la animación
    };
  
    animateStep();
  };
  
  
  


    const checkWeightLimit = () => {
      if ((containerType === '20' || containerType === '20reefer') && cargoWeight > 25) {
        setShowWeightAlert(true);
      } else if ((containerType === '40' || containerType === '40reefer') && cargoWeight > 24) {
        setShowWeightAlert(true);
      } else {
        setShowWeightAlert(false);
      }
    };

    const updateStop = (index, field, value) => {
      const newStops = [...stops];
      newStops[index][field] = value;
      setStops(newStops);
    };

    const addStop = () => {
      setStops([...stops, { location: '', key: stops.length }]);
    };

    const removeStop = (index) => {
      if (stops.length > 2) {
        const newStops = stops.filter((_, i) => i !== index);
        setStops(newStops);
      }
    };

    const handleOptionChange = (option) => {
      setSelectedOptions((prev) =>
        prev.includes(option)
          ? prev.filter((item) => item !== option)
          : [...prev, option]
      );
    };

    const calculateFuelConsumption = (distanceKm) => {
      let baseFuelConsumption;
      switch (containerType) {
        case '20':
        case '20reefer':
          baseFuelConsumption = 28;
          break;
        case '40':
        case '40reefer':
          baseFuelConsumption = 32;
          break;
        default:
          baseFuelConsumption = 30;
      }

      const weightAdjustment = Math.max(0, cargoWeight - 20) * 0.02;
      const adjustedConsumption = baseFuelConsumption * (1 + weightAdjustment);

      return (adjustedConsumption / 100) * distanceKm;
    };

    const calculateBAF = (baseFuelPrice, currentFuelPrice, totalFuelConsumption) => {
      const fuelPriceDifference = currentFuelPrice - baseFuelPrice;
      return fuelPriceDifference * totalFuelConsumption;
    };

    const calculateRoute = () => {
      if (!window.google || !map) {
        console.error('Google Maps API not loaded');
        return;
      }

      const directionsService = new window.google.maps.DirectionsService();
      const waypoints = stops.slice(1, -1).map((stop) => ({
        location: stop.location,
        stopover: true,
      }));

      const request = {
        origin: stops[0].location,
        destination: stops[stops.length - 1].location,
        waypoints: waypoints,
        travelMode: 'DRIVING',
      };

      directionsService.route(request, (result, status) => {
        if (status === 'OK') {
          onRouteCalculated(result);

          const route = result.routes[0];
          moveTruck(route);
          let totalDistance = 0;
          let totalDuration = 0;

          route.legs.forEach((leg) => {
            totalDistance += leg.distance.value;
            totalDuration += leg.duration.value;
          });

          const distanceKm = totalDistance / 1000;
          const durationHours = totalDuration / 3600;

          const baseFuelPrice = 1.10;
          const currentFuelPrice = 1.50;

          const totalFuelConsumption = calculateFuelConsumption(distanceKm);
          const bafCost = calculateBAF(baseFuelPrice, currentFuelPrice, totalFuelConsumption);
          const driverCostPerKm = 0.80;
          const driverCost = distanceKm * driverCostPerKm;
          const totalOperationalCost = bafCost + driverCost;
          const basePrice = distanceKm * parseFloat(tarifa);

          let weightSurcharge = 0;
          if (showWeightAlert) {
            weightSurcharge = basePrice * 0.25;
          }

          const optionsSurchargePercentage = selectedOptions.length * 0.05;
          const optionsSurcharge = basePrice * optionsSurchargePercentage;

          const finalPrice = basePrice + weightSurcharge + optionsSurcharge;
          const profit = finalPrice - totalOperationalCost;

          const routeInfo = {
            distance: `${distanceKm.toFixed(2)} km`,
            duration: `${durationHours.toFixed(2)} horas`,
            pricePerKm: `€${parseFloat(tarifa).toFixed(2)}`,
            operationalCost: `€${totalOperationalCost.toFixed(2)}`,
            basePrice: `€${basePrice.toFixed(2)}`,
            weightSurcharge: `€${weightSurcharge.toFixed(2)}`,
            optionsSurcharge: `€${optionsSurcharge.toFixed(2)}`,
            finalPrice: `€${finalPrice.toFixed(2)}`,
            profit: `€${profit.toFixed(2)}`,
            fuelConsumption: `${totalFuelConsumption.toFixed(2)} litros`,
            bafCost: `€${bafCost.toFixed(2)}`,
            toll: 'N/A',
          };

          onRouteInfo(routeInfo);
        } else {
          console.error('Directions request failed due to ' + status);
        }
      });
    };

    const resetRoute = () => {
      setStops([
        { location: '', key: 0 },
        { location: '', key: 1 },
      ]);
      setCargoWeight(0);
      setContainerType('');
      setTarifa('');
      setSelectedOptions([]);
      setShowWeightAlert(false);
      onClearRoute();
    };

    return (
      <Box borderWidth={1} borderRadius="lg" p={5} boxShadow="lg" width="400px" height="600px">
        <Text fontSize="xl" mb={3}>Paradas</Text>
        {stops.map((stop, index) => (
          <Stack key={stop.key} mb={2} direction="row" alignItems="center">
            <Input
              id={`location-${index}`}
              placeholder={index === 0 ? "Origen" : index === stops.length - 1 ? "Destino final" : `Parada ${index}`}
              value={stop.location}
              onChange={(e) => updateStop(index, 'location', e.target.value)}
            />
            {index === stops.length - 1 && (
              <Button onClick={addStop} colorScheme="teal">+</Button>
            )}
            {stops.length > 2 && index !== 0 && index !== stops.length - 1 && (
              <Button onClick={() => removeStop(index)} colorScheme="red">×</Button>
            )}
          </Stack>
        ))}

        <FormControl mt={3}>
          <FormLabel>Tipo de contenedor:</FormLabel>
          <Select
            value={containerType}
            onChange={(e) => setContainerType(e.target.value)}
          >
            <option value="">Selecciona un tipo</option>
            <option value="20">20'</option>
            <option value="40">40'</option>
            <option value="20reefer">20' Reefer</option>
            <option value="40reefer">40' Reefer</option>
          </Select>
        </FormControl>

        <FormControl mt={3}>
          <FormLabel>Peso de la carga (toneladas):</FormLabel>
          <Input
            type="number"
            value={cargoWeight}
            onChange={(e) => setCargoWeight(parseFloat(e.target.value))}
            placeholder="Ingresa el peso de la carga"
          />
        </FormControl>

        {showWeightAlert && (
          <Alert status="warning" mt={3}>
            <AlertIcon />
            Se aplicará un recargo del 25% debido al exceso de peso.
          </Alert>
        )}

        <FormControl mt={3}>
          <FormLabel>Introducir Tarifa</FormLabel>
          <Stack direction="row">
            <Input
              type="number"
              value={tarifa}
              onChange={(e) => setTarifa(e.target.value)}
              placeholder="Tarifa por km"
            />
          </Stack>
        </FormControl>

        <FormControl mt={3}>
          <FormLabel>Opciones adicionales:</FormLabel>
          {additionalOptions.map((option) => (
            <Checkbox
              key={option}
              isChecked={selectedOptions.includes(option)}
              onChange={() => handleOptionChange(option)}
              mt={2}
            >
              {option}
            </Checkbox>
          ))}
        </FormControl>

        <Button mt={4} colorScheme="blue" onClick={calculateRoute}>Calcular ruta</Button>
        <Button mt={4} ml={2} colorScheme="gray" onClick={resetRoute}>Restablecer</Button>
      </Box>
    );
  };

  export default CalculateDistance;
