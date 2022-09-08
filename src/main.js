import { createApp } from "vue";
import App from "./App.vue";
import "es6-promise/auto";
import { createStore } from "vuex";
import store from "./store";

import { Quasar } from "quasar";
import quasarUserOptions from "./quasar-user-options";



const app = createApp(App).use(Quasar, quasarUserOptions);

app.use(createStore(store));


app.mount("#app");
app.config.globalProperties.getnerapi ='http://omeaks-python-import.ccstw.nccu.edu.tw:7851';
app.config.globalProperties.getnerapitags = 'http://omeaks-python-import.ccstw.nccu.edu.tw:7851/tags';
app.config.globalProperties.getner= 'http://omeaks-python-import.ccstw.nccu.edu.tw:7851/extractions'
