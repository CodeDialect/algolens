import { createRoot } from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
import App from "./App";
import "./index.css";
const container = document.getElementById("root");
const root = createRoot(container!);

const theme = extendTheme({
  fonts: {
    body: "Kalam",
    heading: "Kalam",
    // Add more font styles as needed
  },
})
root.render(
  <ChakraProvider theme={theme}>
    <App />
  </ChakraProvider>
);
