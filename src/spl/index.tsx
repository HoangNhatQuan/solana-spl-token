

import { Image, Col, Layout, Row, Space, Typography, Button } from 'antd'


import logo from 'static/images/solanaLogo.svg'
import '../index.less'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

import { useCallback, useEffect, useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'

import * as web3 from '@solana/web3.js'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

import {
    MINT_SIZE,
    TOKEN_PROGRAM_ID,
    getMinimumBalanceForRentExemptMint,
    createInitializeMintInstruction,
} from "@solana/spl-token";

function Spl() {
    const { connection } = useConnection()
    const { publicKey, sendTransaction } = useWallet()
    const [balance, setBalance] = useState(0)

    const [mint, setMint] = useState("");

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

    const createMint = useCallback(async (event: any) => {
        try {
            event.preventDefault();
            if (!connection || !publicKey) {
                return;
            }

            const mint = web3.Keypair.generate();

            const lamports = await getMinimumBalanceForRentExemptMint(connection);

            const transaction = new web3.Transaction();

            transaction.add(
                web3.SystemProgram.createAccount({
                    fromPubkey: publicKey,
                    newAccountPubkey: mint.publicKey,
                    space: MINT_SIZE,
                    lamports,
                    programId: TOKEN_PROGRAM_ID,
                }),
                createInitializeMintInstruction(
                    mint.publicKey,
                    0,
                    publicKey,
                    publicKey,
                    TOKEN_PROGRAM_ID
                )
            );
            sendTransaction(transaction, connection, {
                signers: [mint],
            }).then(() => {
                setMint(mint.publicKey.toString());
            });
            return mint

        } catch (err: any) {
            alert(err.message)
        }

    },[connection, publicKey, mint]);

    useEffect(() => {
        getMyBalance()
    }, [getMyBalance])

    return (
        <Layout className="container">
            <Row gutter={[24, 24]}>
                <Col span={24} style={{ textAlign: 'center' }}>
                    <Space direction="vertical" size={24}>
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
                        <div className='create-mint'>
                            <h1>Create Accout Mint: </h1>
                            <Button
                                type="primary"
                                size="large"
                                onClick={createMint}
                            >
                                Create Mint
                            </Button>
                        </div>
                        <h1 style={{ textAlign: 'start' }}>Token Mint Address: {mint}</h1>
                    </Space>
                </Col>
            </Row>
        </Layout>
    )
}

export default Spl
