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
import axios from "axios"; // Asegúrate de importar axios
import { useNavigate } from "react-router-dom"; // Importa useNavigate

export const Home = () => {
    const { store, actions } = useContext(Context);
    const toast = useToast();
    const navigate = useNavigate(); // Inicializa navigate

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [company, setCompany] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [registerEmail, setRegisterEmail] = useState("");
    const [loginWarningMessage, setLoginWarningMessage] = useState(""); // Estado para el mensaje de advertencia

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginWarningMessage(''); // Limpiar mensajes de advertencia

        try {
            const response = await axios.post(
                `${process.env.BACKEND_URL}/api/login`,
                { email, password }, // Utiliza los estados de email y contraseña
                {
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (response.status === 200) {
                const { token, user } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                navigate('/profile');
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setLoginWarningMessage('Usuario no registrado o credenciales incorrectas');
            } else {
                setLoginWarningMessage(error.response ? error.response.data.error : 'Error en el inicio de sesión');
            }
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
            setIsModalOpen(false);
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
            {loginWarningMessage && <Text color="red.500">{loginWarningMessage}</Text>} {/* Mensaje de advertencia */}
            <form onSubmit={handleSubmit}>
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
                                value={registerEmail}
                                onChange={(e) => setRegisterEmail(e.target.value)}
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
