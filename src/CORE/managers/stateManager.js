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
    set: (k, v) => localStorage.setItem(k, v)
  },
  session: {
    get: (k) => sessionStorage.getItem(k),
    set: (k, v) => sessionStorage.setItem(k, v)
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
      assignments: []      // siempre array en memoria
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

  markAssignmentComplete(assignmentName, key = "submissionstatus", value = "submitted") {
    let list = this.state.assignments;

    if (!Array.isArray(list)) {
      console.warn("Assignments no es array en memoria. Normalizando.");
      list = [];
    }

    const index = list.findIndex(a => a.name === assignmentName);

    if (index === -1) {
      list.push({
        id: assignmentName,
        name: assignmentName,
        [key]: value
      });
    } else {
      list[index][key] = value;
    }

    this.state.assignments = list;
    this.save("assignments");

    emitEvent("state:assignments:changed", list);
  }

  save(key) {
    const engine = PERSISTENCE_MAP[key];
    if (!engine) return;

    try {
      const json = JSON.stringify(this.state[key]);
      storageEngines[engine].set(`${STORAGE_KEY}:${key}`, json);
    } catch (e) {
      console.error(`SM Error al guardar ${key}`, e);
    }
  }

  load() {
    Object.keys(this.state).forEach((key) => {
      const engine = PERSISTENCE_MAP[key];
      if (!engine) return;

      try {
        const raw = storageEngines[engine].get(`${STORAGE_KEY}:${key}`);
        if (raw != null) {
          const parsed = JSON.parse(raw);
          this.state[key] = parsed;
        }
      } catch (e) {
        console.warn(`SM Warning al cargar ${key}`, e);
      }
    });

    // Normalización final para evitar strings accidentales
    if (typeof this.state.assignments === "string") {
      try {
        this.state.assignments = JSON.parse(this.state.assignments);
      } catch {
        this.state.assignments = [];
      }
    }

    if (!Array.isArray(this.state.assignments)) {
      this.state.assignments = [];
    }
  }
}

export const stateManager = new StateManager();
