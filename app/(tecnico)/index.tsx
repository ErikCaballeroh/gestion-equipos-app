import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const stats = [
  { title: 'Total de Equipos', value: 48, icon: 'monitor', color: '#64748b' },
  { title: 'Disponibles', value: 15, icon: 'check-circle', color: '#22c55e' },
  { title: 'Asignados', value: 25, icon: 'account-check', color: '#0ea5e9' },
  { title: 'En Mantenimiento', value: 5, icon: 'wrench', color: '#f59e0b' },
  { title: 'Dañados', value: 3, icon: 'alert-circle', color: '#ef4444' },
];

const quickActions = [
  { title: 'Equipos', path: '/(tecnico)/equipos', icon: 'desktop-classic', bg: 'bg-blue-500' },
  { title: 'Asignación', path: '/(tecnico)/asignacion', icon: 'account-cog', bg: 'bg-emerald-500' },
  { title: 'Mantenimiento', path: '/(tecnico)/mantenimiento', icon: 'wrench', bg: 'bg-amber-500' },
];

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-slate-50 pt-6" contentContainerStyle={{ paddingBottom: 30 }}>
      <View className="p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-2xl font-bold text-slate-900">Dashboard</Text>
            <Text className="text-sm text-slate-600">Panel de Técnico</Text>
          </View>
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            className="p-3 rounded-lg bg-white shadow-sm"
            accessibilityLabel="Cerrar sesión"
          >
            <MaterialCommunityIcons name="logout" size={20} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View className="flex-row flex-wrap justify-between mb-6">
          {stats.map((stat) => (
            <View key={stat.title} className="bg-white rounded-xl p-4 shadow-sm w-[48%] mb-3">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-sm font-semibold text-slate-900">{stat.title}</Text>
                  <Text className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</Text>
                </View>
                <View className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: stat.color }}>
                  <MaterialCommunityIcons name={stat.icon} size={20} color="white" />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-slate-900 mb-3">Accesos Rápidos</Text>
          <View className="flex-row flex-wrap justify-between gap-3">
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.path}
                onPress={() => router.push(action.path)}
                className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 w-[48%]"
              >
                <View className={`${action.bg} w-12 h-12 rounded-lg items-center justify-center mb-3`}>
                  <MaterialCommunityIcons name={action.icon} size={22} color="white" />
                </View>
                <Text className="text-sm text-slate-900">{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </View>
    </ScrollView>
  );
}
