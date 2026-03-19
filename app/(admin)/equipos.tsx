import { FlatList, ScrollView, Text, View } from 'react-native';

export default function AdminEquipos() {
    const equipos: any[] = [];

    return (
        <ScrollView className="flex-1 bg-slate-50">
            <View className="p-4">
                <Text className="text-2xl font-bold text-slate-900 mb-6">
                    Gestión de Equipos
                </Text>

                {equipos.length === 0 ? (
                    <View className="bg-white rounded-lg p-6 items-center justify-center">
                        <Text className="text-slate-500">No hay equipos registrados</Text>
                    </View>
                ) : (
                    <FlatList
                        data={equipos}
                        renderItem={({ item }) => (
                            <View className="bg-white rounded-lg p-4 mb-3">
                                <Text className="font-semibold text-slate-900">{item.name}</Text>
                            </View>
                        )}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                    />
                )}
            </View>
        </ScrollView>
    );
}
