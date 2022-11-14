import {createApp} from 'vue';
import App from '/@/App.vue';
import cmdTerminal from '/@/components/cmdTerminal.vue';
const app = createApp(App);
import STable from '/@/components/STable/index.vue';
import 'element-plus/dist/index.css';
import './global.scss';

app.component('CmdTerminal', cmdTerminal);
app.component('STable', STable);

app.mount('#app');
