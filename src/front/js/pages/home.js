import React, { useContext, useState } from "react";
import { Context } from "../store/appContext";
import '../../styles/home.css';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Heading,
    Text,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton
} from "@chakra-ui/react";

export const Home = () => {
    const { store, actions } = useContext(Context);
    const toast = useToast(); // Para mostrar mensajes de éxito o error

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState(""); // Estado para la confirmación de contraseña
    const [firstName, setFirstName] = useState(""); // Estado para el nombre
    const [lastName, setLastName] = useState(""); // Estado para el apellido
    const [company, setCompany] = useState(""); // Estado para la empresa
    const [isModalOpen, setIsModalOpen] = useState(false); // Estado para el modal
    const [registerEmail, setRegisterEmail] = useState(""); // Estado para el correo electrónico en el registro

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            await actions.login(email, password);
            toast({
                title: "Inicio de sesión exitoso.",
                description: "Bienvenido de nuevo.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Error.",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        try {
            // Verificar si las contraseñas coinciden
            if (password !== confirmPassword) {
                throw new Error("Las contraseñas no coinciden");
            }

            // Llamada a la acción register
            await actions.register(registerEmail, password, firstName, lastName, company);
            toast({
                title: "Registro exitoso.",
                description: "Ahora puedes iniciar sesión.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            setIsModalOpen(false); // Cerrar el modal después de registrar
        } catch (error) {
            toast({
                title: "Error.",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Box className="text-center mt-5" maxW="400px" mx="auto" p={5}>
            <Heading mb={4}>Iniciar sesión</Heading>
            <form onSubmit={handleLoginSubmit}>
                <FormControl isRequired mb={4}>
                    <FormLabel htmlFor="email">Correo electrónico</FormLabel>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Introduce tu correo electrónico"
                    />
                </FormControl>
                <FormControl isRequired mb={4}>
                    <FormLabel htmlFor="password">Contraseña</FormLabel>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Introduce tu contraseña"
                    />
                </FormControl>
                <Button type="submit" colorScheme="teal" width="100%">
                    Iniciar sesión
                </Button>
            </form>
            <Text mt={4} onClick={() => setIsModalOpen(true)} color="teal.500" cursor="pointer">
                ¿No tienes cuenta? Regístrate
            </Text>

            {/* Modal para registro */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Registrarse</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl isRequired mb={4}>
                            <FormLabel htmlFor="first-name">Nombre</FormLabel>
                            <Input
                                id="first-name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Introduce tu nombre"
                            />
                        </FormControl>
                        <FormControl isRequired mb={4}>
                            <FormLabel htmlFor="last-name">Apellido</FormLabel>
                            <Input
                                id="last-name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Introduce tu apellido"
                            />
                        </FormControl>
                        <FormControl mb={4}>
                            <FormLabel htmlFor="company">Empresa</FormLabel>
                            <Input
                                id="company"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                placeholder="Introduce tu empresa"
                            />
                        </FormControl>
                        <FormControl isRequired mb={4}>
                            <FormLabel htmlFor="register-email">Correo electrónico</FormLabel>
                            <Input
                                id="register-email"
                                type="email"
                                value={registerEmail} // Usar el nuevo estado
                                onChange={(e) => setRegisterEmail(e.target.value)} // Actualizar el estado del correo
                                placeholder="Introduce tu correo electrónico"
                            />
                        </FormControl>
                        <FormControl isRequired mb={4}>
                            <FormLabel htmlFor="register-password">Contraseña</FormLabel>
                            <Input
                                id="register-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Introduce tu contraseña"
                            />
                        </FormControl>
                        <FormControl isRequired mb={4}>
                            <FormLabel htmlFor="confirm-password">Confirmar Contraseña</FormLabel>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirma tu contraseña"
                            />
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="teal" onClick={handleRegisterSubmit}>
                            Registrarse
                        </Button>
                        <Button variant="outline" ml={3} onClick={() => setIsModalOpen(false)}>
                            Cancelar
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};
