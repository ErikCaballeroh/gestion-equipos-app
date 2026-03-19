import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

type EquipmentType = 'Escritorio' | 'Laptop' | 'Servidor' | 'Periféricos' | 'Teléfonos';
type EquipmentStatus = 'disponible' | 'asignado' | 'mantenimiento' | 'dañado';

interface MaintenanceEquipment {
  id: string;
  serialNumber: string;
  type: EquipmentType;
  brand: string;
  model: string;
  status: EquipmentStatus;
  lastMaintenance?: string;
  needsMaintenance?: boolean;
}

const mockMaintenanceEquipment: MaintenanceEquipment[] = [
  {
    id: '3',
    serialNumber: 'SRV-003',
    type: 'Servidor',
    brand: 'Dell',
    model: 'PowerEdge R740',
    status: 'mantenimiento',
    lastMaintenance: '2026-01-15',
  },
  {
    id: '4',
    serialNumber: 'LAP-004',
    type: 'Laptop',
    brand: 'Lenovo',
    model: 'ThinkPad T14',
    status: 'dañado',
  },
  {
    id: '8',
    serialNumber: 'LAP-008',
    type: 'Laptop',
    brand: 'Apple',
    model: 'MacBook Pro 14',
    status: 'mantenimiento',
    lastMaintenance: '2026-02-10',
  },
  {
    id: '9',
    serialNumber: 'DSK-009',
    type: 'Escritorio',
    brand: 'HP',
    model: 'EliteDesk 800',
    status: 'asignado',
    lastMaintenance: '2025-08-15',
    needsMaintenance: true,
  },
];

const maintenanceTypes = ['Preventivo', 'Correctivo', 'Limpieza', 'Actualización'];

const statusColors: Record<EquipmentStatus, string> = {
  disponible: '#22c55e',
  asignado: '#0ea5e9',
  mantenimiento: '#f59e0b',
  dañado: '#ef4444',
};

