import React, { useCallback } from 'react'

import { Typography, Button } from 'antd'
import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import * as web3 from '@solana/web3.js'

import {
    TOKEN_PROGRAM_ID,
    MINT_SIZE,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getMinimumBalanceForRentExemptMint,
    createInitializeMintInstruction,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    createMintToCheckedInstruction,
    getOrCreateAssociatedTokenAccount,
    createTransferInstruction,
    createBurnCheckedInstruction
}
    from '@solana/spl-token'
import * as bs58 from 'bs58'
export default function CreateToken() {

    const { connection } = useConnection()
    const { publicKey, sendTransaction } = useWallet()
    //Create Token
    const [mint, setMint] = useState("");
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
                    9,
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
            console.log(err.message)
        }
    }, [connection, publicKey, mint]);

    //Create Token Account
    const [tokenAccount, setTokenAccount] = useState("");
    const createTokenAccount = useCallback(async (event: any) => {
        event.preventDefault();
        try {
            if (!connection || !publicKey) {
                return;
            }
            const transaction = new web3.Transaction();
            const mintAdress = new web3.PublicKey(mint);
            const associatedToken = await getAssociatedTokenAddress(
                mintAdress,
                publicKey,
                false,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            )
            transaction.add(createAssociatedTokenAccountInstruction(
                publicKey,
                associatedToken,
                publicKey,
                mintAdress,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            ))
            await sendTransaction(transaction, connection)
                .then(() => {
                    setTokenAccount(associatedToken.toString());
                })

        } catch (err: any) {
            console.log(err.message)
        }

    }, [connection, publicKey, mint]);
    //Mint To
    const MintTo = useCallback(async (event: any) => {
        event.preventDefault();
        try {
            if (!connection || !publicKey) {
                return;
            }
            const mintPubkey = new web3.PublicKey(mint);
            const tokenAccountPubkey = new web3.PublicKey(tokenAccount);
            const transaction = new web3.Transaction();
            transaction.add(
                createMintToCheckedInstruction(
                    mintPubkey,
                    tokenAccountPubkey,
                    publicKey,
                    100 * 10 ** 9,
                    9
                )
            );
            await sendTransaction(transaction, connection)
        }
        catch (err: any) {
            console.log(err.message)
        }
    }, [connection, publicKey, mint, tokenAccount]);
    //Check Token Balance
    const [balanceToken, setBalanceToken] = useState("");
    const checkBalance = useCallback(async (event: any) => {
        event.preventDefault();
        try {
            if (!connection || !publicKey) {
                return;
            }
            let token = await connection.getTokenAccountBalance(new web3.PublicKey(tokenAccount));
            setBalanceToken(token.value.amount.toString());
        }
        catch (err: any) {
            console.log(err.message)
        }
    }, [connection, publicKey, tokenAccount]);

    //burn token
    const BurnToken = useCallback(async (e: any) => {
        e.preventDefault();
        try {
            if (!publicKey || !connection) return;
            const mintPubkey = new web3.PublicKey(mint);
            const tokenAccountPubkey = new web3.PublicKey(tokenAccount);
            const transaction = new web3.Transaction()

            transaction.add(
                createBurnCheckedInstruction(
                    tokenAccountPubkey,
                    mintPubkey,
                    publicKey,
                    10 * 10 ** 9,
                    9
                )
            )

            await sendTransaction(transaction, connection)

        } catch (err: any) {
            console.log(err)
        }
    }, [connection, publicKey, mint, tokenAccount])

    //transfer token
    const TransferToken = useCallback(async(e: any) => {
        e.preventDefault();
        try {
            if (!publicKey || !connection) return;
            const mintPubkey = new web3.PublicKey(mint);
            const fromTokenAccount = new web3.PublicKey(tokenAccount);

            const fromWallet = web3.Keypair.fromSecretKey(bs58.decode("58xXRnone4r9hAbaoWFV5nhV7mgMnSAb1EwbYF7R1Egd7qGc75MuRmQRSucDpTd8nLFjcSXpqnvB5pfLyqzeRP9W"))
            const toWallet = new web3.PublicKey(e.target.recipient.value)

            const transaction = new web3.Transaction()

            const toTokenAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                fromWallet,
                mintPubkey,
                toWallet
            )
            transaction.add(
                createTransferInstruction(
                    fromTokenAccount,
                    toTokenAccount.address,
                    publicKey,
                    10* 10**9,

                )
            )
            await sendTransaction(transaction,connection)


        } catch (err: any) {
            console.log(err)
        }
    }, [connection, publicKey, mint, tokenAccount])

    return (
        <>
            <Typography.Title level={2}>Create Token</Typography.Title>
            <div className='create-mint'>
                <Button
                    type="primary"
                    size="large"
                    onClick={createMint}
                    style={{ marginRight: '20px' }}
                >
                    Create Mint
                </Button>
                <Button
                    type="primary"
                    size="large"
                    onClick={createTokenAccount}
                    style={{ marginRight: '20px' }}
                >
                    Create Token Account
                </Button>

            </div>

            <h1 style={{ textAlign: 'start' }}>Token Mint Address: {mint} </h1>
            <h1 style={{ textAlign: 'start', marginBottom: '20px' }}>Token Account Address: {tokenAccount}</h1>
            <div className='balanceToken' style={{ textAlign: 'start' }}>
                <Button
                    type="primary"
                    size="large"
                    onClick={checkBalance}
                    style={{ marginRight: '20px' }}
                >
                    Check balance
                </Button>
                <Button
                    type="primary"
                    size="large"
                    onClick={MintTo}
                    style={{ marginRight: '20px' }}
                >
                    MintTo
                </Button>
                <Button
                    type="primary"
                    size="large"
                    onClick={BurnToken}
                    style={{ marginRight: '20px' }}
                >
                    Burn Token
                </Button>
            </div>
            <h1 style={{ textAlign: 'start', marginBottom: '20px' }}>Token balance: {parseInt(balanceToken) / 10 ** 9}</h1>
            <form className='form' onSubmit={TransferToken}>

                <label htmlFor="recipient">Send Token to:</label>
                <input id="recipient" type="text"
                    className="formField"
                    placeholder="e.g. 4Zw1fXuYuJhWhu9KLEYMhiPEiqcpKd6akw3WRZCv84HA"
                    required style={{ color: '#000' }} />
                <button id="primary" >
                    Transfer Token
                </button>
            </form>
        </>
    )
}
