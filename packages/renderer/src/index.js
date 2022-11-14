import {createApp} from 'vue';
import App from '/@/App.vue';
import Terminal from '/@/components/terminal.vue';
const app = createApp(App);
import STable from '/@/components/STable/index.vue';
import 'element-plus/dist/index.css';
import './global.scss';

app.component('CmdTerminal', Terminal);
app.component('STable', STable);

app.mount('#app');
