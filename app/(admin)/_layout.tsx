import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function AdminLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#0ea5e9',
                tabBarInactiveTintColor: '#94a3b8',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="view-dashboard" size={24} color={color} />
                    ),
                    headerTitle: 'Admin Dashboard',
                }}
            />
            <Tabs.Screen
                name="equipos"
                options={{
                    title: 'Equipos',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="laptop" size={24} color={color} />
                    ),
                    headerTitle: 'Gestión de Equipos',
                }}
            />
            <Tabs.Screen
                name="asignacion"
                options={{
                    title: 'Asignación',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="account-convert" size={24} color={color} />
                    ),
                    headerTitle: 'Asignación de Equipos',
                }}
            />
            <Tabs.Screen
                name="mantenimiento"
                options={{
                    title: 'Mantenimiento',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="wrench" size={24} color={color} />
                    ),
                    headerTitle: 'Mantenimiento',
                }}
            />
            <Tabs.Screen
                name="usuarios"
                options={{
                    title: 'Usuarios',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="account-group" size={24} color={color} />
                    ),
                    headerTitle: 'Gestión de Usuarios',
                }}
            />
        </Tabs>
    );
}
