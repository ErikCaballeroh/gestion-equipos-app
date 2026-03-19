import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Equipment {
  id: string;
  serialNumber: string;
  type: 'Escritorio' | 'Laptop' | 'Servidor' | 'Periféricos' | 'Teléfonos';
  brand: string;
  model: string;
  status: 'disponible' | 'asignado' | 'mantenimiento' | 'dañado';
  assignedTo?: string;
}

const mockEquipment: Equipment[] = [
  { id: '1', serialNumber: 'LAP-001', type: 'Laptop', brand: 'Dell', model: 'Latitude 5420', status: 'asignado', assignedTo: 'Juan Pérez' },
  { id: '2', serialNumber: 'DSK-002', type: 'Escritorio', brand: 'HP', model: 'EliteDesk 800', status: 'disponible' },
  { id: '3', serialNumber: 'SRV-003', type: 'Servidor', brand: 'Dell', model: 'PowerEdge R740', status: 'mantenimiento' },
  { id: '4', serialNumber: 'LAP-004', type: 'Laptop', brand: 'Lenovo', model: 'ThinkPad T14', status: 'dañado' },
  { id: '5', serialNumber: 'DSK-005', type: 'Escritorio', brand: 'Dell', model: 'OptiPlex 7090', status: 'disponible' },
  { id: '6', serialNumber: 'LAP-006', type: 'Laptop', brand: 'HP', model: 'ProBook 450', status: 'asignado', assignedTo: 'María García' },
  { id: '7', serialNumber: 'PRT-007', type: 'Periféricos', brand: 'Lenovo', model: '2', status: 'disponible' },
  { id: '8', serialNumber: 'LAP-008', type: 'Laptop', brand: 'Apple', model: 'MacBook Pro 14', status: 'mantenimiento' },
  { id: '9', serialNumber: 'TEL-009', type: 'Teléfonos', brand: 'Iphone', model: '13 Pro', status: 'disponible' },
];

const statusColors = {
  disponible: '#22c55e',
  asignado: '#0ea5e9',
  mantenimiento: '#f59e0b',
  dañado: '#ef4444',
};

const statusLabels = {
  disponible: 'Disponible',
  asignado: 'Asignado',
  mantenimiento: 'Mantenimiento',
  dañado: 'Dañado',
};

export default function AdminEquipos() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'Escritorio' | 'Laptop' | 'Servidor' | 'Periféricos' | 'Teléfonos' | 'Todos'>('Todos');
  const [filterStatus, setFilterStatus] = useState<'disponible' | 'asignado' | 'mantenimiento' | 'dañado' | 'Todos'>('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredEquipment = mockEquipment.filter((eq) => {
    const matchesSearch =
      eq.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      eq.brand.toLowerCase().includes(search.toLowerCase()) ||
      eq.model.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'Todos' || eq.type === filterType;
    const matchesStatus = filterStatus === 'Todos' || eq.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const renderEquipmentItem = ({ item }: { item: Equipment }) => (
    <TouchableOpacity
      onPress={() => setShowAddForm(true)}
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-slate-200"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-slate-900">{item.serialNumber}</Text>
          <Text className="text-sm text-slate-600">{item.brand} {item.model}</Text>
          <Text className="text-xs text-slate-500">{item.type}</Text>
          {item.assignedTo && (
            <Text className="text-xs text-slate-500">Asignado a: {item.assignedTo}</Text>
          )}
        </View>
        <View className="items-end">
          <View
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: statusColors[item.status] + '20' }}
          >
            <Text
              className="text-xs font-medium"
              style={{ color: statusColors[item.status] }}
            >
              {statusLabels[item.status]}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

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
              <Text className="text-2xl font-bold text-slate-900">Equipos</Text>
              <Text className="text-sm text-slate-600">{filteredEquipment.length} equipos</Text>
            </View>
          </View>

          {/* Search */}
          <View className="relative mb-3">
            <MaterialCommunityIcons name="magnify" size={20} color="#64748b" style={{ position: 'absolute', left: 12, top: 12 }} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar equipo..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg"
              placeholderTextColor="#64748b"
            />
          </View>

          {/* Filter Toggle */}
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            className="flex-row items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg mb-4"
          >
            <MaterialCommunityIcons name="filter-variant" size={16} color="#475569" />
            <Text className="text-sm text-slate-900">Filtros</Text>
          </TouchableOpacity>

          {/* Filters */}
          {showFilters && (
            <View className="bg-white rounded-lg border border-slate-200 p-4 mb-4 space-y-3">
              <View>
                <Text className="text-sm font-semibold text-slate-900 mb-2">Tipo</Text>
                <View className="flex-row flex-wrap gap-2">
                  {['Todos', 'Escritorio', 'Laptop', 'Servidor', 'Periféricos', 'Teléfonos'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setFilterType(type as any)}
                      className={`px-3 py-1 rounded-full border ${filterType === type ? 'bg-sky-500 border-sky-500' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <Text className={`text-xs ${filterType === type ? 'text-white' : 'text-slate-900'}`}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View>
                <Text className="text-sm font-semibold text-slate-900 mb-2">Estado</Text>
                <View className="flex-row flex-wrap gap-2">
                  {['Todos', 'disponible', 'asignado', 'mantenimiento', 'dañado'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      onPress={() => setFilterStatus(status as any)}
                      className={`px-3 py-1 rounded-full border ${filterStatus === status ? 'bg-sky-500 border-sky-500' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <Text className={`text-xs ${filterStatus === status ? 'text-white' : 'text-slate-900'}`}>{status === 'Todos' ? status : statusLabels[status as keyof typeof statusLabels]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Equipment List */}
          <FlatList
            data={filteredEquipment}
            renderItem={renderEquipmentItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View className="bg-white rounded-lg p-6 items-center justify-center">
                <Text className="text-slate-500">No hay equipos registrados</Text>
              </View>
            }
          />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => setShowAddForm(true)}
        className="absolute bottom-24 right-4 w-14 h-14 bg-sky-500 rounded-full shadow-lg items-center justify-center"
      >
        <MaterialCommunityIcons name="plus" size={24} color="white" />
      </TouchableOpacity>

      {/* Add Equipment Modal */}
      <Modal visible={showAddForm} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-2xl max-h-[90%]">
            <View className="p-4 border-b border-slate-200 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-slate-900">Agregar Equipo</Text>
              <TouchableOpacity onPress={() => setShowAddForm(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#475569" />
              </TouchableOpacity>
            </View>
            <ScrollView className="p-4">
              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-semibold text-slate-900 mb-2">Número de Serie</Text>
                  <TextInput
                    placeholder="LAP-009"
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg"
                    placeholderTextColor="#64748b"
                  />
                </View>
                <View>
                  <Text className="text-sm font-semibold text-slate-900 mb-2">Tipo</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {['Escritorio', 'Laptop', 'Servidor', 'Periféricos', 'Teléfonos'].map((type) => (
                      <TouchableOpacity
                        key={type}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        <Text className="text-sm text-slate-900">{type}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View>
                  <Text className="text-sm font-semibold text-slate-900 mb-2">Marca</Text>
                  <TextInput
                    placeholder="Dell, HP, Lenovo..."
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg"
                    placeholderTextColor="#64748b"
                  />
                </View>
                <View>
                  <Text className="text-sm font-semibold text-slate-900 mb-2">Modelo</Text>
                  <TextInput
                    placeholder="Latitude 5420"
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg"
                    placeholderTextColor="#64748b"
                  />
                </View>
                <TouchableOpacity className="bg-sky-500 py-3 rounded-lg items-center mt-6">
                  <Text className="text-white font-semibold">Agregar Equipo</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}