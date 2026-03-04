import os
import time
import numpy as np
import sounddevice as sd
import webrtcvad
from scipy.io.wavfile import write
from dotenv import load_dotenv
from openai import OpenAI

# ===============================
# Load Environment Variables
# ===============================

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL")
)

# ===============================
# Audio Configuration
# ===============================

SAMPLE_RATE = 16000
FRAME_DURATION = 20
FRAME_SIZE = int(SAMPLE_RATE * FRAME_DURATION / 1000)

INITIAL_SILENCE_LIMIT = 4
POST_SPEECH_SILENCE = 4

vad = webrtcvad.Vad(2)

# ===============================
# Main Listening Function
# ===============================

def listen_and_transcribe():

    print("🎤 Listening... Speak now")

    audio_buffer = []
    speech_started = False
    silence_frames = 0

    SILENCE_FRAME_LIMIT = int((1000 / FRAME_DURATION) * POST_SPEECH_SILENCE)

    start_listening_time = time.time()

    with sd.InputStream(
            samplerate=SAMPLE_RATE,
            channels=1,
            dtype='int16',
            blocksize=FRAME_SIZE
    ) as stream:

        while True:

            # Initial silence timeout
            if not speech_started:
                if time.time() - start_listening_time >= INITIAL_SILENCE_LIMIT:
                    print("🛑 No speech detected in 4 seconds.")
                    break

            frame, _ = stream.read(FRAME_SIZE)
            frame_bytes = frame.tobytes()

            is_speech = vad.is_speech(frame_bytes, SAMPLE_RATE)

            audio_buffer.append(frame)

            if is_speech:

                if not speech_started:
                    speech_started = True
                    print("🗣 Speech detected...")

                silence_frames = 0

            else:

                if speech_started:
                    silence_frames += 1

            # Post speech silence stop
            if speech_started and silence_frames >= SILENCE_FRAME_LIMIT:
                print("🛑 User stopped speaking.")
                break

    # ===============================
    # Transcription Section
    # ===============================

    final_text = ""

    if len(audio_buffer) > 0:

        audio_data = np.concatenate(audio_buffer)
        write("temp.wav", SAMPLE_RATE, audio_data)

        print("🚀 Sending audio to Whisper API...")

        with open("temp.wav", "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language="en"
            )

        final_text = transcript.text

        print("📝 Transcription Output:")
        print(final_text)

    else:
        print("❌ No audio recorded")

    return final_text


# ===============================
# Run System
# ===============================

if __name__ == "__main__":
    result = listen_and_transcribe()
    print("🔷 Final Returned String:")
    print(result)
    