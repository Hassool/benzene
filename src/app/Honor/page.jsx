// Honor/page.jsx
"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function page() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/'); // redirect to home
  }, []);
  return null;
}
