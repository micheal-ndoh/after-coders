'use client';

import { useState, useEffect } from 'react';
import { DocusealBuilder } from '@docuseal/react';

const DocusealEditor = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/docuseal/builder_token', { method: 'POST' });
        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error('Failed to fetch token:', error);
      }
    };

    fetchToken();
  }, []);

  return token ? <DocusealBuilder token={token} /> : <div>Loading...</div>;
};

export default DocusealEditor;
