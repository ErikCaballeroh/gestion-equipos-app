import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [userType, setUserType] = useState<'admin' | 'tecnico'>('tecnico');
    const router = useRouter();

    const handleLogin = () => {
        if (email.trim() && password.trim()) {
            if (userType === 'admin') {
                router.push('/(admin)');
            } else {
                router.push('/(tecnico)');
            }
        }
    };

    return (
        <ScrollView className="flex-1 bg-gradient-to-b from-sky-50 to-sky-100">
            <View className="flex-1 justify-center items-center p-6 min-h-screen">
                {/* Header */}
                <View className="mb-8 items-center">
                    <MaterialCommunityIcons name="laptop" size={64} color="#0ea5e9" />
                    <Text className="text-3xl font-bold text-slate-900 mt-4">Gestión Equipos</Text>
                    <Text className="text-slate-600 mt-2">Sistema de Administración</Text>
                </View>

                {/* Card */}
                <View className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm">
                    {/* User Type Selector */}
                    <Text className="text-lg font-semibold text-slate-900 mb-3">Tipo de Usuario</Text>
                    <View className="flex-row gap-3 mb-6">
                        <TouchableOpacity
                            onPress={() => setUserType('tecnico')}
                            className={`flex-1 py-3 rounded-lg border-2 items-center ${userType === 'tecnico'
                                    ? 'bg-sky-500 border-sky-500'
                                    : 'bg-slate-50 border-slate-200'
                                }`}
                        >
                            <Text
                                className={`font-semibold ${userType === 'tecnico' ? 'text-white' : 'text-slate-900'
                                    }`}
                            >
                                Técnico
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setUserType('admin')}
                            className={`flex-1 py-3 rounded-lg border-2 items-center ${userType === 'admin'
                                    ? 'bg-sky-500 border-sky-500'
                                    : 'bg-slate-50 border-slate-200'
                                }`}
                        >
                            <Text
                                className={`font-semibold ${userType === 'admin' ? 'text-white' : 'text-slate-900'
                                    }`}
                            >
                                Admin
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Email Input */}
                    <Text className="text-sm font-semibold text-slate-900 mb-2">Email</Text>
                    <View className="flex-row items-center bg-slate-50 rounded-lg px-4 mb-4 border border-slate-200">
                        <MaterialCommunityIcons name="email" size={20} color="#64748b" />
                        <TextInput
                            className="flex-1 py-3 px-2 text-slate-900"
                            placeholder="tu@email.com"
                            placeholderTextColor="#cbd5e1"
                            value={email}
                            onChangeText={setEmail}
                            editable={true}
                        />
                    </View>

                    {/* Password Input */}
                    <Text className="text-sm font-semibold text-slate-900 mb-2">Contraseña</Text>
                    <View className="flex-row items-center bg-slate-50 rounded-lg px-4 mb-6 border border-slate-200">
                        <MaterialCommunityIcons name="lock" size={20} color="#64748b" />
                        <TextInput
                            className="flex-1 py-3 px-2 text-slate-900"
                            placeholder="Contraseña"
                            placeholderTextColor="#cbd5e1"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <MaterialCommunityIcons
                                name={showPassword ? 'eye-off' : 'eye'}
                                size={20}
                                color="#64748b"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity
                        onPress={handleLogin}
                        className="bg-sky-500 py-3 rounded-lg items-center mb-3"
                    >
                        <Text className="text-white font-bold text-lg">Iniciar Sesión</Text>
                    </TouchableOpacity>

                    {/* Forgot Password */}
                    <TouchableOpacity className="items-center">
                        <Text className="text-sky-500 font-semibold">¿Olvidaste tu contraseña?</Text>
                    </TouchableOpacity>
                </View>

                {/* Demo Info */}
                <View className="mt-6 p-4 bg-blue-50 rounded-lg w-full max-w-sm border border-blue-200">
                    <Text className="text-sm text-slate-700 mb-2">
                        <Text className="font-semibold">Demo:</Text> Usa cualquier email y contraseña
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}