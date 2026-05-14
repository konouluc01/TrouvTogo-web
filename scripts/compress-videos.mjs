/**
 * Réduit les MP4 sources dans src/assets/video pour le web (H.264, faststart, sans audio).
 * Utilise le binaire embarqué via ffmpeg-static (pas besoin d’installer ffmpeg système).
 *
 * Usage : node scripts/compress-videos.mjs
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpegPath from 'ffmpeg-static'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dir = path.join(__dirname, '../src/assets/video')

if (!ffmpegPath) {
  console.error('ffmpeg-static introuvable.')
  process.exit(1)
}

/** largeur max ; hauteur proportionnelle, pair pour yuv420p */
function compress({ input, output, maxWidth, crf }) {
  const inFile = path.join(dir, input)
  const outFile = path.join(dir, output)
  if (!fs.existsSync(inFile)) {
    console.warn(`[skip] Fichier absent : ${input}`)
    return
  }
  const args = [
    '-y',
    '-i',
    inFile,
    '-an',
    '-vf',
    `scale=${maxWidth}:-2`,
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    String(crf),
    '-profile:v',
    'high',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    outFile,
  ]
  console.log(`\n→ ${output} …`)
  const r = spawnSync(ffmpegPath, args, { stdio: 'inherit' })
  if (r.status !== 0) {
    console.error(`Échec encodage : ${input}`)
    process.exit(r.status ?? 1)
  }
  const before = fs.statSync(inFile).size
  const after = fs.statSync(outFile).size
  const pct = ((1 - after / before) * 100).toFixed(0)
  console.log(
    `   ${(before / 1e6).toFixed(1)} Mo → ${(after / 1e6).toFixed(2)} Mo (−${pct} %)`,
  )
}

console.log('Encodage vidéo (libx264, sans piste audio, compatible navigateur)…')

compress({
  input: '12292095_1920_1080_60fps.mp4',
  output: 'hero-bg.mp4',
  maxWidth: '1280',
  crf: '28',
})

compress({
  input: '3723673-uhd_4096_2160_24fps.mp4',
  output: 'landing-strip.mp4',
  maxWidth: '1280',
  crf: '28',
})

console.log('\nTerminé. Les fichiers hero-bg.mp4 et landing-strip.mp4 sont prêts pour Vite.')
