import {createFileRoute} from '@tanstack/react-router'
import SettingsPage from './-page.js';

export const Route = createFileRoute('/_main/settings/')({
    component: SettingsPage,
});