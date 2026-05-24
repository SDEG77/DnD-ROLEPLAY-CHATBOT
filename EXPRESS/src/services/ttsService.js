let edgeTtsModulePromise = null;

// Dungeon Master voice options:
// - en-US-ChristopherNeural: deep, steady narrator
// - en-US-EricNeural: calm and grounded storyteller
// - en-US-GuyNeural: clear, neutral default
// - en-GB-RyanNeural: more theatrical fantasy tone
// - en-AU-WilliamNeural: confident and slightly rugged
const DEFAULT_VOICE = process.env.DM_TTS_VOICE || 'en-US-ChristopherNeural';

// Reading speed options:
// - -18%: slow and ominous
// - -12%: measured dramatic pacing
// - -8%: balanced default
// - -4%: slightly quicker while still cinematic
// - +0%: normal conversational speed
const DEFAULT_RATE = process.env.DM_TTS_RATE || '-12%';

const DEFAULT_PITCH = process.env.DM_TTS_PITCH || '-8Hz';
const DEFAULT_FORMAT = 'audio-24khz-96kbitrate-mono-mp3';

async function loadEdgeTts() {
  if (!edgeTtsModulePromise) {
    edgeTtsModulePromise = import('@seepine/edge-tts');
  }

  return edgeTtsModulePromise;
}

async function synthesizeDungeonMasterSpeech(text) {
  if (!text?.trim()) {
    throw new Error('Text is required to synthesize speech.');
  }

  const { EdgeTTS } = await loadEdgeTts();
  const tts = new EdgeTTS({
    voice: DEFAULT_VOICE,
    lang: 'en-US',
    outputFormat: DEFAULT_FORMAT,
    rate: DEFAULT_RATE,
    pitch: DEFAULT_PITCH,
  });

  const result = await tts.call(text.trim());
  const audioBuffer = Buffer.isBuffer(result?.data)
    ? result.data
    : Buffer.from(result?.data || []);

  if (!audioBuffer.length) {
    throw new Error('No audio was generated for the requested speech.');
  }

  return {
    audioBuffer,
    contentType: 'audio/mpeg',
  };
}

module.exports = {
  synthesizeDungeonMasterSpeech,
};
