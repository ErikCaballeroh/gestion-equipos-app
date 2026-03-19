import { ScrollView, Text, View } from 'react-native';

export default function AdminDashboard() {
    return (
        <ScrollView className="flex-1 bg-slate-50">
            <View className="p-4">
                <Text className="text-2xl font-bold text-slate-900 mb-6">
                    Dashboard Administrativo
                </Text>

                <View className="bg-white rounded-lg p-4 mb-4 shadow">
                    <Text className="text-lg font-semibold text-slate-900">Equipos Totales</Text>
                    <Text className="text-3xl font-bold text-sky-500 mt-2">0</Text>
                </View>

                <View className="bg-white rounded-lg p-4 mb-4 shadow">
                    <Text className="text-lg font-semibold text-slate-900">Usuarios</Text>
                    <Text className="text-3xl font-bold text-emerald-500 mt-2">0</Text>
                </View>

                <View className="bg-white rounded-lg p-4 mb-4 shadow">
                    <Text className="text-lg font-semibold text-slate-900">En Mantenimiento</Text>
                    <Text className="text-3xl font-bold text-orange-500 mt-2">0</Text>
                </View>
            </View>
        </ScrollView>
    );
}
