import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  isPreventiveDue,
  MAINTENANCE_TYPES,
  useAppStore,
  type MaintenanceType,
} from '@/src/state/appStore';

type ScreenProps = {
  titlePrefix?: string;
  onBack?: () => void;
  technicianName?: string;
};

type ActionMode = 'register_maintenance' | 'mark_available' | 'report_incident';

type StatusColor = 'disponible' | 'asignado' | 'mantenimiento' | 'dañado';
const statusColors: Record<StatusColor, string> = {
  disponible: '#22c55e',
  asignado: '#0ea5e9',
  mantenimiento: '#f59e0b',
  dañado: '#ef4444',
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function MantenimientoScreen({ titlePrefix = '', onBack, technicianName }: ScreenProps) {
  const { state, registerMaintenance, reportDamage, setEquipmentStatus } = useAppStore();

  const now = todayISO();

  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const selected = useMemo(
    () => state.equipments.find((e) => e.id === selectedEquipmentId) ?? null,
    [selectedEquipmentId, state.equipments],
  );

  const [showActionModal, setShowActionModal] = useState(false);
  const [mode, setMode] = useState<ActionMode>('register_maintenance');
  const [maintenanceType, setMaintenanceType] = useState<MaintenanceType>(MAINTENANCE_TYPES[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(now);
  const [closeAfterRegister, setCloseAfterRegister] = useState(true);

  const preventiveDue = useMemo(() => {
    return state.equipments.filter((e) => isPreventiveDue(e.lastMaintenance ?? null, now));
  }, [state.equipments, now]);

  const equipmentInMaintenance = useMemo(
    () => state.equipments.filter((e) => e.status === 'mantenimiento'),
    [state.equipments],
  );
  const damagedEquipment = useMemo(
    () => state.equipments.filter((e) => e.status === 'dañado'),
    [state.equipments],
  );

  const openAction = (equipmentId: string, nextMode: ActionMode) => {
    setSelectedEquipmentId(equipmentId);
    setMode(nextMode);
    setMaintenanceType(MAINTENANCE_TYPES[0]);
    setDescription('');
    setDate(now);
    setCloseAfterRegister(true);
    setShowActionModal(true);
  };

  const requireDescription = (text: string) => {
    if (!text.trim()) {
      Alert.alert('Falta información', 'La descripción es obligatoria para guardar en historial');
      return false;
    }
    return true;
  };

  const handleConfirm = async () => {
    if (!selected) return;

    try {
      if (mode === 'register_maintenance') {
        if (!requireDescription(description)) return;
        await registerMaintenance({
          equipmentId: selected.id,
          date,
          maintenanceType,
          description,
          technician: technicianName,
          close: closeAfterRegister,
        });
        Alert.alert(
          'Guardado',
          closeAfterRegister
            ? 'Mantenimiento guardado y registrado en historial. Equipo marcado disponible.'
            : 'Mantenimiento guardado y registrado en historial. Equipo permanece en mantenimiento.',
        );
      }

      if (mode === 'mark_available') {
        if (!requireDescription(description)) return;
        await registerMaintenance({
          equipmentId: selected.id,
          date,
          maintenanceType: 'Correctivo',
          description,
          technician: technicianName,
          close: true,
        });
        Alert.alert('Listo', 'Se marcó como disponible y se guardó en historial.');
      }

      if (mode === 'report_incident') {
        if (!requireDescription(description)) return;
        await reportDamage({ equipmentId: selected.id, date, description, technician: technicianName });
        Alert.alert('Listo', 'Incidente guardado en historial y equipo marcado como dañado.');
      }

      setShowActionModal(false);
      setSelectedEquipmentId(null);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo guardar el registro');
    }
  };

  const EquipmentCard = ({ equipmentId }: { equipmentId: string }) => {
    const eq = state.equipments.find((e) => e.id === equipmentId);
    if (!eq) return null;
    const color = statusColors[eq.status];

    const badge = (
      <View className="px-2 py-1 rounded-full" style={{ backgroundColor: color + '20' }}>
        <Text className="text-xs font-medium" style={{ color }}>
          {eq.status}
        </Text>
      </View>
    );

    return (
      <View className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-slate-900">{eq.serialNumber}</Text>
            <Text className="text-sm text-slate-600">
              {eq.brand} {eq.model}
            </Text>
            <Text className="text-xs text-slate-500">{eq.type}</Text>
            {eq.lastMaintenance ? (
              <Text className="text-xs text-slate-500 mt-1">Último mantenimiento: {eq.lastMaintenance}</Text>
            ) : (
              <Text className="text-xs text-slate-500 mt-1">Sin historial de mantenimiento</Text>
            )}
          </View>
          <View className="items-end gap-2">{badge}</View>
        </View>

        <View className="flex-row flex-wrap gap-2 mt-3">
          <TouchableOpacity
            onPress={async () => {
              try {
                await setEquipmentStatus({ equipmentId: eq.id, status: 'mantenimiento' });
                openAction(eq.id, 'register_maintenance');
              } catch (error) {
                Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo actualizar el estado');
              }
            }}
            className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200"
          >
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="wrench" size={16} color="#f59e0b" />
              <Text className="text-sm text-amber-900">Registrar mantenimiento</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openAction(eq.id, 'report_incident')}
            className="px-3 py-2 rounded-lg bg-red-50 border border-red-200"
          >
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="alert-circle" size={16} color="#ef4444" />
              <Text className="text-sm text-red-900">Reportar incidente</Text>
            </View>
          </TouchableOpacity>

          {eq.status === 'mantenimiento' ? (
            <TouchableOpacity
              onPress={() => openAction(eq.id, 'mark_available')}
              className="px-3 py-2 rounded-lg bg-green-50 border border-green-200"
            >
              <View className="flex-row items-center gap-2">
                <MaterialCommunityIcons name="check-circle" size={16} color="#16a34a" />
                <Text className="text-sm text-green-900">Marcar disponible</Text>
              </View>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
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
              <Text className="text-2xl font-bold text-slate-900">{titlePrefix}Mantenimiento</Text>
              <Text className="text-sm text-slate-600">Registro y seguimiento</Text>
            </View>
          </View>

          {preventiveDue.length > 0 ? (
            <View className="mb-6">
              <View className="flex-row items-center gap-2 mb-3">
                <MaterialCommunityIcons name="alert-circle" size={20} color="#dc2626" />
                <Text className="text-lg font-semibold text-slate-900">Preventivo vencido (6+ meses)</Text>
                <Text className="text-sm text-slate-500">({preventiveDue.length})</Text>
              </View>
              <View className="space-y-3">
                {preventiveDue.slice(0, 6).map((eq) => (
                  <View key={eq.id} className="relative">
                    <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                    <EquipmentCard equipmentId={eq.id} />
                  </View>
                ))}
                {preventiveDue.length > 6 ? (
                  <Text className="text-xs text-slate-500">Mostrando 6 de {preventiveDue.length}...</Text>
                ) : null}
              </View>
            </View>
          ) : null}

          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-3">
              <MaterialCommunityIcons name="wrench" size={20} color="#f59e0b" />
              <Text className="text-lg font-semibold text-slate-900">En mantenimiento</Text>
              <Text className="text-sm text-slate-500">({equipmentInMaintenance.length})</Text>
            </View>
            <View className="space-y-3">
              {equipmentInMaintenance.length > 0 ? (
                equipmentInMaintenance.map((eq) => (
                  <View key={eq.id}>
                    <EquipmentCard equipmentId={eq.id} />
                  </View>
                ))
              ) : (
                <Text className="text-sm text-slate-500 text-center py-4">No hay equipos en mantenimiento</Text>
              )}
            </View>
          </View>

          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-3">
              <MaterialCommunityIcons name="alert-circle" size={20} color="#dc2626" />
              <Text className="text-lg font-semibold text-slate-900">Equipos dañados</Text>
              <Text className="text-sm text-slate-500">({damagedEquipment.length})</Text>
            </View>
            <View className="space-y-3">
              {damagedEquipment.length > 0 ? (
                damagedEquipment.map((eq) => (
                  <View key={eq.id}>
                    <EquipmentCard equipmentId={eq.id} />
                  </View>
                ))
              ) : (
                <Text className="text-sm text-slate-500 text-center py-4">No hay equipos dañados</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showActionModal} animationType="slide" transparent onRequestClose={() => setShowActionModal(false)}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-2xl max-h-[90%]">
            <View className="p-4 border-b border-slate-200 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-slate-900">
                {mode === 'register_maintenance'
                  ? 'Registrar Mantenimiento'
                  : mode === 'mark_available'
                    ? 'Marcar como Disponible'
                    : 'Reportar Incidente'}
              </Text>
              <TouchableOpacity onPress={() => setShowActionModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#475569" />
              </TouchableOpacity>
            </View>

            <ScrollView className="p-4">
              <View className="space-y-4">
                <View className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <Text className="text-xs text-slate-600 mb-1">Equipo seleccionado</Text>
                  <Text className="text-slate-900">
                    {selected ? `${selected.serialNumber} · ${selected.brand} ${selected.model}` : '-'}
                  </Text>
                </View>

                {mode === 'register_maintenance' ? (
                  <View>
                    <Text className="text-sm font-semibold text-slate-900 mb-2">Tipo de Mantenimiento</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {MAINTENANCE_TYPES.map((t) => (
                        <TouchableOpacity
                          key={t}
                          onPress={() => setMaintenanceType(t)}
                          className={`px-3 py-2 rounded-lg border ${maintenanceType === t ? 'bg-sky-500 border-sky-500' : 'bg-slate-50 border-slate-200'}`}
                        >
                          <Text className={`text-sm ${maintenanceType === t ? 'text-white' : 'text-slate-900'}`}>{t}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ) : null}

                <View>
                  <Text className="text-sm font-semibold text-slate-900 mb-2">Descripción (obligatoria)</Text>
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder={
                      mode === 'report_incident'
                        ? 'Describe el problema reportado...'
                        : 'Describe el trabajo realizado...'
                    }
                    multiline
                    numberOfLines={4}
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg"
                    placeholderTextColor="#64748b"
                  />
                  <Text className="text-xs text-slate-500 mt-2">Sin descripción no se puede guardar en historial.</Text>
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

                {mode === 'register_maintenance' ? (
                  <TouchableOpacity
                    onPress={() => setCloseAfterRegister((v) => !v)}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-3"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <MaterialCommunityIcons
                          name={closeAfterRegister ? 'checkbox-marked' : 'checkbox-blank-outline'}
                          size={20}
                          color={closeAfterRegister ? '#16a34a' : '#475569'}
                        />
                        <Text className="text-sm text-slate-900">Cerrar mantenimiento al guardar</Text>
                      </View>
                      <Text className="text-xs text-slate-500">{closeAfterRegister ? 'Sí' : 'No'}</Text>
                    </View>
                    <Text className="text-xs text-slate-500 mt-1">
                      Si está activado, el equipo se marcará disponible y se actualizará el último mantenimiento.
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {mode === 'report_incident' && selected ? (
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        await setEquipmentStatus({ equipmentId: selected.id, status: 'dañado' });
                      } catch (error) {
                        Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo actualizar el estado');
                      }
                    }}
                    className="bg-red-50 border border-red-200 rounded-lg p-3"
                  >
                    <View className="flex-row items-center gap-2">
                      <MaterialCommunityIcons name="alert-circle" size={18} color="#ef4444" />
                      <Text className="text-sm text-red-900">Este incidente marcará el equipo como dañado</Text>
                    </View>
                  </TouchableOpacity>
                ) : null}

                <View className="flex-row gap-2 pt-2">
                  <TouchableOpacity
                    onPress={() => setShowActionModal(false)}
                    className="flex-1 py-3 bg-slate-200 rounded-lg items-center"
                  >
                    <Text className="text-slate-700 font-semibold">Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => void handleConfirm()}
                    className="flex-1 py-3 bg-sky-500 rounded-lg items-center"
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
