import { useRouter } from 'expo-router';

import { AsignacionScreen } from '@/src/ui/screens/AsignacionScreen';

export default function TecnicoAsignacion() {
  const router = useRouter();
  return <AsignacionScreen onBack={() => router.back()} />;
}
