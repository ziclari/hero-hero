// CORE/render/UIController.js
import { stateManager } from "../managers/stateManager";
import { submitAssignment } from "../external-services/moodle-service/moodleService";

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
        const current = stateManager.get("slideIndex");
        stateManager.set("slideIndex", Math.max(current - 1, 0));
    },

    nextSlide() {
        const i = stateManager.get("slideIndex");
        const max = stateManager.get("slideCount") || 0;
        stateManager.set("slideIndex", Math.min(i + 1, max - 1));
    },

    gotoScene(filename) {
        stateManager.set("currentSceneFile", `${filename}.yaml`);
        stateManager.set("slideIndex", 0);
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
            new Audio(src).play().catch(() => {});
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
    // ACTION DISPATCHER
    // ---------------------------------------
    async execute(action, scene = null) {
        if (!action) return;

        const actions = Array.isArray(action) ? action : [action];

        for (const a of actions) {
            let type, arg;

            if (typeof a === "string") {
                [type, arg] = a.split(":");
            } else if (typeof a === "object" && a.type) {
                type = a.type.replace(":", "");
                arg = a.arg || null;
            } else {
                console.error("Acción inválida", a);
                continue;
            }

            switch (type) {
                case "show": this.showElement(arg); break;
                case "hide": this.hideElement(arg); break;
                case "mark_inactive": this.markInactive(arg); break;

                case "previous_slide": this.previousSlide(); break;
                case "next_slide": this.nextSlide(); break;
                case "goto_scene": this.gotoScene(arg); break;

                case "play_video": this.playVideo(arg); break;
                case "play_sound": this.playSound(arg, scene); break;
                case "audio_finished": this.audioFinished(); break;

                case "wait": this.wait(arg); break;

                case "upload_file": await this.uploadFile(a); break;

                case "mark_complete": this.markComplete(arg); break;

                default:
                    console.warn("Acción no reconocida:", a);
            }
        }
    }
};
