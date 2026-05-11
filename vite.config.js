import {defineConfig} from 'vite'
import react, {reactCompilerPreset} from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import {VitePWA} from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {

                "short_name": "K.",
                "name": "K'Lo.Sch",
                "description": "지도 및 메모",
                "icons": [
                    {
                        "src": "favicon.ico",
                        "sizes": "64x64 32x32 24x24 16x16",
                        "type": "image/x-icon"
                    },
                    {
                        "src": "logo192.png",
                        "type": "image/png",
                        "sizes": "192x192",
                        "purpose": "any maskable"
                    },
                    {
                        "src": "logo512.png",
                        "type": "image/png",
                        "sizes": "512x512",
                        "purpose": "any maskable"
                    }
                ],
                "start_url": ".",
                "display": "standalone",
                "theme_color": "#000000",
                "background_color": "#ffffff",
                "orientation": "portrait"

            }
        }),
        react(), babel({presets: [reactCompilerPreset()]})
    ],
    base: '/ScheduleManager'
})
