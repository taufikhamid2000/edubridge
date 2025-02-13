import '@/styles/globals.css';
import Head from 'next/head';

import { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>EduBridge - Learn, Earn, Grow</title>
        <meta
          name="description"
          content="Empowering students and educators with tools to learn, earn and grow."
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
 