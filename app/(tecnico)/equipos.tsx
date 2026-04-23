import { useRouter } from 'expo-router';

import { EquiposScreen } from '@/src/ui/screens/EquiposScreen';

export default function TecnicoEquipos() {
  const router = useRouter();
  return <EquiposScreen onBack={() => router.back()} />;
}
