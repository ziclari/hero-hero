import { stateManager } from "../managers/stateManager";
import { submitAssignment } from "../external-services/moodle-service/moodleService";
import { emitEvent } from "../events/eventBus";
import { getPath } from "../config-parser/getPath";
// UIController: central dispatcher / bridge between YAML actions and runtime
export const UIController = {

    // ---------------------------------------
    // ELEMENTS
    // ---------------------------------------
    showElement(id) {
        const current = stateManager.get("activeElements") || {};
        stateManager.set("activeElements", { ...current, [id]: true });
    },

    hideElement(id) {
        const current = stateManager.get("activeElements") || {};
        stateManager.set("activeElements", { ...current, [id]: false });
    },

    markInactive(id) {
        const current = stateManager.get("activeElements") || {};
        stateManager.set("activeElements", {
            ...current,
            [id]: { status: "inactive" }
        });
    },

    // ---------------------------------------
    // NAVIGATION
    // ---------------------------------------
    previousSlide() {
        const current = stateManager.get("slideIndex") || 0;
        stateManager.set("slideIndex", Math.max(current - 1, 0));
    },

    nextSlide() {
        const i = stateManager.get("slideIndex") || 0;
        const max = stateManager.get("slideCount") || 0;
        stateManager.set("slideIndex", Math.min(i + 1, max - 1));
    },
    gotoId(id, scene) {
        if (!scene || !Array.isArray(scene.slides)) return;
    
        const idx = scene.slides.findIndex(s => s.id === id);
        if (idx === -1) {
            console.warn("goto_id: slide no encontrado:", id);
            return;
        }
    
        stateManager.set("slideIndex", idx);
        // Ejecuta reglas como cualquier navegación
        this.applyVisibilityRules(scene);
        // Ejecuta on_enter del slide destino si existe
        const slide = scene.slides[idx];
        if (slide?.on_enter) {
            this.execute(slide.on_enter, scene);
        }
    },    
    // gotoScene now accepts optional scene object (if the loader already has it)
    gotoScene(filename, scene = null) {
        const file = `${filename}.yaml`;
        stateManager.set("currentSceneFile", file);
        stateManager.set("slideIndex", 0);
        if (scene) {
            this.applyVisibilityRules(scene);
            if (scene?.on_enter) {
                this.execute(scene.on_enter, scene);
            }
            const firstSlide = scene.slides?.[0];
            if (firstSlide?.on_enter) {
                this.execute(firstSlide.on_enter, scene);
            }
        }
        // Notify the system a scene change was requested. The scene loader should
        // respond by emitting the scene data or by letting the render layer pull it.
        emitEvent("scene:request", file);
    },

    // ---------------------------------------
    // MEDIA
    // ---------------------------------------
    playVideo(id) {
        stateManager.set("videoId", id);
    },

    playSound(id, scene) {
        try {
            const src = scene?.assets?.audios?.[id]?.src || id;
            const audio = getPath(src);
            new Audio(audio).play().catch(() => {});
        } catch {}
    },

    audioFinished() {
        emitEvent("audio_finished");
    },

    // ---------------------------------------
    // TIMERS
    // ---------------------------------------
    wait(ms) {
        const t = parseInt(ms, 10) || 1000;
        setTimeout(() => emitEvent(`wait_end:${t}`), t);
    },

    // ---------------------------------------
    // FILE UPLOAD
    // ---------------------------------------
    async uploadFile(action) {
        try {
            emitEvent("upload_file_" + action.id);

            const file = action.__file;
            if (!file) throw new Error("No se recibió archivo");

            const result = await submitAssignment(action.assignmentId, file);
            
            const assignments = stateManager.get("assignments");
            const updated = (assignments || []).map((a) =>
                a.id === action.assignmentId
                ? { ...a, submissionstatus: "submitted" }
                : a
            );
            
            stateManager.set("assignments", updated);
            emitEvent("success:upload_file_" + action.id);
            return result;

        } catch (e) {
            emitEvent("error:upload_file_" + action.id);
        }
    },

    // ---------------------------------------
    // COMPLETION LOGIC
    // ---------------------------------------
    markComplete(id) {
        stateManager.markAssignmentComplete(id);
        emitEvent(`success:${id}`);
    },

    // ---------------------------------------
    // STATE HELPERS
    // ---------------------------------------
    // setStateVariable - recibe "key,value" (coma o dos puntos aceptados)
    setStateVariable(arg) {
        if (!arg) return;
        const parts = arg.toString().split(/[:,]/).map(p => p.trim());
        const key = parts[0];
        const rawValue = parts.slice(1).join(":");

        // si viene vacío (por ejemplo "set: has_key,true") rawValue será 'true'
        // Allow numeric, boolean, and explicit +increment strings handled by stateManager
        let value = rawValue;

        // detect boolean literals
        if (rawValue === "true" || rawValue === "false") {
            value = rawValue;
        } else if (!isNaN(Number(rawValue)) && rawValue !== "") {
            // keep numbers as numbers
            value = Number(rawValue);
        }

        console.log(key,value)
        stateManager.set(key, value);
    },

    incrementState(arg) {
        if (!arg) return;
        const parts = arg.toString().split(/[:,]/).map(p => p.trim());
        const key = parts[0];
        const raw = parts[1] || "1";
        const n = parseInt(raw, 10) || 1;
        // stateManager.set handles "+N" prefix)
        stateManager.set(key, `+${n}`);
    },

    decrementState(arg) {
        if (!arg) return;
        const parts = arg.toString().split(/[:,]/).map(p => p.trim());
        const key = parts[0];
        const raw = parts[1] || "1";
        const n = parseInt(raw, 10) || 1;
        stateManager.set(key, `+${-n}`);
    },

    callMethod(arg) {
        if (!arg) return;
        const parts = arg.toString().split(/[:,]/).map(p => p.trim());
        const method = parts[0];
        const param = parts[1];

        // prefer stateManager methods
        if (typeof stateManager[method] === "function") {
            stateManager[method](param);
            return;
        }

        // fallback: UIController own methods
        if (typeof this[method] === "function") {
            this[method](param);
            return;
        }

        console.warn("callMethod: método no encontrado:", method);
    },
    // ---------------------------------------
    // CUSTOM STATE HELPERS
    // ---------------------------------------

    setCustomVariable(arg) {
        if (!arg) return;

        const parts = arg.toString().split(/[:,]/).map(p => p.trim());
        const key = parts[0];

        // Default
        let storageType = "local";
        let rawValue = null;

        // Si parts[1] es local/session → usarlo
        if (parts[1] === "local" || parts[1] === "session") {
            storageType = parts[1];
            rawValue = parts.slice(2).join(":");
        } else {
            // Si no lo es → value directo
            rawValue = parts.slice(1).join(":");
        }

        // Convertir rawValue
        let value = rawValue;

        if (rawValue === "true") value = true;
        else if (rawValue === "false") value = false;
        else if (!isNaN(Number(rawValue))) value = Number(rawValue);
        else {
            try { value = JSON.parse(rawValue); }
            catch { value = rawValue; }
        }

        stateManager.setCustom(key, value, storageType);
    },

    incrementCustom(arg) {
        if (!arg) return;
    
        // Parse básico solo para extraer key, storageType y número
        const parts = arg.toString().split(/[:,]/).map(p => p.trim());
        const key = parts[0];
    
        // Detectar storageType (si existe)
        let storageType = "local";
        let rawValueIndex = 1;
    
        if (parts[1] === "local" || parts[1] === "session") {
            storageType = parts[1];
            rawValueIndex = 2;
        }
    
        // Obtener número de incremento
        const rawIncrement = parts[rawValueIndex] || "1";
        const increment = Number(rawIncrement) || 1;
    
        // Recuperar valor actual
        const current = stateManager.getCustom(key, storageType);
        const base = typeof current === "number" ? current : Number(current) || 0;
    
        const newValue = base + increment;
    
        // Reutiliza completamente la lógica robusta de setCustomVariable
        this.setCustomVariable(`${key}:${storageType}:${newValue}`);
    },
    

    decrementCustom(arg) {
        if (!arg) return;
    
        const parts = arg.toString().split(/[:,]/).map(p => p.trim());
        const key = parts[0];
    
        // Detectar storageType (si existe)
        let storageType = "local";
        let rawValueIndex = 1;
    
        if (parts[1] === "local" || parts[1] === "session") {
            storageType = parts[1];
            rawValueIndex = 2;
        }
    
        // Valor a restar
        const rawDecrement = parts[rawValueIndex] || "1";
        const decrement = Number(rawDecrement) || 1;
    
        // Obtener valor actual
        const current = stateManager.getCustom(key, storageType);
        const base = typeof current === "number" ? current : Number(current) || 0;
    
        const newValue = base - decrement;
    
        // Delegar toda la lógica de parseo/almacenamiento a setCustomVariable
        this.setCustomVariable(`${key}:${storageType}:${newValue}`);
    },

    // ---------------------------------------
    // CONDITION EVALUATION
    // ---------------------------------------
    // evaluateCondition(expr)
    // - expr examples: "state.score > 10", "score >= 5 && has_key"
    // Implementation: creates a limited evaluator using Function + with()
    evaluateCondition(expr) {
        if (!expr) return false;
        try {
          const core = stateManager.get() || {};
      
          // expose custom with helper get()
          const customStore = stateManager.getCustom ? stateManager.getCustom() : {};
          const custom = {
            ...customStore,
            get(key) {
              return stateManager.getCustom ? stateManager.getCustom(key) : undefined;
            }
          };
      
          // ctx incluye core props, state alias y custom
          const ctx = { ...core, state: core, custom };
          
          const func = new Function("ctx", `with (ctx) { return ( ${expr} ); }`);
          return Boolean(func(ctx));
        } catch (e) {
          console.warn("evaluateCondition error", e, expr);
          return false;
        }
    },
    // ---------------------------------------
    // VISIBILITY RULES
    // ---------------------------------------
    // Itera elementos de escena y aplica visible_if
    applyVisibilityRules(scene) {
        if (!scene) return;

        const getElements = (scene) => {
            if (Array.isArray(scene.slides)) {
                const idx = stateManager.get("slideIndex") || 0;
                const slide = scene.slides[idx];
                return slide?.elements || [];
            }
            return scene.elements || [];
        };

        const processElement = (el) => {
            if (!el) return;
            // visible_if
            const vid = el.visible_if || el.visibleIf || el.visibleIfCondition;
            if (vid && el.id) {
                const visible = this.evaluateCondition(vid);
                visible ? this.showElement(el.id) : this.hideElement(el.id);
            }

            // enabled_if
            const enableExpr = el.enabled_if || el.enabledIf;
            if (enableExpr && el.id) {
                const enabled = this.evaluateCondition(enableExpr);
                const current = stateManager.get("activeElements") || {};
                stateManager.set("activeElements", {
                    ...current,
                    [el.id]: { ...(current[el.id] || {}), enabled }
                });
            }

            // Si tiene hijos, procesarlos también
            if (Array.isArray(el.elements)) {
                for (const child of el.elements) {
                    processElement(child);
                }
            }
        };
        const elements = getElements(scene);
        for (const el of elements) {
            processElement(el);
        }
    },  

    // ---------------------------------------
    // ACTION DISPATCHER
    // ---------------------------------------
    async execute(action, scene = null) {
        if (!action) return;

        const actions = Array.isArray(action) ? action : [action];

        for (const a of actions) {
            // support shape: string e.g. "show:header" or object { type: 'show', arg: 'header' }
            let type, arg, raw;

            if (typeof a === "string") {
                raw = a;
                const split = a.split(":");
                type = split[0];
                arg = split.slice(1).join(":");
            } else if (typeof a === "object" && a.type) {
                type = a.type.toString().replace(/^:/, "");
                arg = a.arg !== undefined ? a.arg : a.value;
            } else {
                console.error("Acción inválida", a);
                continue;
            }

            // Normalize
            type = type && type.trim();

            switch (type) {
                // ELEMENTS
                case "show": this.showElement(arg); break;
                case "hide": this.hideElement(arg); break;
                case "mark_inactive": this.markInactive(arg); break;

                // NAVIGATION
                case "previous_slide": this.previousSlide(); break;
                case "next_slide": this.nextSlide(); break;
                case "goto_scene": this.gotoScene(arg, scene); break;

                // MEDIA
                case "play_video": this.playVideo(arg); break;
                case "play_sound": this.playSound(arg, scene); break;
                case "audio_finished": this.audioFinished(); break;

                // TIMERS
                case "wait": this.wait(arg); break;

                // UPLOAD
                case "upload_file": await this.uploadFile(a); break;

                // COMPLETION
                case "mark_complete": this.markComplete(arg); break;
                case "end": emitEvent(`end:${arg}`); break;

                // STATE OPERATIONS
                case "set": this.setStateVariable(arg); break;
                case "inc": this.incrementState(arg); break;
                case "dec": this.decrementState(arg); break;
                case "call": this.callMethod(arg); break;
                case "custom_set":
                    this.setCustomVariable(arg);
                    break;
                
                case "custom_inc":
                    this.incrementCustom(arg);
                    break;
                
                case "custom_dec":
                    this.decrementCustom(arg);
                    break;                
                // CONDITIONAL ACTION (object form recommended):
                // { type: 'if', arg: 'score > 10', actions: [ 'goto_scene:win' ] }
                case "if": {
                    const cond = arg;
                    const should = this.evaluateCondition(cond);
                    if (should && a.actions) {
                        await this.execute(a.actions, scene);
                    }
                    break;
                }
                case "goto_id":
                    this.gotoId(arg, scene);
                    break;

                default:
                    console.warn("Acción no reconocida:", a);
            }
        }
        // After running actions, re-evaluate scene visibility if scene provided
        if (scene) this.applyVisibilityRules(scene);
    }
};