const EquipmentCard = ({
  serialNumber,
  brand,
  model,
  type,
  status,
  onPress,
}: MaintenanceEquipment & { onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-slate-200"
  >
    <View className="flex-row items-center justify-between">
      <View className="flex-1">
        <Text className="text-lg font-semibold text-slate-900">{serialNumber}</Text>
        <Text className="text-sm text-slate-600">{brand} {model}</Text>
        <Text className="text-xs text-slate-500">{type}</Text>
      </View>
      <View className="items-end">
        <View className="px-2 py-1 rounded-full" style={{ backgroundColor: statusColors[status] + '20' }}>
          <Text className="text-xs font-medium" style={{ color: statusColors[status] }}>
            {status}
          </Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export default function AdminMantenimiento() {
  const router = useRouter();
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'maintenance' | 'available'>('maintenance');
  const [maintenanceType, setMaintenanceType] = useState(maintenanceTypes[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const equipmentInMaintenance = mockMaintenanceEquipment.filter((eq) => eq.status === 'mantenimiento');
  const damagedEquipment = mockMaintenanceEquipment.filter((eq) => eq.status === 'dañado');
  const needsMaintenanceEquipment = mockMaintenanceEquipment.filter((eq) => eq.needsMaintenance);

  const handleAction = () => {
    if (!selectedEquipment) return;

    if (actionType === 'maintenance') {
      Alert.alert('Mantenimiento', `Mantenimiento registrado para ${selectedEquipment}`);
    } else {
      Alert.alert('Disponible', `Equipo ${selectedEquipment} marcado como disponible`);
    }

    setShowActionModal(false);
    setSelectedEquipment(null);
    setMaintenanceType(maintenanceTypes[0]);
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
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
              <Text className="text-2xl font-bold text-slate-900">Mantenimiento</Text>
              <Text className="text-sm text-slate-600">Gestión de equipos</Text>
            </View>
          </View>

          {/* Alert Section - Equipment Needing Maintenance */}
          {needsMaintenanceEquipment.length > 0 && (
            <View className="mb-6">
              <View className="flex-row items-center gap-2 mb-3">
                <MaterialCommunityIcons name="alert-circle" size={20} color="#dc2626" />
                <Text className="text-lg font-semibold text-slate-900">Requieren Atención</Text>
              </View>
              <View className="space-y-3">
                {needsMaintenanceEquipment.map((eq) => (
                  <View key={eq.id} className="relative">
                    <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                    <EquipmentCard
                      {...eq}
                      onPress={() => {
                        setSelectedEquipment(eq.serialNumber);
                        setActionType('maintenance');
                        setShowActionModal(true);
                      }}
                    />
                    {eq.lastMaintenance ? (
                      <Text className="text-xs text-red-600 mt-1 ml-1">
                        Sin mantenimiento desde {eq.lastMaintenance}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* In Maintenance Section */}
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-3">
              <MaterialCommunityIcons name="wrench" size={20} color="#f59e0b" />
              <Text className="text-lg font-semibold text-slate-900">En Mantenimiento</Text>
              <Text className="text-sm text-slate-500">({equipmentInMaintenance.length})</Text>
            </View>
            <View className="space-y-3">
              {equipmentInMaintenance.length > 0 ? (
                equipmentInMaintenance.map((eq) => (
                  <EquipmentCard
                    key={eq.id}
                    {...eq}
                    onPress={() => {
                      setSelectedEquipment(eq.serialNumber);
                      setActionType('available');
                      setShowActionModal(true);
                    }}
                  />
                ))
              ) : (
                <Text className="text-sm text-slate-500 text-center py-4">
                  No hay equipos en mantenimiento
                </Text>
              )}
            </View>
          </View>

          {/* Damaged Section */}
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-3">
              <MaterialCommunityIcons name="alert-circle" size={20} color="#dc2626" />
              <Text className="text-lg font-semibold text-slate-900">Equipos Dañados</Text>
              <Text className="text-sm text-slate-500">({damagedEquipment.length})</Text>
            </View>
            <View className="space-y-3">
              {damagedEquipment.length > 0 ? (
                damagedEquipment.map((eq) => (
                  <EquipmentCard
                    key={eq.id}
                    {...eq}
                    onPress={() => {
                      setSelectedEquipment(eq.serialNumber);
                      setActionType('maintenance');
                      setShowActionModal(true);
                    }}
                  />
                ))
              ) : (
                <Text className="text-sm text-slate-500 text-center py-4">
                  No hay equipos dañados
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Modal */}
      <Modal visible={showActionModal} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-2xl max-h-[90%]">
            <View className="p-4 border-b border-slate-200 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-slate-900">
                {actionType === 'maintenance' ? 'Registrar Mantenimiento' : 'Marcar como Disponible'}
              </Text>
              <TouchableOpacity onPress={() => setShowActionModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#475569" />
              </TouchableOpacity>
            </View>
            <ScrollView className="p-4">
              <View className="space-y-4">
                <View className="bg-slate-50 rounded-lg p-3">
                  <Text className="text-xs text-slate-600 mb-1">Equipo seleccionado</Text>
                  <Text className="text-slate-900">{selectedEquipment}</Text>
                </View>

                {actionType === 'maintenance' ? (
                  <>
                    <View>
                      <Text className="text-sm font-semibold text-slate-900 mb-2">Tipo de Mantenimiento</Text>
                      <View className="flex-row flex-wrap gap-2">
                        {maintenanceTypes.map((type) => (
                          <TouchableOpacity
                            key={type}
                            onPress={() => setMaintenanceType(type)}
                            className={`px-3 py-2 rounded-lg border ${maintenanceType === type ? 'bg-sky-500 border-sky-500' : 'bg-slate-50 border-slate-200'}`}
                          >
                            <Text className={`text-sm ${maintenanceType === type ? 'text-white' : 'text-slate-900'}`}>
                              {type}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View>
                      <Text className="text-sm font-semibold text-slate-900 mb-2">Descripción</Text>
                      <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Describe el trabajo realizado..."
                        multiline
                        numberOfLines={3}
                        className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg"
                        placeholderTextColor="#64748b"
                      />
                    </View>

                    <View>
                      <Text className="text-sm font-semibold text-slate-900 mb-2">Fecha</Text>
                      <TextInput
                        value={date}
                        onChangeText={setDate}
                        placeholder="YYYY-MM-DD"
                        className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg"
                        placeholderTextColor="#64748b"
                      />
                    </View>
                  </>
                ) : (
                  <View className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <View className="flex-row items-start gap-3">
                      <MaterialCommunityIcons name="check-circle" size={20} color="#16a34a" />
                      <View>
                        <Text className="text-sm text-green-900 mb-1">
                          El equipo será marcado como disponible
                        </Text>
                        <Text className="text-xs text-green-700">
                          Podrá ser asignado a un empleado
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                <View className="flex-row gap-2 pt-4">
                  <TouchableOpacity
                    onPress={() => setShowActionModal(false)}
                    className="flex-1 py-3 bg-slate-200 rounded-lg items-center"
                  >
                    <Text className="text-slate-700 font-semibold">Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleAction}
                    className="flex-1 py-3 bg-sky-500 rounded-lg items-center"
                  >
                    <Text className="text-white font-semibold">Confirmar</Text>
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
