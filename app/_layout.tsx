import { Stack } from 'expo-router';
import '../global.css';

const RootLayout = () => {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: 'Login',
                }}
            />
            <Stack.Screen
                name="(admin)"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="(tecnico)"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="+not-found"
                options={{
                    title: 'Página no encontrada',
                }}
            />
        </Stack>
    );
};

export default RootLayout;