import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface AvailableEquipment {
  id: string;
  serialNumber: string;
  type: 'Escritorio' | 'Laptop' | 'Servidor' | 'Periféricos' | 'Teléfonos';
  brand: string;
  model: string;
}

const mockAvailableEquipment: AvailableEquipment[] = [
  { id: '2', serialNumber: 'DSK-002', type: 'Escritorio', brand: 'HP', model: 'EliteDesk 800' },
  { id: '5', serialNumber: 'DSK-005', type: 'Escritorio', brand: 'Dell', model: 'OptiPlex 7090' },
  { id: '7', serialNumber: 'PRT-007', type: 'Periféricos', brand: 'Canon', model: 'ImageRUNNER' },
];

const areas = ['Ventas', 'Marketing', 'Desarrollo', 'Soporte', 'Recursos Humanos', 'Finanzas'];

const EquipmentCard = ({ serialNumber, brand, model, type, onClick }: AvailableEquipment & { onClick: () => void }) => (
  <TouchableOpacity
    onPress={onClick}
    className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-slate-200"
  >
    <View className="flex-row items-center justify-between">
      <View className="flex-1">
        <Text className="text-lg font-semibold text-slate-900">{serialNumber}</Text>
        <Text className="text-sm text-slate-600">{brand} {model}</Text>
        <Text className="text-xs text-slate-500">{type}</Text>
      </View>
      <View className="items-end">
        <View className="px-2 py-1 rounded-full bg-green-100">
          <Text className="text-xs font-medium text-green-600">Disponible</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export default function AdminAsignacion() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [employeeName, setEmployeeName] = useState('');
  const [selectedArea, setSelectedArea] = useState('');

  const filteredEquipment = mockAvailableEquipment.filter((eq) =>
    eq.serialNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = () => {
    if (selectedEquipment && employeeName.trim() && selectedArea) {
      Alert.alert('Asignación Exitosa', `Equipo ${selectedEquipment} asignado a ${employeeName} (${selectedArea})`);
      setShowAssignForm(false);
      setSelectedEquipment(null);
      setEmployeeName('');
      setSelectedArea('');
    } else {
      Alert.alert('Error', 'Por favor completa todos los campos');
    }
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
              <Text className="text-2xl font-bold text-slate-900">Asignación</Text>
              <Text className="text-sm text-slate-600">{filteredEquipment.length} equipos disponibles</Text>
            </View>
          </View>

          {/* Search */}
          <View className="relative mb-4">
            <MaterialCommunityIcons name="magnify" size={20} color="#64748b" style={{ position: 'absolute', left: 12, top: 12 }} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar equipo disponible..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg"
              placeholderTextColor="#64748b"
            />
          </View>

          {/* Info Card */}
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <View className="flex-row items-start gap-3">
              <MaterialCommunityIcons name="account-check" size={20} color="#2563eb" />
              <View>
                <Text className="text-sm text-blue-900 mb-1">
                  Selecciona un equipo disponible para asignarlo a un empleado
                </Text>
                <Text className="text-xs text-blue-700">
                  Los equipos en mantenimiento o dañados no están disponibles
                </Text>
              </View>
            </View>
          </View>

          {/* Available Equipment List */}
          <FlatList
            data={filteredEquipment}
            renderItem={({ item }) => (
              <EquipmentCard
                {...item}
                onClick={() => {
                  setSelectedEquipment(item.serialNumber);
                  setShowAssignForm(true);
                }}
              />
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View className="text-center py-12">
                <Text className="text-slate-500">No hay equipos disponibles</Text>
              </View>
            }
          />
        </View>
      </ScrollView>

      {/* Assignment Form Modal */}
      <Modal visible={showAssignForm} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-2xl max-h-[90%]">
            <View className="p-4 border-b border-slate-200 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-slate-900">Asignar Equipo</Text>
              <TouchableOpacity onPress={() => setShowAssignForm(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#475569" />
              </TouchableOpacity>
            </View>
            <ScrollView className="p-4">
              <View className="space-y-4">
                <View className="bg-slate-50 rounded-lg p-3">
                  <Text className="text-xs text-slate-600 mb-1">Equipo seleccionado</Text>
                  <Text className="text-slate-900">{selectedEquipment}</Text>
                </View>

                <View>
                  <Text className="text-sm font-semibold text-slate-900 mb-2">Nombre del Empleado</Text>
                  <TextInput
                    value={employeeName}
                    onChangeText={setEmployeeName}
                    placeholder="Juan Pérez"
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg"
                    placeholderTextColor="#64748b"
                  />
                </View>

                <View>
                  <Text className="text-sm font-semibold text-slate-900 mb-2">Área</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {areas.map((area) => (
                      <TouchableOpacity
                        key={area}
                        onPress={() => setSelectedArea(area)}
                        className={`px-3 py-2 rounded-lg border ${selectedArea === area ? 'bg-sky-500 border-sky-500' : 'bg-slate-50 border-slate-200'}`}
                      >
                        <Text className={`text-sm ${selectedArea === area ? 'text-white' : 'text-slate-900'}`}>{area}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View className="flex-row gap-2 pt-4">
                  <TouchableOpacity
                    onPress={() => setShowAssignForm(false)}
                    className="flex-1 py-3 bg-slate-200 rounded-lg items-center"
                  >
                    <Text className="text-slate-700 font-semibold">Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleAssign}
                    className="flex-1 py-3 bg-sky-500 rounded-lg items-center"
                  >
                    <Text className="text-white font-semibold">Asignar</Text>
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
