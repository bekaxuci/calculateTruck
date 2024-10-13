import React from "react";
import { Box, Text, Link, Icon } from "@chakra-ui/react";
import { FaHeart } from "react-icons/fa"; // Importa el icono del corazón de react-icons


export const Footer = () => (
    <Box
        as="footer"
        mt="auto"
        py={3}
        textAlign="center"
        bg="gray.100" // Color de fondo del footer
        borderTop="1px" // Añade un borde superior
        borderColor="gray.200"
    >
        <Text>
            Made with <Icon as={FaHeart} color="red.500" /> by{" "}
            <Link href="https://github.com/bekaxuci" isExternal color="teal.500">
                BekaXuci
            </Link>
        </Text>
    </Box>
);
