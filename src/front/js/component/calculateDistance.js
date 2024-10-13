import React, { useState, useEffect } from 'react';
import {
  Box, Button, Input, Select, FormLabel, Checkbox, Alert, AlertIcon, VStack, HStack, Text,
} from '@chakra-ui/react';

const CalculateDistance = ({ map, onRouteCalculated, onRouteInfo, onClearRoute }) => {
  const [stops, setStops] = useState([
    { location: '', key: 0 },
    { location: '', key: 1 }
  ]);
  const [cargoWeight, setCargoWeight] = useState(0);
  const [containerType, setContainerType] = useState('');
  const [tarifa, setTarifa] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [showWeightAlert, setShowWeightAlert] = useState(false);

  const additionalOptions = [
    'Nocturnidad',
    'Mercancía peligrosa',
    'Festivo',
    'Basculante'
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
    checkWeightLimit();
  }, [cargoWeight, containerType]);

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
    setSelectedOptions(prev =>
      prev.includes(option)
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  const calculateRoute = () => {
    // Calculation logic
  };

  const resetRoute = () => {
    setStops([
      { location: '', key: 0 },
      { location: '', key: 1 }
    ]);
    setCargoWeight(0);
    setContainerType('');
    setTarifa('');
    setSelectedOptions([]);
    setShowWeightAlert(false);
    onClearRoute();
  };

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold">Paradas</Text>
        {stops.map((stop, index) => (
          <HStack key={stop.key}>
            <Input
              id={`location-${index}`}
              placeholder={index === 0 ? "Origen" : index === stops.length - 1 ? "Destino final" : `Parada ${index}`}
              value={stop.location}
              onChange={(e) => updateStop(index, 'location', e.target.value)}
            />
            {index === stops.length - 1 && (
              <Button onClick={addStop} colorScheme="blue">+</Button>
            )}
            {stops.length > 2 && index !== 0 && index !== stops.length - 1 && (
              <Button onClick={() => removeStop(index)} colorScheme="red">×</Button>
            )}
          </HStack>
        ))}

        <Box>
          <FormLabel>Tipo de contenedor</FormLabel>
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
        </Box>

        <Box>
          <FormLabel>Peso de la carga (toneladas)</FormLabel>
          <Input
            type="number"
            value={cargoWeight}
            onChange={(e) => setCargoWeight(parseFloat(e.target.value))}
            placeholder="Ingresa el peso de la carga"
          />
        </Box>

        {showWeightAlert && (
          <Alert status="warning">
            <AlertIcon />
            Se aplicará un recargo del 25% debido al exceso de peso.
          </Alert>
        )}

        <Box>
          <FormLabel>Tarifa</FormLabel>
          <Input
            type="number"
            value={tarifa}
            onChange={(e) => setTarifa(e.target.value)}
            placeholder="0.00"
          />
        </Box>

        <Box>
          <Text fontSize="lg" fontWeight="bold">Opciones Adicionales</Text>
          <HStack spacing={4}>
            {additionalOptions.map((option, index) => (
              <Checkbox
                key={index}
                isChecked={selectedOptions.includes(option)}
                onChange={() => handleOptionChange(option)}
              >
                {option}
              </Checkbox>
            ))}
          </HStack>
        </Box>

        <HStack spacing={4}>
          <Button colorScheme="teal" onClick={calculateRoute}>Calcular Ruta</Button>
          <Button colorScheme="gray" onClick={resetRoute}>Limpiar</Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default CalculateDistance;
