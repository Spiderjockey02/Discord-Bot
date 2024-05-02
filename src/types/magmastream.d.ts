import { User } from 'discord.js';

declare module 'magmastream' {
  interface Track {
    readonly requester: User | null
  }

  interface Player {
    previousTracks: Track[]
    timeout: null | Timeout
  }

}