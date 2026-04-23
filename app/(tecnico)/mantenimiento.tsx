import { useRouter } from 'expo-router';

import { MantenimientoScreen } from '@/src/ui/screens/MantenimientoScreen';

export default function TecnicoMantenimiento() {
  const router = useRouter();
  return <MantenimientoScreen onBack={() => router.back()} technicianName="Técnico" />;
}
