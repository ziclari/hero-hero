// CORE/state/StateManager.js
import { emitEvent } from "../events/eventBus";
import { getStorageKey } from "../config-parser/getPath";

const STORAGE_KEY = getStorageKey();

const PERSISTENCE_MAP = {
  slideIndex: "session",
  currentSceneFile: "session",
  activeElements: "session",
  videoId: "session",
  assignments: "session",
  score: "local",
  current_role: "local"
};

const storageEngines = {
  local: {
    get: (k) => localStorage.getItem(k),
    set: (k, v) => localStorage.setItem(k, v),
  },
  session: {
    get: (k) => sessionStorage.getItem(k),
    set: (k, v) => sessionStorage.setItem(k, v),
  }
};


class StateManager {
  constructor() {
    this.state = {
      slideIndex: 0,
      currentSceneFile: null,
      activeElements: {},
      videoId: null,
      score: 0,
      current_role: null,
      assignments: {}
    };

    this.load();
  }

  get(key) {
    return key ? this.state[key] : this.state;
  }

  set(key, value) {
    let finalValue = value;

    if (typeof value === "string" && value.startsWith("+")) {
      const add = parseInt(value.substring(1), 10) || 0;
      finalValue = (this.state[key] || 0) + add;
    } else if (value === "true") finalValue = true;
    else if (value === "false") finalValue = false;

    this.state[key] = finalValue;

    emitEvent(`state:${key}:changed`, finalValue);
    this.save(key);
  }

  markAssignmentComplete(assignmentName, key = "status", value = "submitted") {
    let raw = this.state.assignments;
  
    // Parsear si viene en string
    if (typeof raw === "string") {
      try {
        raw = JSON.parse(raw);
      } catch {
        console.error("Assignments corruptos en stateManager");
        return;
      }
    }
  
    if (!Array.isArray(raw)) {
      console.error("Assignments no es un array");
      return;
    }
  
    // Buscar
    const index = raw.findIndex(a => a.name === assignmentName);
    if (index === -1) {
      const virtualAssignment = {
        id: assignmentName,
        name: assignmentName,
        submissionstatus: "submitted"
      };
      // Asignar la key sin romper el objeto original de Moodle
      raw.push(virtualAssignment);
      // Guardar
      this.state.assignments = JSON.stringify(raw);
      this.save("assignments");
    }
  
    emitEvent("state:assignments:changed", raw);
  }
  

  save(key) {
    const engine = PERSISTENCE_MAP[key];
    if (!engine) return;

    try {
      storageEngines[engine].set(
        `${STORAGE_KEY}:${key}`,
        JSON.stringify(this.state[key])
      );
    } catch (e) {
      console.error(`SM Error al guardar ${key}`, e);
    }
  }

  load() {
    Object.keys(this.state).forEach((key) => {
      const engine = PERSISTENCE_MAP[key];
      if (!engine) return;

      try {
        const data = storageEngines[engine].get(`${STORAGE_KEY}:${key}`);
        if (data != null) {
          this.state[key] = JSON.parse(data);
        }
      } catch (e) {
        console.warn(`SM Warning al cargar ${key}`, e);
      }
    });
  }
}

export const stateManager = new StateManager();
