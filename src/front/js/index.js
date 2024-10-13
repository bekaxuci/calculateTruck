// import react into the bundle
import React from "react";
import ReactDOM from "react-dom";
import "../styles/home.css"

// include your index.scss file into the bundle
import "../styles/index.css";

// import ChakraProvider from Chakra UI
import { ChakraProvider } from "@chakra-ui/react";

// import your own components
import Layout from "./layout";

// render your react application
ReactDOM.render(
  <ChakraProvider>
    <Layout />
  </ChakraProvider>,
  document.querySelector("#app")
);
