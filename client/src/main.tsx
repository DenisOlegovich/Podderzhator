import { ChakraProvider, Theme, defaultSystem } from '@chakra-ui/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider value={defaultSystem}>
      <Theme appearance="dark" hasBackground={false}>
        <App />
      </Theme>
    </ChakraProvider>
  </StrictMode>,
)
