import * as Tone from 'tone'

class ToneSampler {
  private sampler: Tone.Sampler | null = null
  private isInitialized = false

  async initialize() {
    if (this.isInitialized) return

    try {
      // Initialize Tone.js
      await Tone.start()

      // Create a sampler with piano sounds
      // Using a simple synth for now - can be replaced with actual piano samples
      this.sampler = new Tone.Sampler({
        urls: {
          A0: 'A0.mp3',
          C1: 'C1.mp3',
          'D#1': 'Ds1.mp3',
          'F#1': 'Fs1.mp3',
          A1: 'A1.mp3',
          C2: 'C2.mp3',
          'D#2': 'Ds2.mp3',
          'F#2': 'Fs2.mp3',
          A2: 'A2.mp3',
          C3: 'C3.mp3',
          'D#3': 'Ds3.mp3',
          'F#3': 'Fs3.mp3',
          A3: 'A3.mp3',
          C4: 'C4.mp3',
          'D#4': 'Ds4.mp3',
          'F#4': 'Fs4.mp3',
          A4: 'A4.mp3',
          C5: 'C5.mp3',
          'D#5': 'Ds5.mp3',
          'F#5': 'Fs5.mp3',
          A5: 'A5.mp3',
          C6: 'C6.mp3',
          'D#6': 'Ds6.mp3',
          'F#6': 'Fs6.mp3',
          A6: 'A6.mp3',
          C7: 'C7.mp3',
          'D#7': 'Ds7.mp3',
          'F#7': 'Fs7.mp3',
          A7: 'A7.mp3',
          C8: 'C8.mp3',
        },
        release: 1,
        baseUrl: '/audio/piano/',
      }).toDestination()

      // Fallback to synth if sampler fails to load
      this.sampler.onerror = () => {
        console.warn('Sampler failed to load, using synth fallback')
        this.sampler = null
      }

      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize Tone.js:', error)
      // Fallback to basic synth
      this.sampler = null
    }
  }

  async playChord(notes: string[], duration: number = 0.5) {
    await this.initialize()

    try {
      if (this.sampler) {
        // Use sampler if available
        notes.forEach((note) => {
          this.sampler?.triggerAttackRelease(note, duration)
        })
      } else {
        // Fallback to synth
        const synth = new Tone.PolySynth(Tone.Synth).toDestination()
        synth.triggerAttackRelease(notes, duration)
        setTimeout(() => synth.dispose(), duration * 1000 + 100)
      }
    } catch (error) {
      console.error('Error playing chord:', error)
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
}

export const toneSampler = new ToneSampler()

