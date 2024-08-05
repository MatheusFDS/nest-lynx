// src/hooks/useRouteChange.ts
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import NProgress from 'nprogress';

const useRouteChange = () => {
  const router = useRouter();

  useEffect(() => {
    if (!router) return;

    const handleRouteChangeStart = () => {
      NProgress.start();
    };

    const handleRouteChangeComplete = () => {
      NProgress.done();
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeComplete);
    };
  }, [router]);
};

export default useRouteChange;
