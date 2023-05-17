import { Image, Col, Layout, Row, Space, Typography, Button } from 'antd'

import logo from 'static/images/solanaLogo.svg'
import './css/index.less'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useState } from 'react';

import * as web3 from '@solana/web3.js';
import CreateToken from 'component/CreateToken';

function App() {

  // get balance
  const { connection } = useConnection();
  const [balance, setBalance] = useState(0);
  const { publicKey, sendTransaction } = useWallet();

  const getMyBalance = useCallback(async () => {
    if (!publicKey) return setBalance(0);
    const lamports = await connection.getBalance(publicKey);
    return setBalance(lamports);
  }, [connection, publicKey]);
  console.log(balance);
  const airdrop = useCallback(async () => {
    try {
      if (publicKey) {
        await connection.requestAirdrop(publicKey, 10 ** 8)
        return getMyBalance();
      }
    }
    catch (err) {
      console.log(err);
    }
  }, [connection, publicKey, getMyBalance]);


  //send sol
  const sendSol = useCallback(async (event: any) => {
    event.preventDefault()
    console.log(event.target.recipient.value)
    try {
      if (publicKey) {
        const recipientPubKey = new web3.PublicKey(event.target.recipient.value)

        const instruction = web3.SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubKey,
          lamports: web3.LAMPORTS_PER_SOL * event.target.amount.value,
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
    return (
      <Layout className="container">
        <Row gutter={[48, 24]}>
          <Col span={24} style={{ textAlign: 'center' }}>
            <Space direction="vertical" size={12}>
              <Image src={logo} preview={false} width={256} />
              <Typography.Title level={2}>Welcome to Solana</Typography.Title>
              <div style={{ display: 'flex', justifyContent: 'center' }}><WalletMultiButton /></div>
              <Typography.Title>My balance : {balance / 10 ** 9} SOL </Typography.Title>
              <Button type='primary' size='large' onClick={airdrop}>Airdrop</Button>
              <Row gutter={[64,24]}>
                <Col span={12} >
                  <Typography.Title level={2} > Send SOL</Typography.Title>
                  <form className='form' onSubmit={sendSol}>
                    <label htmlFor="amount">Amount (in SOL) to send:</label>
                    <input id="amount" type="text" className="formField"
                      placeholder="e.g. 0.1"
                      required style={{ color: '#000' }} />
                    <br />
                    <label htmlFor="recipient">Send SOL to:</label>
                    <input id="recipient" type="text"
                      className="formField"
                      placeholder="e.g. 4Zw1fXuYuJhWhu9KLEYMhiPEiqcpKd6akw3WRZCv84HA"
                      required style={{ color: '#000' }} />
                    <button id="primary" >
                      Send
                    </button>
                  </form>
                </Col>
                <Col span={12}>
                  <CreateToken />
                </Col>
              </Row>
            </Space>
          </Col>
        </Row>
      </Layout>
    )
  }

export default App;
