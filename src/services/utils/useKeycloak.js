import {getCurrentInstance} from "vue";

export default function useKeycloak() {
    const internalInstance = getCurrentInstance();
    return internalInstance.appContext.config.globalProperties.$keycloak;
}
