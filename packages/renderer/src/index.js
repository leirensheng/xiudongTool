import {createApp} from 'vue';
import App from '/@/App.vue';
import cmdTerminal from '/@/components/cmdTerminal.vue';
import { setupStore } from '/@/store/index';
const app = createApp(App);
setupStore(app);
import STable from '/@/components/STable/index.vue';
import 'element-plus/dist/index.css';
import './global.scss';

app.component('CmdTerminal', cmdTerminal);
app.component('STable', STable);

app.mount('#app');
