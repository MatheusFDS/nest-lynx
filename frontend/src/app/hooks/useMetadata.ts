import { useState, useEffect } from 'react';
import { fetchMetadata } from '../../services/metadataService';
import { Column, Metadata } from '../../types';

const useMetadata = (token: string) => {
  const [metadata, setMetadata] = useState<Metadata | null>(null);

  useEffect(() => {
    const getMetadata = async () => {
      try {
        const data = await fetchMetadata(token);
        setMetadata(data);
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    };

    getMetadata();
  }, [token]);

  return metadata;
};

export default useMetadata;
export type { Column, Metadata };
