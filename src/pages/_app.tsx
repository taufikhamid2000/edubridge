import '@/styles/globals.css';
import '@/styles/shared.css';
import '@/styles/QnA.module.css';

import { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
