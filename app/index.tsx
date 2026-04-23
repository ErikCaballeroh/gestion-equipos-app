import { login } from '@/firebase/auth';
import { getByField } from '@/firebase/firestore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

type AccountRole = 'Administrador' | 'Técnico';

function normalizeRole(value: unknown): AccountRole {
    const role = String(value ?? '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    return role.includes('admin') ? 'Administrador' : 'Técnico';
}

function authErrorMessage(error: unknown): string {
    const code =
        typeof error === 'object' && error !== null && 'code' in error
            ? String((error as { code?: unknown }).code)
            : '';

    if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
        return 'Correo o contraseña inválidos';
    }

    if (code.includes('too-many-requests')) {
        return 'Demasiados intentos. Intenta más tarde';
    }

    if (code.includes('network-request-failed')) {
        return 'Error de red. Verifica tu conexión';
    }

    return 'No se pudo iniciar sesión';
}

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        setError('');

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedPassword = password.trim();

        if (!normalizedEmail || !normalizedPassword) {
            setError('Por favor completa todos los campos');
            return;
        }

        setIsLoading(true);

        try {
            await login(normalizedEmail, normalizedPassword);

            const accountDocs = await getByField('accounts', 'email', normalizedEmail);
            const account = accountDocs.length > 0 ? (accountDocs[0] as Record<string, unknown>) : null;
            const role = account ? normalizeRole(account.role ?? account.rol) : normalizeRole(normalizedEmail);

            if (role === 'Administrador') {
                router.replace('/(admin)');
            } else {
                router.replace('/(tecnico)');
            }
        } catch (authError) {
            setError(authErrorMessage(authError));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-slate-50">
            <View className="flex-1 justify-center items-center p-6 min-h-screen">
                <View className="mb-8 items-center">
                    <View className="items-center mb-3">
                        <View className="flex-row items-center">
                            <Text className="text-5xl font-extrabold text-black tracking-widest">GRH</Text>
                            <View className="ml-2 justify-between h-6">
                                <View className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                                <View className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                                <View className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                            </View>
                        </View>
                        <Text className="text-[10px] text-slate-500 tracking-[4px]">INMOBILIARIA</Text>
                    </View>

                    <Text className="text-2xl font-bold text-slate-900 mb-1">Gestión de Equipos</Text>
                    <Text className="text-sm text-slate-600">Inicia sesión para continuar</Text>
                </View>

                <View className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm">
                    {error ? (
                        <View className="bg-red-50 border border-red-200 px-4 py-3 rounded-lg mb-4">
                            <Text className="text-red-600 text-sm">{error}</Text>
                        </View>
                    ) : null}

                    <Text className="text-sm font-semibold text-slate-900 mb-2">Email</Text>
                    <View className="flex-row items-center bg-slate-50 rounded-lg px-4 mb-4 border border-slate-200">
                        <MaterialCommunityIcons name="email" size={20} color="#64748b" />
                        <TextInput
                            className="flex-1 py-3 px-2 text-slate-900"
                            placeholder="correo@empresa.com"
                            placeholderTextColor="#cbd5e1"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isLoading}
                        />
                    </View>

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
                            editable={!isLoading}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={isLoading}>
                            <MaterialCommunityIcons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={isLoading}
                        className="bg-sky-500 py-3 rounded-lg items-center mb-3 flex-row justify-center"
                    >
                        {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Iniciar Sesión</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
