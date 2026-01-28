import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, Shield, Sword, Target, Zap, Heart, 
  Battery, Eye, Crown, Gem, Crosshair, Flame,
  Brain, ShieldCheck, RefreshCw, HardHat, Award, Anchor
} from "lucide-react";
import type { InventoryItem } from "@/lib/api";

interface InventoryPanelProps {
  inventory: InventoryItem[];
  onEquip: (itemId: string) => void;
  onUnequip: (itemId: string) => void;
  playerLevel: number;
}

const RARITY_COLORS: Record<string, string> = {
  common: "text-gray-400 border-gray-600",
  uncommon: "text-green-400 border-green-600",
  rare: "text-blue-400 border-blue-600",
  epic: "text-purple-400 border-purple-600",
  legendary: "text-yellow-400 border-yellow-600",
};

const RARITY_BG: Record<string, string> = {
  common: "bg-gray-900/50",
  uncommon: "bg-green-900/30",
  rare: "bg-blue-900/30",
  epic: "bg-purple-900/30",
  legendary: "bg-yellow-900/20",
};

const SLOT_LABELS: Record<string, string> = {
  weapon: "Weapon",
  armor: "Armor",
  helmet: "Helmet",
  accessory: "Accessory",
  consumable: "Consumable",
  module: "Module",
};

function getIcon(iconName: string) {
  const icons: Record<string, React.ReactNode> = {
    package: <Package className="w-5 h-5" />,
    shield: <Shield className="w-5 h-5" />,
    sword: <Sword className="w-5 h-5" />,
    target: <Target className="w-5 h-5" />,
    zap: <Zap className="w-5 h-5" />,
    heart: <Heart className="w-5 h-5" />,
    battery: <Battery className="w-5 h-5" />,
    "battery-charging": <Battery className="w-5 h-5" />,
    eye: <Eye className="w-5 h-5" />,
    crown: <Crown className="w-5 h-5" />,
    gem: <Gem className="w-5 h-5" />,
    crosshair: <Crosshair className="w-5 h-5" />,
    flame: <Flame className="w-5 h-5" />,
    brain: <Brain className="w-5 h-5" />,
    "shield-check": <ShieldCheck className="w-5 h-5" />,
    "refresh-cw": <RefreshCw className="w-5 h-5" />,
    "hard-hat": <HardHat className="w-5 h-5" />,
    badge: <Award className="w-5 h-5" />,
    anchor: <Anchor className="w-5 h-5" />,
  };
  return icons[iconName] || <Package className="w-5 h-5" />;
}

