import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFound() {
    return (
        <View className="flex-1 bg-slate-50 justify-center items-center p-4">
            <Text className="text-4xl font-bold text-slate-900 mb-2">404</Text>
            <Text className="text-xl text-slate-600 mb-4">Página no encontrada</Text>
            <Text className="text-slate-500 text-center mb-6">
                La página que buscas no existe
            </Text>
            <Link href="/" className="bg-sky-500 text-white font-semibold px-6 py-3 rounded-lg">
                Volver al inicio
            </Link>
        </View>
    );
}
