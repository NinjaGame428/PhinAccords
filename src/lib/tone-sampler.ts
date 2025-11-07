import * as Tone from 'tone'

class ToneSampler {
  private sampler: Tone.Sampler | null = null
  private isInitialized = false

  async initialize() {
    if (this.isInitialized && this.sampler) return

    try {
      // Initialize Tone.js
      await Tone.start()

      // Use Salamander piano samples (free, high quality piano samples from Tone.js)
      // These are sparse samples that Tone.Sampler will pitch shift to fill gaps
      this.sampler = new Tone.Sampler({
        urls: {
          C4: 'C4.mp3',
          'D#4': 'Ds4.mp3',
          'F#4': 'Fs4.mp3',
          A4: 'A4.mp3',
        },
        release: 1,
        baseUrl: 'https://tonejs.github.io/audio/salamander/',
      }).toDestination()

      // Wait for samples to load
      await Tone.loaded()

      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize piano sampler:', error)
      // Fallback to basic synth if sampler fails
      this.sampler = null
      this.isInitialized = true
    }
  }

  async playChord(notes: string[], duration: number = 0.5) {
    try {
      // Start Tone.js audio context (required for browser autoplay policy)
      if (Tone.context.state !== 'running') {
        await Tone.start()
      }

      // Ensure context is running
      if (Tone.context.state !== 'running') {
        throw new Error('Audio context could not be started. Please interact with the page first.')
      }

      // Initialize sampler if not already done
      if (!this.sampler || !this.isInitialized) {
        await this.initialize()
      }

      // If sampler is available, use it for piano sound
      if (this.sampler) {
        // Play all notes simultaneously using piano sampler
        const now = Tone.now()
        this.sampler.triggerAttackRelease(notes, duration, now)
      } else {
        // Fallback to PolySynth with more piano-like settings
        const synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: {
            type: 'triangle',
          },
          envelope: {
            attack: 0.01,
            decay: 0.1,
            sustain: 0.7,
            release: 0.5,
          },
        }).toDestination()

        synth.volume.value = -8
        const now = Tone.now()
        synth.triggerAttackRelease(notes, duration, now)

        // Clean up after playing
        setTimeout(() => {
          try {
            synth.releaseAll()
            synth.dispose()
          } catch (cleanupError) {
            console.warn('Cleanup error (safe to ignore):', cleanupError)
          }
        }, duration * 1000 + 1000)
      }
    } catch (error) {
      console.error('Error playing chord:', error)
      throw error
    }
  }

  async playNote(note: string, duration: number = 0.5) {
    await this.playChord([note], duration)
  }

  stopAll() {
    if (this.sampler) {
      this.sampler.releaseAll()
    }
    Tone.Transport.stop()
  }

  dispose() {
    if (this.sampler) {
      this.sampler.dispose()
      this.sampler = null
      this.isInitialized = false
    }
  }
}

export const toneSampler = new ToneSampler()