export function InventoryPanel({ inventory, onEquip, onUnequip, playerLevel }: InventoryPanelProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<InventoryItem | null>(null);

  const slots = ["weapon", "armor", "helmet", "accessory", "module", "consumable"];
  
  const filteredInventory = selectedSlot 
    ? inventory.filter(inv => inv.item.slot === selectedSlot)
    : inventory;

  const equippedItems = inventory.filter(inv => inv.equipped);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-orbitron text-cyan-400 text-sm uppercase tracking-wider">Equipment</h3>
        <span className="text-xs text-gray-500">{inventory.length} items</span>
      </div>

      <div className="flex gap-1 mb-3 flex-wrap">
        <button
          onClick={() => setSelectedSlot(null)}
          data-testid="filter-all"
          className={`px-2 py-1 text-xs rounded font-rajdhani transition-all ${
            selectedSlot === null 
              ? "bg-cyan-600/30 text-cyan-300 border border-cyan-500" 
              : "bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600"
          }`}
        >
          All
        </button>
        {slots.map(slot => (
          <button
            key={slot}
            onClick={() => setSelectedSlot(slot)}
            data-testid={`filter-${slot}`}
            className={`px-2 py-1 text-xs rounded font-rajdhani transition-all ${
              selectedSlot === slot 
                ? "bg-cyan-600/30 text-cyan-300 border border-cyan-500" 
                : "bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600"
            }`}
          >
            {SLOT_LABELS[slot]}
          </button>
        ))}
      </div>

      <div className="mb-3 p-2 bg-gray-900/40 rounded border border-gray-800">
        <div className="text-xs text-gray-500 mb-2 font-rajdhani uppercase">Equipped</div>
        <div className="flex gap-2 flex-wrap">
          {equippedItems.length === 0 ? (
            <span className="text-gray-600 text-xs italic">No items equipped</span>
          ) : (
            equippedItems.map(inv => (
              <div
                key={inv.id}
                data-testid={`equipped-${inv.itemId}`}
                className={`p-1.5 rounded border ${RARITY_COLORS[inv.item.rarity]} ${RARITY_BG[inv.item.rarity]} cursor-pointer hover:scale-105 transition-transform`}
                onClick={() => onUnequip(inv.itemId)}
                onMouseEnter={() => setHoveredItem(inv)}
                onMouseLeave={() => setHoveredItem(null)}
                title={`${inv.item.name} (click to unequip)`}
              >
                {getIcon(inv.item.icon)}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        <AnimatePresence>
          {filteredInventory.map(inv => {
            const canEquip = inv.item.requiredLevel <= playerLevel;
            const isConsumable = inv.item.slot === "consumable";
            
            return (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                data-testid={`item-${inv.itemId}`}
                className={`p-2 rounded border ${RARITY_COLORS[inv.item.rarity]} ${RARITY_BG[inv.item.rarity]} ${
                  inv.equipped ? "ring-1 ring-cyan-500" : ""
                }`}
                onMouseEnter={() => setHoveredItem(inv)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded ${RARITY_BG[inv.item.rarity]}`}>
                      {getIcon(inv.item.icon)}
                    </div>
                    <div>
                      <div className="font-rajdhani text-sm font-semibold">
                        {inv.item.name}
                        {inv.quantity > 1 && <span className="ml-1 text-gray-400">x{inv.quantity}</span>}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {inv.item.slot} • {inv.item.rarity}
                      </div>
                    </div>
                  </div>
                  
                  {!isConsumable && (
                    <button
                      onClick={() => inv.equipped ? onUnequip(inv.itemId) : onEquip(inv.itemId)}
                      disabled={!canEquip && !inv.equipped}
                      data-testid={`${inv.equipped ? 'unequip' : 'equip'}-${inv.itemId}`}
                      className={`px-2 py-1 text-xs rounded font-rajdhani transition-all ${
                        inv.equipped 
                          ? "bg-red-900/30 text-red-400 border border-red-700 hover:bg-red-800/40"
                          : canEquip
                            ? "bg-cyan-900/30 text-cyan-400 border border-cyan-700 hover:bg-cyan-800/40"
                            : "bg-gray-900/30 text-gray-600 border border-gray-800 cursor-not-allowed"
                      }`}
                    >
                      {inv.equipped ? "Unequip" : canEquip ? "Equip" : `Lv.${inv.item.requiredLevel}`}
                    </button>
                  )}
                </div>

                {hoveredItem?.id === inv.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2 pt-2 border-t border-gray-700/50"
                  >
                    <p className="text-xs text-gray-400 mb-2">{inv.item.description}</p>
                    
                    {Object.keys(inv.item.statModifiers).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(inv.item.statModifiers).map(([stat, value]) => (
                          <span
                            key={stat}
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              value > 0 ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
                            }`}
                          >
                            {stat}: {value > 0 ? "+" : ""}{value}
                          </span>
                        ))}
                      </div>
                    )}

                    {inv.item.specialEffects.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {inv.item.specialEffects.map(effect => (
                          <span
                            key={effect}
                            className="text-xs px-1.5 py-0.5 rounded bg-purple-900/30 text-purple-400"
                          >
                            {effect.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>Level {inv.item.requiredLevel}+</span>
                      <span>{inv.item.value} credits</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredInventory.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No items found</p>
          </div>
        )}
      </div>
    </div>
  );
}
