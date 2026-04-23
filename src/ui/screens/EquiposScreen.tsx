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

import type { EquipmentStatus, EquipmentType } from '@/src/state/appStore';
import { useAppStore } from '@/src/state/appStore';

type ScreenProps = {
  titlePrefix?: string;
  onBack?: () => void;
};

const statusColors: Record<EquipmentStatus, string> = {
  disponible: '#22c55e',
  asignado: '#0ea5e9',
  mantenimiento: '#f59e0b',
  dañado: '#ef4444',
};

const statusLabels: Record<EquipmentStatus, string> = {
  disponible: 'Disponible',
  asignado: 'Asignado',
  mantenimiento: 'Mantenimiento',
  dañado: 'Dañado',
};

const typeOptions: (EquipmentType | 'Todos')[] = [
  'Todos',
  'Escritorio',
  'Laptop',
  'Servidor',
  'Periféricos',
  'Teléfonos',
];

const statusOptions: (EquipmentStatus | 'Todos')[] = [
  'Todos',
  'disponible',
  'asignado',
  'mantenimiento',
  'dañado',
];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function EquiposScreen({ titlePrefix = '', onBack }: ScreenProps) {
  const { state, addEquipment, unassignEquipment, setEquipmentStatus, reportDamage } = useAppStore();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<(typeof typeOptions)[number]>('Todos');
  const [filterStatus, setFilterStatus] = useState<(typeof statusOptions)[number]>('Todos');
  const [showFilters, setShowFilters] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    serialNumber: '',
    type: 'Laptop' as EquipmentType,
    brand: '',
    model: '',
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(
    () => state.equipments.find((e) => e.id === selectedId) ?? null,
    [selectedId, state.equipments],
  );

  const [showDamageModal, setShowDamageModal] = useState(false);
  const [damageDescription, setDamageDescription] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.equipments.filter((eq) => {
      const matchesSearch =
        !q ||
        eq.serialNumber.toLowerCase().includes(q) ||
        eq.brand.toLowerCase().includes(q) ||
        eq.model.toLowerCase().includes(q);
      const matchesType = filterType === 'Todos' || eq.type === filterType;
      const matchesStatus = filterStatus === 'Todos' || eq.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [state.equipments, search, filterType, filterStatus]);

  const handleAdd = async () => {
    if (!addForm.serialNumber.trim()) {
      Alert.alert('Error', 'Número de serie requerido');
      return;
    }
    if (!addForm.brand.trim() || !addForm.model.trim()) {
      Alert.alert('Error', 'Marca y modelo son requeridos');
      return;
    }

    try {
      await addEquipment({
        serialNumber: addForm.serialNumber,
        type: addForm.type,
        brand: addForm.brand,
        model: addForm.model,
        createdAt: todayISO(),
      });

      setShowAddForm(false);
      setAddForm({ serialNumber: '', type: 'Laptop', brand: '', model: '' });
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo agregar el equipo');
    }
  };

  const openDetail = (id: string) => {
    setSelectedId(id);
  };

  const renderEquipmentItem = ({ item }: { item: (typeof state.equipments)[number] }) => (
    <TouchableOpacity
      onPress={() => openDetail(item.id)}
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-slate-200"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-slate-900">{item.serialNumber}</Text>
          <Text className="text-sm text-slate-600">
            {item.brand} {item.model}
          </Text>
          <Text className="text-xs text-slate-500">{item.type}</Text>
          {item.assignedTo ? (
            <Text className="text-xs text-slate-500">
              Asignado a: {item.assignedTo.name} ({item.assignedTo.area})
            </Text>
          ) : null}
        </View>
        <View className="items-end">
          <View className="px-2 py-1 rounded-full" style={{ backgroundColor: statusColors[item.status] + '20' }}>
            <Text className="text-xs font-medium" style={{ color: statusColors[item.status] }}>
              {statusLabels[item.status]}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

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
              <Text className="text-2xl font-bold text-slate-900">{titlePrefix}Equipos</Text>
              <Text className="text-sm text-slate-600">{filtered.length} equipos</Text>
            </View>
          </View>

          <View className="relative mb-3">
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color="#64748b"
              style={{ position: 'absolute', left: 12, top: 12 }}
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar equipo..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg"
              placeholderTextColor="#64748b"
            />
          </View>

          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            className="flex-row items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg mb-4"
          >
            <MaterialCommunityIcons name="filter-variant" size={16} color="#475569" />
            <Text className="text-sm text-slate-900">Filtros</Text>
          </TouchableOpacity>

          {showFilters ? (
            <View className="bg-white rounded-lg border border-slate-200 p-4 mb-4 space-y-3">
              <View>
                <Text className="text-sm font-semibold text-slate-900 mb-2">Tipo</Text>
                <View className="flex-row flex-wrap gap-2">
                  {typeOptions.map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setFilterType(t)}
                      className={`px-3 py-1 rounded-full border ${filterType === t ? 'bg-sky-500 border-sky-500' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <Text className={`text-xs ${filterType === t ? 'text-white' : 'text-slate-900'}`}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View>
                <Text className="text-sm font-semibold text-slate-900 mb-2">Estado</Text>
                <View className="flex-row flex-wrap gap-2">
                  {statusOptions.map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setFilterStatus(s)}
                      className={`px-3 py-1 rounded-full border ${filterStatus === s ? 'bg-sky-500 border-sky-500' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <Text className={`text-xs ${filterStatus === s ? 'text-white' : 'text-slate-900'}`}>
                        {s === 'Todos' ? s : statusLabels[s]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          ) : null}

          <FlatList
            data={filtered}
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

      <TouchableOpacity
        onPress={() => setShowAddForm(true)}
        className="absolute bottom-24 right-4 w-14 h-14 bg-sky-500 rounded-full shadow-lg items-center justify-center"
      >
        <MaterialCommunityIcons name="plus" size={24} color="white" />
      </TouchableOpacity>

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
                    value={addForm.serialNumber}
                    onChangeText={(v) => setAddForm((p) => ({ ...p, serialNumber: v }))}
                    placeholder="LAP-009"
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg"
                    placeholderTextColor="#64748b"
                  />
                </View>
                <View>
                  <Text className="text-sm font-semibold text-slate-900 mb-2">Tipo</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {typeOptions
                      .filter((t): t is EquipmentType => t !== 'Todos')
                      .map((t) => (
                        <TouchableOpacity
                          key={t}
                          onPress={() => setAddForm((p) => ({ ...p, type: t }))}
                          className={`px-3 py-2 rounded-lg border ${addForm.type === t ? 'bg-sky-500 border-sky-500' : 'bg-slate-50 border-slate-200'}`}
                        >
                          <Text className={`text-sm ${addForm.type === t ? 'text-white' : 'text-slate-900'}`}>{t}</Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
                <View>
                  <Text className="text-sm font-semibold text-slate-900 mb-2">Marca</Text>
                  <TextInput
                    value={addForm.brand}
                    onChangeText={(v) => setAddForm((p) => ({ ...p, brand: v }))}
                    placeholder="Dell, HP, Lenovo..."
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg"
                    placeholderTextColor="#64748b"
                  />
                </View>
                <View>
                  <Text className="text-sm font-semibold text-slate-900 mb-2">Modelo</Text>
                  <TextInput
                    value={addForm.model}
                    onChangeText={(v) => setAddForm((p) => ({ ...p, model: v }))}
                    placeholder="Latitude 5420"
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg"
                    placeholderTextColor="#64748b"
                  />
                </View>

                <TouchableOpacity onPress={() => void handleAdd()} className="bg-sky-500 py-3 rounded-lg items-center mt-2">
                  <Text className="text-white font-semibold">Agregar Equipo</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelectedId(null)}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-2xl max-h-[90%]">
            <View className="p-4 border-b border-slate-200 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-slate-900">Acciones del Equipo</Text>
              <TouchableOpacity onPress={() => setSelectedId(null)}>
                <MaterialCommunityIcons name="close" size={24} color="#475569" />
              </TouchableOpacity>
            </View>
            {selected ? (
              <ScrollView className="p-4">
                <View className="space-y-4">
                  <View className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <Text className="text-xs text-slate-600 mb-1">Equipo</Text>
                    <Text className="text-slate-900 font-semibold">
                      {selected.serialNumber} · {selected.type}
                    </Text>
                    <Text className="text-slate-700">
                      {selected.brand} {selected.model}
                    </Text>
                    <View className="flex-row flex-wrap gap-2 mt-2">
                      <View className="px-2 py-1 rounded-full" style={{ backgroundColor: statusColors[selected.status] + '20' }}>
                        <Text className="text-xs" style={{ color: statusColors[selected.status] }}>
                          {statusLabels[selected.status]}
                        </Text>
                      </View>
                      {selected.lastMaintenance ? (
                        <View className="px-2 py-1 rounded-full bg-slate-100">
                          <Text className="text-xs text-slate-700">Último: {selected.lastMaintenance}</Text>
                        </View>
                      ) : null}
                    </View>
                    {selected.assignedTo ? (
                      <Text className="text-xs text-slate-600 mt-2">
                        Asignado a: {selected.assignedTo.name} ({selected.assignedTo.area})
                      </Text>
                    ) : null}
                  </View>

                  <View className="bg-white rounded-lg border border-slate-200 p-3">
                    <Text className="text-sm font-semibold text-slate-900 mb-2">Herramientas rápidas</Text>
                    <View className="flex-row flex-wrap gap-2">
                      <TouchableOpacity
                        onPress={async () => {
                          try {
                            await setEquipmentStatus({ equipmentId: selected.id, status: 'mantenimiento' });
                            Alert.alert('Listo', 'Equipo marcado como en mantenimiento');
                            setSelectedId(null);
                          } catch (error) {
                            Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo actualizar el equipo');
                          }
                        }}
                        className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200"
                      >
                        <View className="flex-row items-center gap-2">
                          <MaterialCommunityIcons name="wrench" size={16} color="#f59e0b" />
                          <Text className="text-sm text-amber-900">En mantenimiento</Text>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setDamageDescription('');
                          setShowDamageModal(true);
                        }}
                        className="px-3 py-2 rounded-lg bg-red-50 border border-red-200"
                      >
                        <View className="flex-row items-center gap-2">
                          <MaterialCommunityIcons name="alert-circle" size={16} color="#ef4444" />
                          <Text className="text-sm text-red-900">Marcar dañado</Text>
                        </View>
                      </TouchableOpacity>

                      {selected.status === 'asignado' ? (
                        <TouchableOpacity
                          onPress={async () => {
                            try {
                              await unassignEquipment(selected.id);
                              Alert.alert('Listo', 'Equipo desasignado y marcado disponible');
                              setSelectedId(null);
                            } catch (error) {
                              Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo desasignar el equipo');
                            }
                          }}
                          className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200"
                        >
                          <View className="flex-row items-center gap-2">
                            <MaterialCommunityIcons name="account-off" size={16} color="#475569" />
                            <Text className="text-sm text-slate-900">Desasignar</Text>
                          </View>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                    <Text className="text-xs text-slate-500 mt-2">
                      Nota: asignación y registro de mantenimiento con descripción se hacen en pantallas dedicadas.
                    </Text>
                  </View>
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal visible={showDamageModal} animationType="slide" transparent onRequestClose={() => setShowDamageModal(false)}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-2xl max-h-[90%]">
            <View className="p-4 border-b border-slate-200 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-slate-900">Marcar como Dañado</Text>
              <TouchableOpacity onPress={() => setShowDamageModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#475569" />
              </TouchableOpacity>
            </View>
            <ScrollView className="p-4">
              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-semibold text-slate-900 mb-2">Descripción del daño (obligatoria)</Text>
                  <TextInput
                    value={damageDescription}
                    onChangeText={setDamageDescription}
                    placeholder="Ej: Pantalla rota, no enciende, etc..."
                    multiline
                    numberOfLines={4}
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg"
                    placeholderTextColor="#64748b"
                  />
                </View>
                <TouchableOpacity
                  onPress={async () => {
                    if (!selected) return;
                    if (!damageDescription.trim()) {
                      Alert.alert('Error', 'La descripción es obligatoria');
                      return;
                    }
                    try {
                      await reportDamage({ equipmentId: selected.id, date: todayISO(), description: damageDescription });
                      setShowDamageModal(false);
                      setSelectedId(null);
                      Alert.alert('Listo', 'Se registró el incidente y se agregó al historial');
                    } catch (error) {
                      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo registrar el incidente');
                    }
                  }}
                  className="bg-red-600 py-3 rounded-lg items-center"
                >
                  <Text className="text-white font-semibold">Confirmar daño</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
