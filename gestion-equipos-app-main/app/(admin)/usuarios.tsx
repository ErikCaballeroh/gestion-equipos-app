import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Técnico';
}

const mockUsers: UserAccount[] = [
  { id: '1', name: 'Carlos Mendoza', email: 'admin@empresa.com', role: 'Administrador' },
  { id: '2', name: 'Ana López', email: 'ana.lopez@empresa.com', role: 'Técnico' },
  { id: '3', name: 'Roberto Silva', email: 'roberto.silva@empresa.com', role: 'Técnico' },
  { id: '4', name: 'Laura Martínez', email: 'laura.martinez@empresa.com', role: 'Técnico' },
];

const RoleBadge = ({ role }: { role: UserAccount['role'] }) => {
  const isAdmin = role === 'Administrador';
  return (
    <View
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs whitespace-nowrap ${
        isAdmin ? 'bg-purple-100' : 'bg-blue-100'
      }`}
    >
      <MaterialCommunityIcons
        name="shield-account"
        size={14}
        color={isAdmin ? '#7c3aed' : '#1d4ed8'}
      />
      <Text className={`${isAdmin ? 'text-purple-700' : 'text-blue-700'}`}>{role}</Text>
    </View>
  );
};

const UserCard = ({ user, onDelete }: { user: UserAccount; onDelete: (id: string) => void }) => (
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
        <TouchableOpacity onPress={() => onDelete(user.id)}>
          <Text className="text-xs text-red-600">Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default function AdminUsuarios() {
  const router = useRouter();
  const [users, setUsers] = useState<UserAccount[]>(mockUsers);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Técnico' as UserAccount['role'],
  });

  const handleCreateUser = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      Alert.alert('Error', 'Completa todos los campos para crear el usuario');
      return;
    }

    const newUser: UserAccount = {
      id: String(users.length + 1),
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
    };

    setUsers((prev) => [...prev, newUser]);
    setShowCreateForm(false);
    setFormData({ name: '', email: '', password: '', role: 'Técnico' });
  };

  const handleDeleteUser = (id: string) => {
    Alert.alert('Eliminar usuario', '¿Estás seguro de eliminar este usuario?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => setUsers((prev) => prev.filter((u) => u.id !== id)),
      },
    ]);
  };

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="p-4">
          {/* Header */}
          <View className="flex-row items-center gap-3 mb-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 rounded-lg bg-white shadow-sm"
            >
              <MaterialCommunityIcons name="arrow-left" size={20} color="#475569" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-slate-900">Usuarios</Text>
              <Text className="text-sm text-slate-600">{users.length} cuentas</Text>
            </View>
          </View>

          {/* Users List */}
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <UserCard user={item} onDelete={handleDeleteUser} />}
            ItemSeparatorComponent={() => <View className="h-3" />}
            ListEmptyComponent={
              <View className="py-12 items-center">
                <Text className="text-slate-500">No hay usuarios registrados</Text>
              </View>
            }
          />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => setShowCreateForm(true)}
        className="absolute bottom-24 right-4 w-14 h-14 bg-sky-500 rounded-full shadow-lg items-center justify-center"
      >
        <MaterialCommunityIcons name="plus" size={24} color="white" />
      </TouchableOpacity>

      {/* Create User Modal */}
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
                  />
                </View>

                <View>
                  <Text className="text-sm font-semibold text-slate-900 mb-1">Rol</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {(['Técnico', 'Administrador'] as UserAccount['role'][]).map((role) => (
                      <TouchableOpacity
                        key={role}
                        onPress={() => setFormData((prev) => ({ ...prev, role }))}
                        className={`px-3 py-2 rounded-lg border ${
                          formData.role === role ? 'bg-sky-500 border-sky-500' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <Text className={`${formData.role === role ? 'text-white' : 'text-slate-900'}`}>
                          {role}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View className="flex-row gap-2 pt-4">
                  <TouchableOpacity
                    onPress={() => setShowCreateForm(false)}
                    className="flex-1 py-3 bg-slate-200 rounded-lg items-center"
                  >
                    <Text className="text-slate-700 font-semibold">Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleCreateUser}
                    className="flex-1 py-3 bg-sky-500 rounded-lg items-center"
                  >
                    <Text className="text-white font-semibold">Crear</Text>
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

export function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState(mockUsers);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Técnico" as "Administrador" | "Técnico",
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserAccount = {
      id: String(users.length + 1),
      name: formData.name,
      email: formData.email,
      role: formData.role,
    };
    setUsers([...users, newUser]);
    setShowCreateForm(false);
    setFormData({ name: "", email: "", password: "", role: "Técnico" });
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este usuario?")) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl text-primary">Usuarios</h1>
          <p className="text-sm text-gray-600">{users.length} cuentas</p>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3 mb-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-start gap-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-primary truncate">{user.name}</h3>
                    <p className="text-sm text-gray-600 truncate flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {user.email}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs whitespace-nowrap ${
                      user.role === "Administrador"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowCreateForm(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors active:scale-95 transform z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md">
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg text-primary">Crear Cuenta</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-4 space-y-4">
              <div>
                <label className="block text-sm mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Juan Pérez"
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="juan.perez@empresa.com"
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Contraseña</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Rol</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as any })
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="Técnico">Técnico</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}