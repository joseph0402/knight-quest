import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  isMuted: boolean;
  isInitialized: boolean;
  
  // Control functions
  initializeAudio: () => void;
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  playBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;
  playDamage: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  isMuted: true, // Start muted by default
  isInitialized: false,
  
  initializeAudio: () => {
    const { isInitialized } = get();
    if (isInitialized) return;
    
    try {
      // Load background music
      const backgroundMusic = new Audio('/sounds/background.mp3');
      backgroundMusic.loop = true;
      backgroundMusic.volume = 0.3;
      
      // Load hit sound
      const hitSound = new Audio('/sounds/hit.mp3');
      hitSound.volume = 0.5;
      
      // Load success sound
      const successSound = new Audio('/sounds/success.mp3');
      successSound.volume = 0.7;
      
      set({ 
        backgroundMusic, 
        hitSound, 
        successSound, 
        isInitialized: true 
      });
      
      console.log('Audio initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  },
  
  toggleMute: () => {
    const { isMuted, backgroundMusic } = get();
    const newMutedState = !isMuted;
    
    // Update the muted state
    set({ isMuted: newMutedState });
    
    // Only pause when muting, let game state control playback
    if (backgroundMusic && newMutedState) {
      backgroundMusic.pause();
    }
    
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },

  playBackgroundMusic: () => {
    const { backgroundMusic, isMuted } = get();
    if (backgroundMusic && !isMuted) {
      backgroundMusic.currentTime = 0;
      backgroundMusic.play().catch(error => {
        console.log("Background music play prevented:", error);
      });
    }
  },

  stopBackgroundMusic: () => {
    const { backgroundMusic } = get();
    if (backgroundMusic) {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
    }
  },

  playDamage: () => {
    const { hitSound, isMuted } = get();
    if (hitSound && !isMuted) {
      // Use hit sound for damage as well, but with different volume
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.6; // Slightly louder for damage
      soundClone.playbackRate = 0.8; // Slightly slower for different feel
      soundClone.play().catch(error => {
        console.log("Damage sound play prevented:", error);
      });
    }
  },
  
  playHit: () => {
    const { hitSound, isMuted } = get();
    if (hitSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Hit sound skipped (muted)");
        return;
      }
      
      // Clone the sound to allow overlapping playback
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(error => {
        console.log("Hit sound play prevented:", error);
      });
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Success sound skipped (muted)");
        return;
      }
      
      successSound.currentTime = 0;
      successSound.play().catch(error => {
        console.log("Success sound play prevented:", error);
      });
    }
  }
}));
