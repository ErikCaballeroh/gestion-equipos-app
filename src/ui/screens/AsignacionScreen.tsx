import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAppStore } from '@/src/state/appStore';

type ScreenProps = {
  titlePrefix?: string;
  onBack?: () => void;
};

const areas = ['Ventas', 'Marketing', 'Desarrollo', 'Soporte', 'Recursos Humanos', 'Finanzas'];

export function AsignacionScreen({ titlePrefix = '', onBack }: ScreenProps) {
  const { state, assignEquipment } = useAppStore();
  const [search, setSearch] = useState('');

  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [showAssignForm, setShowAssignForm] = useState(false);

  const availableEquipments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.equipments
      .filter((e) => e.status === 'disponible')
      .filter((e) => (!q ? true : e.serialNumber.toLowerCase().includes(q) || e.brand.toLowerCase().includes(q)));
  }, [state.equipments, search]);

  const accounts = useMemo(() => {
    // Both admin and tecnico can assign to any account in this frontend demo.
    return state.accounts;
  }, [state.accounts]);

  const selectedEq = useMemo(
    () => state.equipments.find((e) => e.id === selectedEquipmentId) ?? null,
    [state.equipments, selectedEquipmentId],
  );
  const selectedAcc = useMemo(
    () => state.accounts.find((a) => a.id === selectedAccountId) ?? null,
    [state.accounts, selectedAccountId],
  );

  const handleAssign = async () => {
    if (!selectedEq || !selectedAcc || !selectedArea) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    try {
      await assignEquipment({
        equipmentId: selectedEq.id,
        userId: selectedAcc.id,
        userName: selectedAcc.name,
        area: selectedArea,
      });
      Alert.alert('Asignación Exitosa', `Equipo ${selectedEq.serialNumber} asignado a ${selectedAcc.name} (${selectedArea})`);
      setShowAssignForm(false);
      setSelectedEquipmentId(null);
      setSelectedAccountId(null);
      setSelectedArea('');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo asignar el equipo');
    }
  };

  return (
    <View className="flex-1 bg-slate-50 pt-6">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="p-4">
          <View className="flex-row items-center gap-3 mb-6">
            {onBack ? (
              <TouchableOpacity onPress={onBack} className="p-2 rounded-lg bg-white shadow-sm">
                <MaterialCommunityIcons name="arrow-left" size={20} color="#475569" />
              </TouchableOpacity>
            ) : null}
            <View className="flex-1">
              <Text className="text-2xl font-bold text-slate-900">{titlePrefix}Asignación</Text>
              <Text className="text-sm text-slate-600">{availableEquipments.length} equipos disponibles</Text>
            </View>
          </View>

          <View className="relative mb-4">
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color="#64748b"
              style={{ position: 'absolute', left: 12, top: 12 }}
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar equipo disponible..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg"
              placeholderTextColor="#64748b"
            />
          </View>

          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <View className="flex-row items-start gap-3">
              <MaterialCommunityIcons name="account-check" size={20} color="#2563eb" />
              <View className="flex-1">
                <Text className="text-sm text-blue-900 mb-1">
                  Selecciona un equipo disponible y asígnalo a un usuario
                </Text>
                <Text className="text-xs text-blue-700">Los equipos dañados o en mantenimiento no aparecen aquí</Text>
              </View>
            </View>
          </View>

          <FlatList
            data={availableEquipments}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedEquipmentId(item.id);
                  setShowAssignForm(true);
                }}
                className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-slate-200"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-slate-900">{item.serialNumber}</Text>
                    <Text className="text-sm text-slate-600">
                      {item.brand} {item.model}
                    </Text>
                    <Text className="text-xs text-slate-500">{item.type}</Text>
                  </View>
                  <View className="items-end">
                    <View className="px-2 py-1 rounded-full bg-green-100">
                      <Text className="text-xs font-medium text-green-600">Disponible</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View className="text-center py-12">
                <Text className="text-slate-500">No hay equipos disponibles</Text>
              </View>
            }
          />
        </View>
      </ScrollView>

      <Modal visible={showAssignForm} animationType="slide" transparent onRequestClose={() => setShowAssignForm(false)}>
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
                  <Text className="text-slate-900">
                    {selectedEq ? `${selectedEq.serialNumber} · ${selectedEq.brand} ${selectedEq.model}` : '-'}
                  </Text>
                </View>

                <View>
                  <Text className="text-sm font-semibold text-slate-900 mb-2">Usuario</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {accounts.map((acc) => (
                      <TouchableOpacity
                        key={acc.id}
                        onPress={() => setSelectedAccountId(acc.id)}
                        className={`px-3 py-2 rounded-lg border ${selectedAccountId === acc.id ? 'bg-sky-500 border-sky-500' : 'bg-slate-50 border-slate-200'}`}
                      >
                        <Text className={`text-sm ${selectedAccountId === acc.id ? 'text-white' : 'text-slate-900'}`}>
                          {acc.name} ({acc.role})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
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
                    onPress={() => void handleAssign()}
                    className="flex-1 py-3 bg-sky-500 rounded-lg items-center"
                  >
                    <Text className="text-white font-semibold">Asignar</Text>
                  </TouchableOpacity>
                </View>

                {selectedAcc ? (
                  <Text className="text-xs text-slate-500">
                    Se asignará a: {selectedAcc.name} ({selectedAcc.email})
                  </Text>
                ) : null}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
