import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    // Mock authentication - redirect based on role
    // admin@empresa.com -> admin, any other email -> technician
    if (email.toLowerCase().includes('admin')) {
      router.push('/(admin)');
    } else {
      router.push('/(tecnico)');
    }
  };

  return (
    <ScrollView className="flex-1 bg-gradient-to-b from-slate-50 to-slate-100">
      <View className="flex-1 justify-center items-center p-6 min-h-screen">
        {/* Logo / Header */}
        <View className="mb-8 items-center">
          <View className="inline-flex items-center justify-center w-16 h-16 bg-sky-500 rounded-2xl mb-4">
            <MaterialCommunityIcons name="laptop" size={32} color="white" />
          </View>
          <Text className="text-3xl font-bold text-slate-900 mb-2">Gestión de Equipos</Text>
          <Text className="text-sm text-slate-600">Inicia sesión para continuar</Text>
        </View>

        {/* Login Card */}
        <View className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm">
          {error ? (
            <View className="bg-red-50 border border-red-200 px-4 py-3 rounded-lg mb-4">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          ) : null}

          {/* Email */}
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
            />
          </View>

          {/* Password */}
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
      </View>
    </ScrollView>
  );
}
