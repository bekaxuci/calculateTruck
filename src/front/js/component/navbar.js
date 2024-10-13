import React from "react";
import { Link } from "react-router-dom";
import { Box, Flex, Heading, Button } from "@chakra-ui/react";

export const Navbar = () => {
    return (
        <Box bg="teal.500" p={4}>
            <Flex alignItems="center" justifyContent="space-between" maxW="1200px" mx="auto">
                <Link to="/">
                    <Heading as="h1" size="lg" color="white">
                        CalculateTruck
                    </Heading>
                </Link>
                <Link to="/profile">
                    <Button colorScheme="teal" variant="solid">
                        Check the Context in action
                    </Button>
                </Link>
            </Flex>
        </Box>
    );
};
