import { useRouter } from 'expo-router';

import { HistorialScreen } from '@/src/ui/screens/HistorialScreen';

export default function TecnicoHistorial() {
  const router = useRouter();
  return <HistorialScreen onBack={() => router.back()} />;
}
