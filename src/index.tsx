import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import App from 'App'

import reportWebVitals from 'reportWebVitals'
import { ConnectionProvider } from '@solana/wallet-adapter-react'

import 'static/styles/index.less'
import configs from 'configs'

import { WalletProvider } from '@solana/wallet-adapter-react'
import { PhantomWalletAdapter, Coin98WalletAdapter } from '@solana/wallet-adapter-wallets'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'

const { rpc: { endpoint } } = configs

createRoot(document.getElementById('root') as HTMLElement).render(
  <BrowserRouter>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[new PhantomWalletAdapter(), new Coin98WalletAdapter()]} autoConnect>
        <WalletModalProvider>
          <Routes>
            <Route path="/" element={<App />} />
          </Routes>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </BrowserRouter >
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
