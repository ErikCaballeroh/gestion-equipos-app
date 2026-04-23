import { useAppStore } from '@/src/state/appStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

type UserAccount = {
    id: string;
    name: string;
    email: string;
    role: 'Administrador' | 'Técnico';
};

const RoleBadge = ({ role }: { role: UserAccount['role'] }) => {
    const isAdmin = role === 'Administrador';

    return (
        <View className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full ${isAdmin ? 'bg-purple-100' : 'bg-blue-100'}`}>
            <MaterialCommunityIcons name="shield-account" size={14} color={isAdmin ? '#7c3aed' : '#1d4ed8'} />
            <Text className={`${isAdmin ? 'text-purple-700' : 'text-blue-700'}`}>{role}</Text>
        </View>
    );
};

const UserCard = ({
    user,
    canDelete,
    onEdit,
    onDelete,
}: {
    user: UserAccount;
    canDelete: boolean;
    onEdit: (user: UserAccount) => void;
    onDelete: (id: string) => void;
}) => (
    <View className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <View className="flex-row items-start gap-3">
            <View className="p-3 bg-slate-50 rounded-lg">
                <MaterialCommunityIcons name="account" size={20} color="#0f172a" />
            </View>
            <View className="flex-1 min-w-0">
                <View className="flex-row items-start justify-between gap-2 mb-2">
                    <View className="flex-1 min-w-0">
                        <Text className="text-slate-900 font-semibold truncate">{user.name}</Text>
                        <View className="flex-row items-center gap-1 mt-1">
                            <MaterialCommunityIcons name="email" size={14} color="#64748b" />
                            <Text className="text-sm text-slate-600 truncate">{user.email}</Text>
                        </View>
                    </View>
                    <RoleBadge role={user.role} />
                </View>
                <View className="flex-row items-center gap-4">
                    <TouchableOpacity onPress={() => onEdit(user)}>
                        <Text className="text-xs text-sky-600">Editar</Text>
                    </TouchableOpacity>
                    {canDelete ? (
                        <TouchableOpacity onPress={() => onDelete(user.id)}>
                            <Text className="text-xs text-red-600">Eliminar</Text>
                        </TouchableOpacity>
                    ) : (
                        <Text className="text-xs text-slate-500">Cuenta en uso</Text>
                    )}
                </View>
            </View>
        </View>
    </View>
);

export default function AdminUsuarios() {
    const router = useRouter();
    const {
        state,
        addAccount,
        updateAccount,
        requestAccountPasswordReset,
        updateCurrentAccountPassword,
        deleteAccount,
        currentAccount,
    } = useAppStore();

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Técnico' as UserAccount['role'],
    });
    const [editData, setEditData] = useState({
        name: '',
        role: 'Técnico' as UserAccount['role'],
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const users = useMemo<UserAccount[]>(() => {
        return state.accounts.map((account) => ({
            id: account.id,
            name: account.name,
            email: account.email,
            role: account.role,
        }));
    }, [state.accounts]);

    const handleCreateUser = async () => {
        if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
            Alert.alert('Error', 'Completa todos los campos para crear el usuario');
            return;
        }

        setIsSubmitting(true);

        try {
            await addAccount({
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
                role: formData.role,
            });

            setShowCreateForm(false);
            setFormData({ name: '', email: '', password: '', role: 'Técnico' });
            Alert.alert('Usuario creado', 'La cuenta fue registrada en Firebase');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'No se pudo crear el usuario';
            Alert.alert('Error', message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = (id: string) => {
        Alert.alert('Eliminar usuario', '¿Estás seguro de eliminar este usuario?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Eliminar',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteAccount(id);
                    } catch (error) {
                        const message = error instanceof Error ? error.message : 'No se pudo eliminar el usuario';
                        Alert.alert('Error', message);
                    }
                },
            },
        ]);
    };

    const handleOpenEditUser = (user: UserAccount) => {
        setEditData({ name: user.name, role: user.role });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setEditingUser(user);
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;

        if (!editData.name.trim()) {
            Alert.alert('Error', 'El nombre es obligatorio');
            return;
        }

        setIsUpdating(true);

        try {
            await updateAccount({
                id: editingUser.id,
                name: editData.name.trim(),
                role: editData.role,
            });

            setEditingUser(null);
            Alert.alert('Usuario actualizado', 'La cuenta fue actualizada correctamente');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'No se pudo actualizar el usuario';
            Alert.alert('Error', message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!editingUser) return;

        const isOwnAccount = editingUser.id === currentAccount?.id;

        if (!isOwnAccount) {
            Alert.alert('Acción no disponible', 'Solo puedes cambiar la contraseña directamente de tu propia cuenta.');
            return;
        }

        const currentPassword = passwordData.currentPassword.trim();
        const newPassword = passwordData.newPassword.trim();
        const confirmPassword = passwordData.confirmPassword.trim();

        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Completa todos los campos de contraseña');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'La nueva contraseña debe tener mínimo 6 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'La confirmación no coincide con la nueva contraseña');
            return;
        }

        setIsPasswordSubmitting(true);

        try {
            await updateCurrentAccountPassword({
                accountId: editingUser.id,
                currentPassword,
                newPassword,
            });

            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            Alert.alert('Contraseña actualizada', 'Tu contraseña fue cambiada correctamente');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'No se pudo actualizar la contraseña';
            Alert.alert('Error', message);
        } finally {
            setIsPasswordSubmitting(false);
        }
    };

    const handleSendResetPassword = async () => {
        if (!editingUser) return;

        setIsPasswordSubmitting(true);

        try {
            await requestAccountPasswordReset(editingUser.email);
            Alert.alert('Correo enviado', `Se envió un enlace de restablecimiento a ${editingUser.email}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'No se pudo enviar el correo de restablecimiento';
            Alert.alert('Error', message);
        } finally {
            setIsPasswordSubmitting(false);
        }
    };

    return (
        <View className="flex-1 bg-slate-50 pt-6">
            <FlatList
                data={users}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <UserCard
                        user={item}
                        canDelete={item.id !== currentAccount?.id}
                        onEdit={handleOpenEditUser}
                        onDelete={handleDeleteUser}
                    />
                )}
                ItemSeparatorComponent={() => <View className="h-3" />}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                ListHeaderComponent={
                    <View className="flex-row items-center gap-3 mb-6">
                        <TouchableOpacity onPress={() => router.back()} className="p-2 rounded-lg bg-white shadow-sm">
                            <MaterialCommunityIcons name="arrow-left" size={20} color="#475569" />
                        </TouchableOpacity>
                        <View className="flex-1">
                            <Text className="text-2xl font-bold text-slate-900">Usuarios</Text>
                            <Text className="text-sm text-slate-600">{users.length} cuentas</Text>
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    <View className="py-12 items-center">
                        <Text className="text-slate-500">No hay usuarios registrados</Text>
                    </View>
                }
            />

            <TouchableOpacity
                onPress={() => setShowCreateForm(true)}
                className="absolute bottom-24 right-4 w-14 h-14 bg-sky-500 rounded-full shadow-lg items-center justify-center"
            >
                <MaterialCommunityIcons name="plus" size={24} color="white" />
            </TouchableOpacity>

            <Modal visible={showCreateForm} animationType="slide" transparent>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-2xl max-h-[90%]">
                        <View className="p-4 border-b border-slate-200 flex-row items-center justify-between">
                            <Text className="text-lg font-semibold text-slate-900">Crear Cuenta</Text>
                            <TouchableOpacity onPress={() => setShowCreateForm(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#475569" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView className="p-4">
                            <View className="space-y-4">
                                <View>
                                    <Text className="text-sm font-semibold text-slate-900 mb-1">Nombre</Text>
                                    <TextInput
                                        value={formData.name}
                                        onChangeText={(value) => setFormData((prev) => ({ ...prev, name: value }))}
                                        placeholder="Juan Pérez"
                                        className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg"
                                        placeholderTextColor="#64748b"
                                        editable={!isSubmitting}
                                    />
                                </View>

                                <View>
                                    <Text className="text-sm font-semibold text-slate-900 mb-1">Email</Text>
                                    <TextInput
                                        value={formData.email}
                                        onChangeText={(value) => setFormData((prev) => ({ ...prev, email: value }))}
                                        placeholder="juan.perez@empresa.com"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg"
                                        placeholderTextColor="#64748b"
                                        editable={!isSubmitting}
                                    />
                                </View>

                                <View>
                                    <Text className="text-sm font-semibold text-slate-900 mb-1">Contraseña</Text>
                                    <TextInput
                                        value={formData.password}
                                        onChangeText={(value) => setFormData((prev) => ({ ...prev, password: value }))}
                                        placeholder="••••••••"
                                        secureTextEntry
                                        className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg"
                                        placeholderTextColor="#64748b"
                                        editable={!isSubmitting}
                                    />
                                </View>

                                <View>
                                    <Text className="text-sm font-semibold text-slate-900 mb-1">Rol</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {(['Técnico', 'Administrador'] as UserAccount['role'][]).map((role) => (
                                            <TouchableOpacity
                                                key={role}
                                                onPress={() => setFormData((prev) => ({ ...prev, role }))}
                                                className={`px-4 py-2 rounded-lg border ${formData.role === role ? 'bg-sky-500 border-sky-500' : 'bg-slate-50 border-slate-200'}`}
                                                disabled={isSubmitting}
                                            >
                                                <Text className={`${formData.role === role ? 'text-white' : 'text-slate-900'}`}>{role}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View className="flex-row gap-2 pt-4">
                                    <TouchableOpacity
                                        onPress={() => setShowCreateForm(false)}
                                        className="flex-1 py-3 bg-slate-200 rounded-lg items-center"
                                        disabled={isSubmitting}
                                    >
                                        <Text className="text-slate-700 font-semibold">Cancelar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handleCreateUser}
                                        className="flex-1 py-3 bg-sky-500 rounded-lg items-center"
                                        disabled={isSubmitting}
                                    >
                                        <Text className="text-white font-semibold">Crear</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal visible={!!editingUser} animationType="slide" transparent onRequestClose={() => setEditingUser(null)}>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-2xl max-h-[90%]">
                        <View className="p-4 border-b border-slate-200 flex-row items-center justify-between">
                            <Text className="text-lg font-semibold text-slate-900">Editar Cuenta</Text>
                            <TouchableOpacity onPress={() => setEditingUser(null)} disabled={isUpdating}>
                                <MaterialCommunityIcons name="close" size={24} color="#475569" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView className="p-4">
                            <View className="space-y-4">
                                <View>
                                    <Text className="text-sm font-semibold text-slate-900 mb-1">Nombre</Text>
                                    <TextInput
                                        value={editData.name}
                                        onChangeText={(value) => setEditData((prev) => ({ ...prev, name: value }))}
                                        placeholder="Juan Pérez"
                                        className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg"
                                        placeholderTextColor="#64748b"
                                        editable={!isUpdating}
                                    />
                                </View>

                                <View>
                                    <Text className="text-sm font-semibold text-slate-900 mb-1">Email</Text>
                                    <View className="w-full px-3 py-3 bg-slate-100 border border-slate-200 rounded-lg">
                                        <Text className="text-slate-600">{editingUser?.email ?? 'Sin correo'}</Text>
                                    </View>
                                    <Text className="text-xs text-slate-500 mt-1">El correo se muestra como referencia y no se modifica aquí.</Text>
                                </View>

                                <View>
                                    <Text className="text-sm font-semibold text-slate-900 mb-1">Rol</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {(['Técnico', 'Administrador'] as UserAccount['role'][]).map((role) => (
                                            <TouchableOpacity
                                                key={role}
                                                onPress={() => setEditData((prev) => ({ ...prev, role }))}
                                                className={`px-4 py-2 rounded-lg border ${editData.role === role ? 'bg-sky-500 border-sky-500' : 'bg-slate-50 border-slate-200'}`}
                                                disabled={isUpdating}
                                            >
                                                <Text className={`${editData.role === role ? 'text-white' : 'text-slate-900'}`}>{role}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View className="pt-2 border-t border-slate-200">
                                    <Text className="text-sm font-semibold text-slate-900 mb-2">Contraseña</Text>
                                    {editingUser?.id === currentAccount?.id ? (
                                        <View className="space-y-3">
                                            <View>
                                                <Text className="text-sm font-semibold text-slate-900 mb-1">Contraseña actual</Text>
                                                <TextInput
                                                    value={passwordData.currentPassword}
                                                    onChangeText={(value) => setPasswordData((prev) => ({ ...prev, currentPassword: value }))}
                                                    placeholder="••••••••"
                                                    secureTextEntry
                                                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg"
                                                    placeholderTextColor="#64748b"
                                                    editable={!isPasswordSubmitting}
                                                />
                                            </View>
                                            <View>
                                                <Text className="text-sm font-semibold text-slate-900 mb-1">Nueva contraseña</Text>
                                                <TextInput
                                                    value={passwordData.newPassword}
                                                    onChangeText={(value) => setPasswordData((prev) => ({ ...prev, newPassword: value }))}
                                                    placeholder="Mínimo 6 caracteres"
                                                    secureTextEntry
                                                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg"
                                                    placeholderTextColor="#64748b"
                                                    editable={!isPasswordSubmitting}
                                                />
                                            </View>
                                            <View>
                                                <Text className="text-sm font-semibold text-slate-900 mb-1">Confirmar nueva contraseña</Text>
                                                <TextInput
                                                    value={passwordData.confirmPassword}
                                                    onChangeText={(value) => setPasswordData((prev) => ({ ...prev, confirmPassword: value }))}
                                                    placeholder="Repite la nueva contraseña"
                                                    secureTextEntry
                                                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg"
                                                    placeholderTextColor="#64748b"
                                                    editable={!isPasswordSubmitting}
                                                />
                                            </View>
                                            <TouchableOpacity
                                                onPress={handleUpdatePassword}
                                                className="py-3 bg-amber-500 rounded-lg items-center"
                                                disabled={isPasswordSubmitting}
                                            >
                                                <Text className="text-white font-semibold">Actualizar contraseña</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <View className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                                            <Text className="text-sm text-slate-700 mb-3">
                                                Para otras cuentas, Firebase requiere restablecimiento por correo.
                                            </Text>
                                            <TouchableOpacity
                                                onPress={handleSendResetPassword}
                                                className="py-3 bg-amber-500 rounded-lg items-center"
                                                disabled={isPasswordSubmitting}
                                            >
                                                <Text className="text-white font-semibold">Enviar enlace de restablecimiento</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>

                                <View className="flex-row gap-2 pt-4">
                                    <TouchableOpacity
                                        onPress={() => setEditingUser(null)}
                                        className="flex-1 py-3 bg-slate-200 rounded-lg items-center"
                                        disabled={isUpdating || isPasswordSubmitting}
                                    >
                                        <Text className="text-slate-700 font-semibold">Cancelar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handleUpdateUser}
                                        className="flex-1 py-3 bg-sky-500 rounded-lg items-center"
                                        disabled={isUpdating || isPasswordSubmitting}
                                    >
                                        <Text className="text-white font-semibold">Guardar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
