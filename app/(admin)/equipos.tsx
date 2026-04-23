import { useRouter } from 'expo-router';

import { EquiposScreen } from '@/src/ui/screens/EquiposScreen';

export default function AdminEquipos() {
  const router = useRouter();
  return <EquiposScreen onBack={() => router.back()} />;
}
