import React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Image, Col, Layout, Row, Space, Typography, Button } from 'antd'
import * as web3 from '@solana/web3.js'

import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  getMinimumBalanceForRentExemptMint,
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,

} from "@solana/spl-token";
import '../css/index.less'

function CreateToken() {
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
  }, [connection, publicKey, mint]);

  //Create Token Account
  const [tokenAccount, setTokenAccount] = useState("");
  const createTokenAccount = async (event: any) => {
    event.preventDefault();
    if (!connection || !publicKey) {
      return;
    }
    const transaction = new web3.Transaction();
    const owner = new web3.PublicKey(event.target.owner.value);
    const mint = new web3.PublicKey(event.target.mint.value);

    const associatedToken = await getAssociatedTokenAddress(
      mint,
      owner,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    transaction.add(
      createAssociatedTokenAccountInstruction(
        publicKey,
        associatedToken,
        owner,
        mint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
    await sendTransaction(transaction, connection).then(() => {
      setTokenAccount(associatedToken.toString());
    });
  }
  return (
    <>
      <Typography.Title level={2}>Create Token and Send Token</Typography.Title>
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
      <h1 style={{ textAlign: 'start' }}>Token Mint Address: {mint} </h1>
      <form onSubmit={createTokenAccount} className="form">
        <label htmlFor="owner">Token Mint:</label>
        <input
          id="mint"
          type="text"
          className="formField"
          placeholder="Enter Token Mint"
          required
        />
        <label htmlFor="owner">Token Account Owner:</label>
        <input
          id="owner"
          type="text"
          className="formField"
          placeholder="Enter Token Account Owner PublicKey"
          required
        />
        <button id="primary" type='submit' >
          Create Token Account
        </button>
      </form>

      <h1 style={{ textAlign: 'start', marginBottom: '20px' }}>Token Account Address: {tokenAccount}</h1>
    </>
  )
}

export default CreateToken