import { Image, Col, Layout, Row, Space, Typography, Button } from 'antd'

import logo from 'static/images/solanaLogo.svg'
import './css/index.less'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

import { useCallback, useEffect, useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'

import * as web3 from '@solana/web3.js'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

import CreateToken from 'component/CreateToken'

function App() {

  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [balance, setBalance] = useState(0)


  const getMyBalance = useCallback(async () => {
    if (!publicKey) return setBalance(0)
    const lamports = await connection.getBalance(publicKey)
    return setBalance(lamports)
  }, [connection, publicKey])

  const airdrop = useCallback(async () => {
    try {
      if (publicKey) {
        await connection.requestAirdrop(publicKey, 10 ** 8)
        return getMyBalance()
      }
    } catch (er: any) {
      console.log(er.message)
    }
  }, [connection, publicKey, getMyBalance])

  //Send Sol
  const sendSol = useCallback(async (event: any) => {
    event.preventDefault()
    console.log(event.target.recipient.value)
    try {
      if (publicKey) {
        const recipientPubKey = new web3.PublicKey(event.target.recipient.value)

        const instruction = web3.SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubKey,
          lamports: LAMPORTS_PER_SOL * event.target.amount.value,
        })

        const transaction = new web3.Transaction().add(instruction)

        const {
          context: { slot: minContextSlot },
          value: { blockhash, lastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext()

        const signature = await sendTransaction(
          transaction,
          connection,
          { minContextSlot }
        )

        await connection.confirmTransaction({
          blockhash,
          lastValidBlockHeight,
          signature,
        })

        return getMyBalance()
      }
    } catch (err: any) {
      alert(err.message)
    }

  }, [connection, publicKey, getMyBalance])


  //Mint Tokens
  // const mintTo = async (event: any) => {
  //   event.preventDefault();
  //   if (!connection || !publicKey) {
  //     return;
  //   }
  //   const transaction = new web3.Transaction();

  //   const mintPubKey = new web3.PublicKey(event.target.mintToken.value);
  //   const recipientPubKey = new web3.PublicKey(event.target.recipient.value);
  //   const amount = event.target.amount.value;

    
  //   const associatedToken = await getAssociatedTokenAddress(
  //     mintPubKey,
  //     recipientPubKey,
  //     false,
  //     TOKEN_PROGRAM_ID,
  //     ASSOCIATED_TOKEN_PROGRAM_ID
  //   );

  //   transaction.add(
  //     createMintToInstruction(mintPubKey, associatedToken, publicKey, amount)
  //   );


  //   await sendTransaction(transaction, connection).then(() => {
  //     setTokenAccount(associatedToken.toString());
  //   });

  //   const account = await getAccount(connection, associatedToken);
  //   setBalance(parseFloat(account.amount.toString()));

  // };

  useEffect(() => {
    getMyBalance()
  }, [getMyBalance])

  return (
    <Layout className="container">
      <Row gutter={[48, 24]}>
        <Col span={24} style={{ textAlign: 'center' }}>
          <Space direction="vertical" size={12}>
            <Image src={logo} preview={false} width={256} />
            <div className='connect-wallet'><WalletMultiButton /></div>
            <Typography.Title>
              My Balance: {balance / 10 ** 9} SOL
            </Typography.Title>
            <Button
              type="primary"
              size="large"
              onClick={airdrop}
            >
              Airdrop
            </Button>
          </Space>
          <Row style={{ marginTop: '20px' }}>
            <Col span={12}>
              <Typography.Title level={2}>Send Sol</Typography.Title>
              <form className="form" onSubmit={sendSol}>
                <label htmlFor="amount">Amount (in SOL) to send:</label>
                <input id="amount" type="text" className="formField" placeholder="e.g. 0.1" required style={{ color: '#000' }} />
                <br />
                <label htmlFor="recipient">Send SOL to:</label>
                <input id="recipient" type="text" className="formField" placeholder="e.g. 4Zw1fXuYuJhWhu9KLEYMhiPEiqcpKd6akw3WRZCv84HA" required style={{ color: '#000' }} />
                <button id="primary" >
                  Send
                </button>
              </form>
            </Col>
            <Col span={12}>
              <CreateToken />
              {/* <h1>Token Balance: {balance} </h1>
              <form onSubmit={mintTo} className="form">
                <label htmlFor="mint">Token Mint:</label>
                <input
                  id="mintToken"
                  type="text"
                  className="formField"
                  placeholder="Enter Token Mint"
                  required
                />
                <label htmlFor="recipient">Recipient:</label>
                <input
                  id="recipient"
                  type="text"
                  className="formField"
                  placeholder="Enter Recipient PublicKey"
                  required
                />
                <label htmlFor="amount">Amount Tokens to Mint:</label>
                <input
                  id="amount"
                  type="text"
                  className="formField"
                  placeholder="e.g. 100"
                  required
                />
                <button id="primary" type='submit'>
                  Mint Tokens
                </button>
              </form> */}
            </Col>
          </Row>



        </Col>
      </Row>
    </Layout>
  )
}

export default App;
