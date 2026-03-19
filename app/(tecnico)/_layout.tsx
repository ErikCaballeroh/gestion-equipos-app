import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TecnicoLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: true,
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
                    headerTitle: 'Técnico Dashboard',
                }}
            />
            <Tabs.Screen
                name="equipos"
                options={{
                    title: 'Equipos',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="laptop" size={24} color={color} />
                    ),
                    headerTitle: 'Equipos Asignados',
                }}
            />
            <Tabs.Screen
                name="asignacion"
                options={{
                    title: 'Asignación',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="account-convert" size={24} color={color} />
                    ),
                    headerTitle: 'Mis Asignaciones',
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
        </Tabs>
    );
}
