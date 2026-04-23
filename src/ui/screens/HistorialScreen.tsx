import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useAppStore, type HistoryEntry } from '@/src/state/appStore';

type ScreenProps = {
  titlePrefix?: string;
  onBack?: () => void;
};

type Kind = HistoryEntry['kind'];
type Status = HistoryEntry['status'];

const statusMeta: Record<Status, { label: string; color: string; bg: string; icon: any }> = {
  resuelto: { label: 'Resuelto', color: '#16a34a', bg: '#16a34a20', icon: 'check-circle' },
  en_proceso: { label: 'En proceso', color: '#f59e0b', bg: '#f59e0b20', icon: 'progress-wrench' },
  pendiente: { label: 'Pendiente', color: '#ef4444', bg: '#ef444420', icon: 'alert-circle' },
};

const kindMeta: Record<Kind, { label: string; icon: any; color: string }> = {
  mantenimiento: { label: 'Mantenimiento', icon: 'wrench', color: '#0ea5e9' },
  incidente: { label: 'Incidente', icon: 'bug', color: '#7c3aed' },
};

export function HistorialScreen({ titlePrefix = '', onBack }: ScreenProps) {
  const { state } = useAppStore();
  const [query, setQuery] = useState('');
  const [filterKind, setFilterKind] = useState<'Todos' | Kind>('Todos');
  const [filterStatus, setFilterStatus] = useState<'Todos' | Status>('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<HistoryEntry | null>(null);

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.history
      .filter((item) => {
        if (filterKind !== 'Todos' && item.kind !== filterKind) return false;
        if (filterStatus !== 'Todos' && item.status !== filterStatus) return false;
        if (!q) return true;
        const haystack = [
          item.equipmentSerialNumber,
          item.title,
          item.description,
          item.technician ?? '',
          item.resolution ?? '',
          item.maintenanceType ?? '',
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      })
      .slice()
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [state.history, query, filterKind, filterStatus]);

  const renderItem = ({ item }: { item: HistoryEntry }) => {
    const s = statusMeta[item.status];
    const k = kindMeta[item.kind];
    return (
      <TouchableOpacity
        onPress={() => setSelected(item)}
        className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-slate-200"
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: k.color + '20' }}>
                <MaterialCommunityIcons name={k.icon} size={18} color={k.color} />
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 font-semibold" numberOfLines={1}>
                  {item.title}
                </Text>
                <Text className="text-xs text-slate-500" numberOfLines={1}>
                  {item.equipmentSerialNumber}
                </Text>
              </View>
            </View>

            <Text className="text-xs text-slate-600" numberOfLines={2}>
              {item.description}
            </Text>

            <View className="flex-row flex-wrap gap-2 mt-3">
              <View className="px-2 py-1 rounded-full" style={{ backgroundColor: s.bg }}>
                <View className="flex-row items-center gap-1.5">
                  <MaterialCommunityIcons name={s.icon} size={14} color={s.color} />
                  <Text className="text-xs" style={{ color: s.color }}>
                    {s.label}
                  </Text>
                </View>
              </View>
              <View className="px-2 py-1 rounded-full bg-slate-100">
                <Text className="text-xs text-slate-700">
                  {k.label}{item.maintenanceType ? ` · ${item.maintenanceType}` : ''}
                </Text>
              </View>
              <View className="px-2 py-1 rounded-full bg-slate-100">
                <Text className="text-xs text-slate-700">{item.createdAt}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
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
              <Text className="text-2xl font-bold text-slate-900">{titlePrefix}Historial</Text>
              <Text className="text-sm text-slate-600">{data.length} registros</Text>
            </View>
          </View>

          <View className="relative mb-3">
            <MaterialCommunityIcons name="magnify" size={20} color="#64748b" style={{ position: 'absolute', left: 12, top: 12 }} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar por serie, técnico, descripción..."
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
                  {(['Todos', 'mantenimiento', 'incidente'] as const).map((k) => (
                    <TouchableOpacity
                      key={k}
                      onPress={() => setFilterKind(k as any)}
                      className={`px-3 py-1 rounded-full border ${filterKind === k ? 'bg-sky-500 border-sky-500' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <Text className={`text-xs ${filterKind === k ? 'text-white' : 'text-slate-900'}`}>
                        {k === 'Todos' ? 'Todos' : kindMeta[k].label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-sm font-semibold text-slate-900 mb-2">Estado</Text>
                <View className="flex-row flex-wrap gap-2">
                  {(['Todos', 'resuelto', 'en_proceso', 'pendiente'] as const).map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setFilterStatus(s as any)}
                      className={`px-3 py-1 rounded-full border ${filterStatus === s ? 'bg-sky-500 border-sky-500' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <Text className={`text-xs ${filterStatus === s ? 'text-white' : 'text-slate-900'}`}>
                        {s === 'Todos' ? 'Todos' : statusMeta[s].label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          ) : null}

          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View className="bg-white rounded-lg p-6 items-center justify-center">
                <Text className="text-slate-500">No hay registros con esos filtros</Text>
              </View>
            }
          />
        </View>
      </ScrollView>

      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-2xl max-h-[90%]">
            <View className="p-4 border-b border-slate-200 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-slate-900">Detalle</Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <MaterialCommunityIcons name="close" size={24} color="#475569" />
              </TouchableOpacity>
            </View>

            {selected ? (
              <ScrollView className="p-4">
                <View className="space-y-4">
                  <View className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <Text className="text-xs text-slate-600 mb-1">Equipo</Text>
                    <Text className="text-slate-900 font-semibold">{selected.equipmentSerialNumber}</Text>
                  </View>

                  <View className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <Text className="text-xs text-slate-600 mb-1">Registro</Text>
                    <Text className="text-slate-900 font-semibold">{selected.title}</Text>
                    <Text className="text-slate-700 mt-1">{selected.description}</Text>
                  </View>

                  <View className="flex-row flex-wrap gap-2">
                    <View className="px-2 py-1 rounded-full bg-slate-100">
                      <Text className="text-xs text-slate-700">{kindMeta[selected.kind].label}</Text>
                    </View>
                    <View className="px-2 py-1 rounded-full" style={{ backgroundColor: statusMeta[selected.status].bg }}>
                      <Text className="text-xs" style={{ color: statusMeta[selected.status].color }}>
                        {statusMeta[selected.status].label}
                      </Text>
                    </View>
                    <View className="px-2 py-1 rounded-full bg-slate-100">
                      <Text className="text-xs text-slate-700">Creado: {selected.createdAt}</Text>
                    </View>
                    {selected.closedAt ? (
                      <View className="px-2 py-1 rounded-full bg-slate-100">
                        <Text className="text-xs text-slate-700">Cerrado: {selected.closedAt}</Text>
                      </View>
                    ) : null}
                    {selected.maintenanceType ? (
                      <View className="px-2 py-1 rounded-full bg-slate-100">
                        <Text className="text-xs text-slate-700">Tipo: {selected.maintenanceType}</Text>
                      </View>
                    ) : null}
                    {selected.technician ? (
                      <View className="px-2 py-1 rounded-full bg-slate-100">
                        <Text className="text-xs text-slate-700">Técnico: {selected.technician}</Text>
                      </View>
                    ) : null}
                  </View>

                  {selected.resolution ? (
                    <View className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <View className="flex-row items-start gap-2">
                        <MaterialCommunityIcons name="check-circle" size={18} color="#16a34a" />
                        <View className="flex-1">
                          <Text className="text-xs text-green-700 mb-1">Resolución</Text>
                          <Text className="text-green-900">{selected.resolution}</Text>
                        </View>
                      </View>
                    </View>
                  ) : null}
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}
