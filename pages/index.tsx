import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import { Button, Card, Col, Container, Row, ThemeProvider } from 'react-bootstrap';
import styles from '../styles/Home.module.css';
import { useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import channelPubContract from '../contracts/ChannelPublication.json';
import { erc721ABI } from 'wagmi';
import { ethers } from 'ethers';
import { Result } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';

type TrProps = {
  hash: string
}

const TransactionStatus = ({hash}: TrProps) => {
  const { data, isError, isLoading } = useWaitForTransaction({
    hash: hash,
  })

  if (hash === '') return <div>Waiting</div>
  if (isLoading) return <div>Processing…</div>
  if (isError) return <div>Transaction error</div>
  return <div>Transaction: {JSON.stringify(data)}</div>
}



const Home: NextPage = () => {

  const tokenContractAddr = '0x5aa0C98693C94D039056E5504594A708Cc68c424'
  const channelPubContractAddr = '0xD4273Bb3FAc03AA0e052e3A2A742A4654D7cb5Dc'
  const tokenType = ethers.utils.formatBytes32String('CHP01')
  const TOKEN_ID = 2

  const [channelContent, setChannelContent] = useState('');
  const [content, setContent] = useState("");
  const [resultHash, setResultHash] = useState("");

  // read from contract
  const { data: publishedContent, isError, isLoading } = useContractRead({
    addressOrName: channelPubContractAddr,
    contractInterface: channelPubContract.abi,
    functionName: 'publishedContent',
    args: [tokenType, TOKEN_ID]
  })

  // write to contract - publishContent
  const { config } = usePrepareContractWrite({
    addressOrName: channelPubContractAddr,
    contractInterface: channelPubContract.abi,
    functionName: 'publishContent',
    args: [tokenType, 2, content],
    onSuccess: (result) => { console.log('Final Result: ', result) }
  })
  const { data: resultPubCnt, isLoading: isLdngPubCnt, isSuccess, write, status } = useContractWrite(config)

  useEffect(() => {
    console.log('resultPubCnt: ', resultPubCnt)
    resultPubCnt && setResultHash(resultPubCnt?.hash)
  }, [resultPubCnt]);

  useEffect(() => {
    console.log('isLdngPubCnt: ', isLdngPubCnt)
  }, [isLdngPubCnt]);

  useEffect(() => {
    console.log('status: ', status)
  }, [status]);

  useEffect(() => {
    console.log('isSuccess: ', isSuccess)
  }, [isSuccess]);

  useEffect(() => {
      setChannelContent(`${publishedContent}`)
  }, [publishedContent]);


  return (
    <ThemeProvider
      breakpoints={['xxxl', 'xxl', 'xl', 'lg', 'md', 'sm', 'xs', 'xxs']}
      minBreakpoint="xxs"
    >
      <div className={styles.container}>
        <Head>
          <title>Web3 Channels Management</title>
          <meta
            name="description"
            content="Generated by @rainbow-me/create-rainbowkit"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <ConnectButton />

          <h1 className={styles.title}>
            Welcome to Web3 Channels Management
          </h1>

          <div className={styles.grid}>
            <Card>
              <Card.Body>
                <Card.Title>Published Content</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">Token#{TOKEN_ID}</Card.Subtitle>
                <Card.Text>
                  {channelContent}
                </Card.Text>
                <Card.Link href="#">Transaction</Card.Link>
              </Card.Body>
            </Card>
          </div>
          <br />
          <div className={styles.grid}>
            <Container fluid>
              <Row>
                <Col><h2>Update content</h2></Col>
              </Row>
              <Row>
                <Col>
                  <form>
                    <input
                      type="text"
                      placeholder="Channel Content"
                      name="content"
                      onChange={(e) => setContent(e.target.value)}
                    />
                    {" "}
                    <Button variant="primary" onClick={() => write?.()}>
                      Publish
                    </Button>
                  </form>
                </Col>
              </Row>
            </Container>
          </div>

          <br />

          {resultHash && <div>Transaction Hash: {resultHash}</div>}
          
        </main>

        <footer className={styles.footer}>
          <a href="https://www.balcao.xyz" target="_blank" rel="noopener noreferrer">
            Web3 Channels Management.
          </a>
        </footer>
      </div>
    </ThemeProvider>
  );
};

export default Home;
