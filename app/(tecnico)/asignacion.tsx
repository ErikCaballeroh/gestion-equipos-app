import { ScrollView, Text, View } from 'react-native';

export default function TecnicoAsignacion() {
    return (
        <ScrollView className="flex-1 bg-slate-50">
            <View className="p-4">
                <Text className="text-2xl font-bold text-slate-900 mb-6">
                    Mis Asignaciones
                </Text>

                <View className="bg-white rounded-lg p-6 items-center justify-center">
                    <Text className="text-slate-500">No hay asignaciones pendientes</Text>
                </View>
            </View>
        </ScrollView>
    );
}
