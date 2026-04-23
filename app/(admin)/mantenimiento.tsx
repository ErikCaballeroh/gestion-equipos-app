import { useAppStore } from '@/src/state/appStore';
import { MantenimientoScreen } from '@/src/ui/screens/MantenimientoScreen';
import { useRouter } from 'expo-router';

export default function AdminMantenimiento() {
  const router = useRouter();
  const { currentAccount } = useAppStore();

  return <MantenimientoScreen onBack={() => router.back()} technicianName={currentAccount?.name ?? 'Administrador'} />;
}
