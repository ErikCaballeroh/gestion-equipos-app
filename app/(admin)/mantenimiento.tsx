import { useRouter } from 'expo-router';
import { MantenimientoScreen } from '@/src/ui/screens/MantenimientoScreen';

export default function AdminMantenimiento() {
  const router = useRouter();
  return <MantenimientoScreen onBack={() => router.back()} technicianName="Admin" />;
}
