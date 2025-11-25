// CORE/state/StateManager.js
import { emitEvent } from "../events/eventBus";
import { getStorageKey } from "../config-parser/getPath";
const STORAGE_KEY = getStorageKey();

class StateManager {
  constructor() {
    this.state = {
      // Estado centralizado para el flujo (Estos valores son LEÍDOS por React)
      slideIndex: 0,
      currentSceneFile: null,
      activeElements: {},
      videoId: null,
      // Variables de Bifurcación y Puntuación (Estado de la Simulación)
      score: 0,
      current_role: null,
      assignments: {}, // Estado de las entregas (sustituye sessionStorage)
    };
    this.load(); // Carga el estado guardado al iniciar
  }

  // -------------------------
  // 1. LECTURA (GET)
  // -------------------------
  get(key) {
    if (key) return this.state[key];
    return this.state;
  }

  // -------------------------
  // 2. ESCRITURA (SET) - Única forma de cambiar el estado
  // -------------------------
  set(key, value) {
    let finalValue = value;

    // Manejo de la lógica de sumas (ej. value: "+10")
    if (typeof value === 'string' && value.startsWith('+')) {
      const addedValue = parseInt(value.substring(1), 10) || 0;
      finalValue = (this.state[key] || 0) + addedValue;
    } else if (value === 'true') {
      finalValue = true;
    } else if (value === 'false') {
      finalValue = false;
    }

    this.state[key] = finalValue;

    // NOTIFICACIÓN: El SM anuncia el cambio via Event Bus
    emitEvent(`state:${key}:changed`, finalValue);
    this.save();
  }

  // -------------------------
  // 3. LÓGICA ESPECÍFICA (Limpieza de Action Executor)
  // -------------------------
  markAssignmentComplete(assignmentName) {
    this.state.assignments[assignmentName] = {
      status: 'submitted',
      timestamp: Date.now()
    };
    emitEvent(`state:assignments:changed`, this.state.assignments);
    this.save();
  }

  // -------------------------
  // 4. PERSISTENCIA
  // -------------------------
  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error("SM Error: No se pudo guardar el estado", e);
    }
  }

  load() {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Sobreescribe el estado inicial con el guardado
        this.state = { ...this.state, ...parsedState };
      }
    } catch (e) {
      console.warn("SM Warning: No se pudo cargar el estado guardado.", e);
    }
  }
}

export const stateManager = new StateManager();