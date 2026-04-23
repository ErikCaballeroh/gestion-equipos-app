import { useRouter } from 'expo-router';

import { useAppStore } from '@/src/state/appStore';
import { MantenimientoScreen } from '@/src/ui/screens/MantenimientoScreen';

export default function TecnicoMantenimiento() {
  const router = useRouter();
  const { currentAccount } = useAppStore();

  return <MantenimientoScreen onBack={() => router.back()} technicianName={currentAccount?.name ?? 'Técnico'} />;
}
