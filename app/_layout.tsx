import { Stack } from 'expo-router';
import '../global.css';
import { AppStoreProvider } from '@/src/state/appStore';

const RootLayout = () => {
    return (
        <AppStoreProvider>
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
        </AppStoreProvider>
    );
};

export default RootLayout;
