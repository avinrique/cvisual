'use client';
import dynamic from 'next/dynamic';

const SceneManager = dynamic(() => import('@/components/SceneManager'), {
  ssr: false,
});

export default function Home() {
  return <SceneManager />;
}
